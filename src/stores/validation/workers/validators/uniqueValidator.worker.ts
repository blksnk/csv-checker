import type { CsvCellValue } from "@/stores/csv/csv.types";
import type { SchemaColumnName } from "@/stores/schema";
import type { ValidationErrorList } from "../../validation.types";

/** Input for {@link validateUnique}. */
type UniqueValidatorPayload = {
  columnName: SchemaColumnName;
  columnCells: CsvCellValue[];
  maxOutput: number;
};

/**
 * Finds duplicate non-unique values in a column (iterates all rows; caps errors at `maxOutput`).
 *
 * @param {UniqueValidatorPayload} payload - Column cells and error cap
 * @return {ValidationErrorList<"unique">} Uniqueness violations with related row paths
 */
export function validateUnique({
  columnName,
  columnCells,
  maxOutput,
}: UniqueValidatorPayload): ValidationErrorList<"unique"> {
  // map of cell values to cell indices
  const accumulator = new Map();
  // first iterate over all cells to find matching groups
  for (let i = 0; i < columnCells.length; i++) {
    const value = columnCells[i];
    // existing value exists, push current index to it
    const indices = accumulator.get(value);
    if (Array.isArray(indices)) {
      indices.push(i);
      continue;
    }
    // no existing value exists, store current value for subsequent checks
    accumulator.set(value, [i]);
  }

  const errors = [];
  // then iterate over accumulator to generate errors
  // one error is generated for each cell with non-unique values, pointing to others with the same value
  for (const [value, indices] of accumulator) {
    if (errors.length >= maxOutput) break;
    if (!Array.isArray(indices) || indices.length <= 1) continue;

    for (let j = 0; j < indices.length; j++) {
      const mainIndex = indices[j];
      const relatedIndices = indices.filter((_, index) => index !== j);
      const relatedPaths = relatedIndices.map(
        (relatedIndex) => `${relatedIndex};${columnName}`,
      );
      const path = `${mainIndex};${columnName}`;
      const error = {
        kind: "error",
        type: "unique",
        path,
        message: `Cells in column "${columnName}" should be unique.\nCell value "${value}"" is the same in other rows: ${relatedIndices.map((index) => index + 1).join(", ")}.`,
        relatedPaths,
      };
      errors.push(error);
    }
  }
  // @ts-expect-error no TS syntax allowed in worker function body
  return errors;
}
