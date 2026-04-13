import { parseCsvFile } from "@/utils/csv.utils";
import type { SchemaColumnRecord } from "./schema.types";

const SCHEMA_PREVIEW_LIMIT = 10;

/**
 * Builds initial {@link SchemaColumnRecord} from a CSV file header and preview rows.
 *
 * @param {File} file - CSV file to sample
 * @return {Promise<SchemaColumnRecord>} Column definitions with default `string` type and preview samples
 */
export async function schemaColumnsFromCsvFile(
  file: File,
): Promise<SchemaColumnRecord> {
  const parseResults = await parseCsvFile(file, {
    preview: SCHEMA_PREVIEW_LIMIT,
    header: true,
    dynamicTyping: false,
    skipEmptyLines: "greedy",
  });

  const columns: SchemaColumnRecord = {};

  if (!parseResults.meta?.fields?.length) return columns;

  for (let i = 0; i < parseResults.meta.fields.length; i++) {
    const field = parseResults.meta.fields[i];
    const previewData = (parseResults.data as Record<string, unknown>[])
      .map((row) => row[field])
      .filter(Boolean);
    columns[field] = {
      name: field,
      configured: false,
      type: "string",
      constraints: {},
      previewData,
      index: i,
    };
  }

  return columns;
}
