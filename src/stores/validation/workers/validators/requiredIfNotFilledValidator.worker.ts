import type { CsvCellValue } from "@/stores/csv/csv.types";
import type { SchemaColumnName } from "@/stores/schema";
import type { ValidationErrorList } from "../../validation.types";

/** Input for {@link validateRequiredIfNotFilled}. */
type ValidateRequiredIfNotFilledPayload = {
  columnCells: CsvCellValue[];
  columnName: SchemaColumnName;
  ifNotFilledColumnCells: CsvCellValue[];
  ifNotFilledColumnName: SchemaColumnName;
  maxOutput: number;
};

/**
 * Requires a value in `columnName` when the paired “if not filled” column is empty on the same row.
 *
 * @param {ValidateRequiredIfNotFilledPayload} payload - Both columns’ cells and names, plus error cap
 * @return {ValidationErrorList<"requiredIfNotFilled">} Conditional required errors
 */
export function validateRequiredIfNotFilled({
  columnCells,
  columnName,
  ifNotFilledColumnCells,
  ifNotFilledColumnName,
  maxOutput,
}: ValidateRequiredIfNotFilledPayload): ValidationErrorList<"requiredIfNotFilled"> {
  // we limit the amount of data returned from each worker in order to prevent page crashes due to OOM errors during serialization

  const errors = [];

  for (let i = 0; i < columnCells.length; i++) {
    if (errors.length >= maxOutput) break;
    const cellValue = columnCells[i];
    const ifNotFilledCellValue = ifNotFilledColumnCells[i];

    // abort if related cell holds a value
    const notRequired =
      typeof ifNotFilledCellValue === "string" && ifNotFilledCellValue.length;
    if (notRequired) continue;

    if (typeof cellValue === "string" && cellValue.length) continue;
    const path = `${i};${columnName}`;
    const relatedPath = `${i};${ifNotFilledColumnName}`;
    const error = {
      kind: "error",
      type: "required",
      path,
      relatedPaths: [relatedPath],
      message: `Cells in the column "${columnName}" should hold a value when the same row's "${ifNotFilledColumnName}" column is not empty.`,
    };
    errors.push(error);
  }
  // @ts-expect-error no TS syntax allowed in worker function body
  return errors;
}
