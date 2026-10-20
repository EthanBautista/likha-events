import { expect, test } from "@playwright/test";
import { z } from "astro/zod";
import { packageSchema, rentalSchema, setupSchema } from "../../src/content-schemas";
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
}

/** A schema property in JSON Schema form, which is how zod describes it. */
interface SchemaProperty {
  type?: string;
  enum?: string[];
  minItems?: number;
  maxItems?: number;
  minimum?: number;
  exclusiveMinimum?: number;
  default?: unknown;
}

const schemas = { setups: setupSchema, packages: packageSchema, rentals: rentalSchema };

/** Which editor widgets can hold each kind of schema value. A date has no JSON Schema type. */
const widgetsFor: Record<string, string[]> = {
  string: ["string", "text", "image", "select"],
  array: ["list", "image"],
  integer: ["number"],
  boolean: ["boolean"],
  undefined: ["datetime"],
};

let collections: { name: string; fields: EditorField[] }[];

test.beforeAll(async ({ request }) => {
  const response = await request.get("/admin/config.json");
  expect(response.ok()).toBe(true);
  collections = (await response.json()).collections;
});

test("the editor has collections for Setups, Packages and Rentals only", () => {
  expect(collections.map((collection) => collection.name).toSorted()).toEqual(["packages", "rentals", "setups"]);
});

test("a new Package or Rental starts after the last one in display order, so the owner never types one", () => {
  const orderField = (collectionName: string) =>
    collections.find((collection) => collection.name === collectionName)?.fields.find((field) => field.name === "order");

  expect(orderField("packages")?.default).toBe(readPackagesInOrder().at(-1)!.order + 1);
  expect(orderField("rentals")?.default).toBe(readRentalsInOrder().at(-1)!.order + 1);
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
      });
    }
  });
}
