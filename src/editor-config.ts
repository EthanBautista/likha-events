import type { CmsConfig, EntryCollection, Field } from "@sveltia/cms";
import { otherEventType, type EventTypes } from "./event-types";
import { editorPhotosPattern } from "./photos";
import { siteRepo } from "./site-settings";

// The editor page's configuration (Sveltia CMS, ADR 0001). The owner edits Setups, Packages,
// Wedding Packages, Rentals and the Event types list only, never page layout or headings. Each
// field mirrors the content schemas in content-schemas.ts, and a test checks they match, so the
// editor won't save an entry the build would reject. Fields are required unless `required: false`.

/**
 * The business's Cloudinary account (ADR 0003). The API key is public, used by Cloudinary's Media
 * Library to log the owner in; the API secret never goes in the site.
 */
const cloudinaryAccount = { cloudName: "wuutkvur", apiKey: "779581795881557" };

/**
 * The display order a new Package, Wedding Package or Rental starts with, so the owner never has to
 * type one.
 */
export interface NextDisplayOrders {
  packages: number;
  weddingPackages: number;
  rentals: number;
}

const sample: Field = {
  name: "sample",
  label: "Sample",
  widget: "boolean",
  default: false,
  required: false,
  hint: "Marks placeholder content as \"Sample\" on the site. Turn it off once the details are real.",
};

/** Photos must come from Cloudinary, so a pasted link to anywhere else isn't saved for the build to reject. */
const photoPattern: [string, string] = [editorPhotosPattern, "Choose photos from Cloudinary."];

/** Text the build trims before checking it isn't empty, so only spaces won't do. */
const notBlank: [string, string] = [String.raw`\S`, "Write something here, not just spaces."];

/** A name on the Event types list: not only spaces, and not Other in any capitals, since the site always adds Other. The Event types module leaves out the same names. */
const anyCapitals = (word: string) => [...word].map((letter) => `[${letter.toUpperCase()}${letter.toLowerCase()}]`).join("");
const eventTypeName: [string, string] = [
  String.raw`^(?!\s*${anyCapitals(otherEventType)}\s*$)[\s\S]*\S`,
  "Write a name here, not just spaces. Other is always there, so it isn't needed on the list.",
];

const price = (hint: string): Field => ({ name: "price", label: "Price", widget: "number", value_type: "int", min: 1, hint });

const displayOrder = (next: number, things: string): Field => ({
  name: "order",
  label: "Display order",
  widget: "number",
  value_type: "int",
  min: 1,
  default: next,
  hint: `Where this appears on the page: 1 first, then 2, and so on. Change it to move ${things} around.`,
});

/** Packages and Wedding Packages are edited the same way, each in its own list so neither ends up in the other. */
const packageCollection = (name: string, label: string, labelSingular: string, folder: string, nextOrder: number): EntryCollection => ({
  name,
  label,
  label_singular: labelSingular,
  folder,
  extension: "json",
  format: "json",
  create: true,
  identifier_field: "name",
  summary: "{{order}}. {{name}}",
  sortable_fields: { fields: ["order", "name", "price"], default: { field: "order", direction: "ascending" } },
  fields: [
    { name: "name", label: "Name", widget: "string", pattern: notBlank },
    price("In Canadian dollars, whole dollars only."),
    {
      name: "included",
      label: "What's included",
      label_singular: "line",
      widget: "list",
      field: { name: "line", label: "Line", widget: "string", pattern: notBlank },
      min: 1,
      hint: "One short line each.",
    },
    displayOrder(nextOrder, label),
    sample,
  ],
});

export function editorConfig(nextOrders: NextDisplayOrders, eventTypes: EventTypes): CmsConfig {
  return {
    load_config_file: false,
    app_title: "Likha Events editor",
    backend: {
      name: "github",
      repo: siteRepo,
      branch: "main",
      // Login goes through Netlify's OAuth provider, the default for the GitHub backend.
      base_url: "https://api.netlify.com",
    },
    // Photos upload straight to Cloudinary, and a photo field stores the photo's full URL (ADR 0002).
    // Uploading into the repo is turned off. The upload preset that shrinks each photo is set in
    // Cloudinary itself: see docs/cloudinary-upload-preset.md.
    media_libraries: {
      default: false,
      cloudinary: {
        config: { cloud_name: cloudinaryAccount.cloudName, api_key: cloudinaryAccount.apiKey },
        // Store the photo's own URL, never a resized copy's: the site asks Cloudinary for the size it needs.
        use_transformations: false,
      },
    },
    // An empty optional field, such as a Setup's date, is left out rather than saved blank.
    output: { omit_empty_optional_fields: true },
    collections: [
      {
        name: "setups",
        label: "Setups",
        label_singular: "Setup",
        folder: "src/content/setups",
        extension: "json",
        format: "json",
        create: true,
        identifier_field: "caption",
        summary: "{{caption}}",
        sortable_fields: { fields: ["date", "caption"], default: { field: "date", direction: "descending" } },
        fields: [
          { name: "caption", label: "Caption", widget: "string", pattern: notBlank, hint: "One short line about the Setup." },
          {
            name: "eventType",
            label: "Event type",
            widget: "select",
            // The list as of the last publish, so a newly added Event type shows here a couple of minutes after saving the list.
            options: eventTypes.all,
            hint: "Missing one? Add it under Event types first.",
          },
          { name: "coverPhoto", label: "Cover photo", widget: "image", pattern: photoPattern },
          {
            name: "photos",
            label: "More photos",
            widget: "image",
            multiple: true,
            max: 8,
            required: false,
            pattern: photoPattern,
            hint: "Up to 8, shown after the cover photo.",
          },
          {
            name: "featured",
            label: "Feature on homepage",
            widget: "boolean",
            default: false,
            required: false,
          },
          {
            name: "date",
            label: "Event date",
            widget: "datetime",
            type: "date",
            format: "YYYY-MM-DD",
            required: false,
            hint: "Setups are shown newest first.",
          },
          sample,
        ],
      },
      {
        name: "eventTypes",
        label: "Event types",
        files: [
          {
            name: "eventTypes",
            label: "Event types",
            file: "src/content/event-types.json",
            format: "json",
            fields: [
              {
                name: "names",
                label: "Event types",
                label_singular: "Event type",
                widget: "list",
                required: false,
                field: { name: "name", label: "Name", widget: "string", pattern: eventTypeName },
                hint: "Other is always there, so it isn't on this list. A Setup whose Event type is removed shows under Other.",
              },
            ],
          },
        ],
      },
      packageCollection("packages", "Packages", "Package", "src/content/packages", nextOrders.packages),
      packageCollection(
        "weddingPackages",
        "Wedding Packages",
        "Wedding Package",
        "src/content/wedding-packages",
        nextOrders.weddingPackages,
      ),
      {
        name: "rentals",
        label: "Rentals",
        label_singular: "Rental",
        folder: "src/content/rentals",
        extension: "json",
        format: "json",
        create: true,
        identifier_field: "name",
        summary: "{{order}}. {{name}}",
        sortable_fields: { fields: ["order", "name", "price"], default: { field: "order", direction: "ascending" } },
        fields: [
          { name: "name", label: "Name", widget: "string", pattern: notBlank },
          { name: "photo", label: "Photo", widget: "image", pattern: photoPattern },
          price("Per event, in Canadian dollars, whole dollars only."),
          { name: "description", label: "Description", widget: "string", pattern: notBlank, hint: "One line saying what it is." },
          displayOrder(nextOrders.rentals, "Rentals"),
          sample,
        ],
      },
    ],
  };
}
