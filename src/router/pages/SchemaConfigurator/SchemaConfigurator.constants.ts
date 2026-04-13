import type { SelectOptionOrGroup } from "@/components";
import { SCHEMA_COLUMN_TYPES, type SchemaColumnType } from "@/stores/schema";
import type { ValueMap } from "@ubloimmo/front-util";

export const SCHEMA_COLUMN_TYPE_OPTION_COPY: ValueMap<
  SchemaColumnType,
  { label: string; description?: string }
> = {
  string: {
    label: "Text",
    description:
      "Any combination of letters, numbers and symbols.\nSuitable for names, addresses, comments...",
  },
  boolean: {
    label: "Yes/No",
    description:
      "A simple choice between two options: true or false.\nSuitable for statuses, visibility flags...",
  },
  int: {
    label: "Whole Number",
    description:
      "A number without decimals (like 5, 100, or -42).\nSuitable for quantities, ages, zip codes, IDs...",
  },
  float: {
    label: "Decimal Number",
    description:
      "A number that can include decimals (like 3.14 or 99.99)\nSuitable for prices, weights, measurements, ratings...",
  },
  date: {
    label: "Date",
    description: "A calendar date.\nCurrently, supports most common formats.",
  },
  email: {
    label: "Email",
    description: "A standard email format (like name@example.com).",
  },
  phone: {
    label: "Phone Number",
    description: "A phone number (like 555-123-4567, +490123456789).",
  },
  url: {
    label: "Website Link",
    description:
      "The web address of a page or resource (like www.example.com).\n Suitable for product links, social media profiles, documentation...",
  },
  currency: {
    label: "Currency",
    description:
      "Money amounts with currency symbol (like $99.99 or €50.00).\n Suitable for prices, invoices, payments, other amounts...",
  },
  currency_sign: {
    label: "Currency Symbol",
    description: "The currency sign only (like $, €, £, or ¥)",
  },
  id: {
    label: "Identifier",
    description:
      "A unique code that could be text or number (like ABC123 or 5847).\nSuitable for customer IDs, order numbers, product codes, references...",
  },
  uuid: {
    label: "Unique ID (UUID)",
    description: `A special auto-generated identifier (like 550e8400-e29b-41d4-a716-446655440000).\n Generally used in System records, database entries, internal tracking numbers...`,
  },
};

const COLUMN_TYPE_OPTION_GROUP_DEFS: {
  label: string;
  types: SchemaColumnType[];
}[] = [
  {
    label: "Contact information",
    types: ["email", "phone", "url"],
  },
  {
    label: "Numbers",
    types: ["int", "float"],
  },
  {
    label: "Monetary amounts",
    types: ["currency", "currency_sign"],
  },
  {
    label: "Identifiers",
    types: ["id", "uuid"],
  },
];

export const COLUMN_TYPE_OPTIONS =
  ((): SelectOptionOrGroup<SchemaColumnType>[] => {
    const notGrouped = new Set<SchemaColumnType>(
      [...SCHEMA_COLUMN_TYPES].sort((a, b) => a.localeCompare(b)),
    );
    const optionsOrGroups: SelectOptionOrGroup<SchemaColumnType>[] =
      COLUMN_TYPE_OPTION_GROUP_DEFS.map(({ label, types }) => ({
        label,
        options: types.map((type) => {
          notGrouped.delete(type);
          return {
            value: type,
            ...SCHEMA_COLUMN_TYPE_OPTION_COPY[type],
          };
        }),
      }));
    for (const type of notGrouped) {
      optionsOrGroups.unshift({
        value: type,
        ...SCHEMA_COLUMN_TYPE_OPTION_COPY[type],
      });
    }
    return optionsOrGroups;
  })();
