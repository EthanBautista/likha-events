import type { CmsConfig, Field } from "@sveltia/cms";
import { eventTypes } from "./event-types";

// The editor page's configuration (Sveltia CMS, ADR 0001). The owner edits Setups, Packages and
// Rentals only, never page layout or headings. Each field mirrors the content schemas in
// content-schemas.ts, and a test checks they match, so the editor won't save an entry the build
// would reject. Fields are required unless `required: false`.

/** The display order a new Package or Rental starts with, so the owner never has to type one. */
export interface NextDisplayOrders {
  packages: number;
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

export function editorConfig(nextOrders: NextDisplayOrders): CmsConfig {
  return {
    load_config_file: false,
    app_title: "Likha Events editor",
    backend: {
      name: "github",
      repo: "EthanBautista/likha-events",
      branch: "main",
      // Login goes through Netlify's OAuth provider, the default for the GitHub backend.
      base_url: "https://api.netlify.com",
    },
    // Photos go to Cloudinary from ticket 11 (ADR 0002). Until then a photo is added by its URL.
    media_folder: "public/uploads",
    public_folder: "/uploads",
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
          { name: "caption", label: "Caption", widget: "string", hint: "One short line about the Setup." },
          { name: "eventType", label: "Event type", widget: "select", options: [...eventTypes] },
          { name: "coverPhoto", label: "Cover photo", widget: "image" },
          {
            name: "photos",
            label: "More photos",
            widget: "image",
            multiple: true,
            max: 8,
            required: false,
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
        name: "packages",
        label: "Packages",
        label_singular: "Package",
        folder: "src/content/packages",
        extension: "json",
        format: "json",
        create: true,
        identifier_field: "name",
        summary: "{{order}}. {{name}}",
        sortable_fields: { fields: ["order", "name", "price"], default: { field: "order", direction: "ascending" } },
        fields: [
          { name: "name", label: "Name", widget: "string" },
          price("In Canadian dollars, whole dollars only."),
          {
            name: "included",
            label: "What's included",
            label_singular: "line",
            widget: "list",
            field: { name: "line", label: "Line", widget: "string" },
            min: 1,
            hint: "One short line each.",
          },
          displayOrder(nextOrders.packages, "Packages"),
          sample,
        ],
      },
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
          { name: "name", label: "Name", widget: "string" },
          { name: "photo", label: "Photo", widget: "image" },
          price("Per event, in Canadian dollars, whole dollars only."),
          { name: "description", label: "Description", widget: "string", hint: "One line saying what it is." },
          displayOrder(nextOrders.rentals, "Rentals"),
          sample,
        ],
      },
    ],
  };
}
