import { expect, test } from "@playwright/test";
import { z } from "astro/zod";
import { eventTypesSchema, packageSchema, rentalSchema, setupSchema } from "../../src/content-schemas";
import { eventTypesForForms } from "../e2e/event-types";
import { readPackagesInOrder } from "../e2e/packages";
import { readRentalsInOrder } from "../e2e/rentals";

// The editor page at /admin and the build both judge content: the editor by its field definitions,
// the build by the content schemas. This checks the editor's configuration, as the site serves it,
// against the schemas, so the editor never lets the owner save an entry the build would reject.

/** A field as the editor configuration defines it. Fields are required unless `required` is false. */
interface EditorField {
  name: string;
  widget: string;
  required?: boolean;
  options?: string[];
  multiple?: boolean;
  min?: number;
  max?: number;
  value_type?: string;
  default?: unknown;
  media_libraries?: unknown;
  media_library?: unknown;
  /** A regular expression the value must match, and the message shown when it doesn't. */
  pattern?: [string, string];
  /** A list's item field. */
  field?: EditorField;
}

/** The parts of the editor configuration these tests read. */
interface EditorConfig {
  media_folder?: string;
  media_libraries?: {
    default?: unknown;
    cloudinary?: { config?: Record<string, unknown>; output_filename_only?: boolean; use_transformations?: boolean };
  };
  collections: { name: string; fields?: EditorField[]; files?: { name: string; file: string; fields: EditorField[] }[] }[];
}

/** A schema property in JSON Schema form, which is how zod describes it. */
interface SchemaProperty {
  type?: string;
  enum?: string[];
  minLength?: number;
  items?: SchemaProperty;
  minItems?: number;
  maxItems?: number;
  minimum?: number;
  exclusiveMinimum?: number;
  default?: unknown;
}

const schemas = { setups: setupSchema, packages: packageSchema, rentals: rentalSchema };

const cloudinaryPhoto = "https://res.cloudinary.com/likha-events/image/upload/v1760000000/cake-table.jpg";
const samplePhoto = "/samples/placeholder-1.svg";
/** Addresses the content schemas reject: a photo uploaded into the repo, and links to elsewhere. */
const notPhotos = [
  "/uploads/cake-table.jpg",
  "https://example.com/cake-table.jpg",
  "https://res.cloudinary.com/likha-events/video/upload/v1760000000/walkthrough.mp4",
];

/** Whether the editor accepts these values in the field, as Sveltia CMS checks a pattern: against all the values joined with commas. */
function editorAccepts(field: EditorField, values: string[]): boolean {
  return new RegExp(field.pattern![0]).test(values.join(","));
}

/** Which editor widgets can hold each kind of schema value. A date has no JSON Schema type. */
const widgetsFor: Record<string, string[]> = {
  string: ["string", "text", "image", "select"],
  array: ["list", "image"],
  integer: ["number"],
  boolean: ["boolean"],
  undefined: ["datetime"],
};

let config: EditorConfig;
let collections: EditorConfig["collections"];

test.beforeAll(async ({ request }) => {
  const response = await request.get("/admin/config.json");
  expect(response.ok()).toBe(true);
  config = await response.json();
  collections = config.collections;
});

test("the editor has collections for Setups, Packages, Rentals and the Event types list only", () => {
  expect(collections.map((collection) => collection.name).toSorted()).toEqual(["eventTypes", "packages", "rentals", "setups"]);
});

test.describe("the Event types list", () => {
  const listField = () => {
    const files = collections.find((collection) => collection.name === "eventTypes")?.files ?? [];
    expect(files.map((file) => file.file)).toEqual(["src/content/event-types.json"]);
    return files[0].fields.find((field) => field.name === "names");
  };
  const buildAccepts = (name: string) => eventTypesSchema.safeParse({ names: [name] }).success;

  test("is the one field the build reads, a list of names", () => {
    const files = collections.find((collection) => collection.name === "eventTypes")?.files ?? [];
    expect(files[0]?.fields.map((field) => field.name)).toEqual(Object.keys(eventTypesSchema.shape));
    expect(listField()?.widget).toBe("list");
    expect(listField()?.required, "an empty list leaves only Other").toBe(false);
    expect(listField()?.field?.widget).toBe("string");
  });

  test("takes the names the build accepts, and refuses blanks and Other", () => {
    const nameField = listField()!.field!;
    expect(nameField.pattern, "pattern").toBeDefined();
    for (const name of ["Bridal shower", "Wedding", "  Graduation ", "Others", "Brother's 40th"]) {
      expect(editorAccepts(nameField, [name]), name).toBe(true);
      expect(buildAccepts(name), name).toBe(true);
    }
    for (const name of ["", "   ", "Other", "other", " OTHER ", "oThEr"]) {
      expect(editorAccepts(nameField, [name]), JSON.stringify(name)).toBe(false);
      expect(buildAccepts(name), JSON.stringify(name)).toBe(false);
    }
    expect(nameField.pattern![1]).toContain("Other is always there");
  });
});

test("a Setup's Event type is picked from the Event types list plus Other, with none chosen to start", () => {
  const field = collections.find((collection) => collection.name === "setups")?.fields?.find((candidate) => candidate.name === "eventType");
  expect(field?.widget).toBe("select");
  expect(field?.options).toEqual(eventTypesForForms());
  expect(field?.required ?? true, "required").toBe(true);
  expect(field?.default, "default").toBeUndefined();
});

test("a new Package or Rental starts after the last one in display order, so the owner never types one", () => {
  const orderField = (collectionName: string) =>
    collections.find((collection) => collection.name === collectionName)?.fields?.find((field) => field.name === "order");

  expect(orderField("packages")?.default).toBe(readPackagesInOrder().at(-1)!.order + 1);
  expect(orderField("rentals")?.default).toBe(readRentalsInOrder().at(-1)!.order + 1);
});

test("every photo field uploads straight to Cloudinary and stores the photo's URL, never a file in the repo", () => {
  const cloudinary = config.media_libraries?.cloudinary;
  expect(cloudinary?.config?.cloud_name, "cloud name").toEqual(expect.any(String));
  expect(cloudinary?.config?.api_key, "API key").toEqual(expect.any(String));
  expect(cloudinary?.output_filename_only ?? false, "stores the full URL").toBe(false);
  expect(cloudinary?.use_transformations, "stores the original photo's URL").toBe(false);
  expect(config.media_libraries?.default, "upload into the repo").toBe(false);
  expect(config.media_folder, "repo media folder").toBeUndefined();

  const photoFields = collections.flatMap((collection) => collection.fields ?? []).filter((field) => field.widget === "image");
  expect(photoFields.map((field) => field.name).toSorted()).toEqual(["coverPhoto", "photo", "photos"]);
  for (const field of photoFields) {
    expect(field.media_libraries ?? field.media_library, `${field.name} uses its own media library`).toBeUndefined();
  }
});

for (const [collectionName, schema] of Object.entries(schemas)) {
  test.describe(collectionName, () => {
    const jsonSchema = z.toJSONSchema(schema, { io: "input", unrepresentable: "any" });
    const properties = jsonSchema.properties as Record<string, SchemaProperty>;
    const requiredNames = jsonSchema.required ?? [];
    const fieldsOf = () => collections.find((collection) => collection.name === collectionName)?.fields ?? [];

    test("has a field for each schema property, and no others", () => {
      expect(fieldsOf().map((field) => field.name).toSorted()).toEqual(Object.keys(properties).toSorted());
    });

    for (const [name, property] of Object.entries(properties)) {
      test(`the ${name} field matches the schema`, () => {
        const field = fieldsOf().find((candidate) => candidate.name === name);
        expect(field, `no ${name} field`).toBeDefined();
        if (!field) return;

        expect(widgetsFor[String(property.type)]).toContain(field.widget);
        expect(field.required !== false, "required").toBe(requiredNames.includes(name));

        if (property.enum) {
          expect(field.widget).toBe("select");
          expect(field.options).toEqual(property.enum);
        }
        // A select has nothing to type into, so it's enough that the build accepts each of its options.
        if (field.widget === "select") {
          const shape = schema.shape as Record<string, z.ZodType>;
          for (const option of field.options ?? []) expect(shape[name].safeParse(option).success, option).toBe(true);
        }
        if (property.type === "array") {
          if (field.widget === "image") expect(field.multiple, "multiple").toBe(true);
          expect(field.min ?? 0, "min items").toBe(property.minItems ?? 0);
          expect(field.max, "max items").toBe(property.maxItems);
        }
        if (property.type === "integer") {
          expect(field.value_type ?? "int").toBe("int");
          const minimum = property.minimum ?? (property.exclusiveMinimum ?? -Infinity) + 1;
          expect(field.min, "minimum").toBe(minimum);
        }
        if (property.type === "boolean") {
          expect(field.default, "default").toBe(property.default);
        }
        // The schema trims text before checking it isn't empty, so text that's only spaces fails the build.
        for (const [textField, textProperty] of [[field, property], [field.field, property.items]] as const) {
          if (!textProperty?.minLength || textField?.widget === "select") continue;
          expect(textField?.pattern, "pattern").toBeDefined();
          expect(editorAccepts(textField!, ["Gold balloon arch"]), "text").toBe(true);
          expect(editorAccepts(textField!, ["   "]), "only spaces").toBe(false);
        }
        if (field.widget === "image") {
          expect(field.pattern, "pattern").toBeDefined();
          expect(editorAccepts(field, [cloudinaryPhoto]), cloudinaryPhoto).toBe(true);
          expect(editorAccepts(field, [samplePhoto]), samplePhoto).toBe(true);
          for (const notPhoto of notPhotos) expect(editorAccepts(field, [notPhoto]), notPhoto).toBe(false);
          if (field.multiple) {
            expect(editorAccepts(field, [cloudinaryPhoto, samplePhoto, cloudinaryPhoto]), "several photos").toBe(true);
            for (const notPhoto of notPhotos) {
              expect(editorAccepts(field, [cloudinaryPhoto, notPhoto]), `${notPhoto} after a photo`).toBe(false);
              expect(editorAccepts(field, [notPhoto, samplePhoto]), `${notPhoto} before a photo`).toBe(false);
            }
          }
        }
      });
    }
  });
}
