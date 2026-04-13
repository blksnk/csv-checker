import type { CsvCellValue } from "@/stores/csv/csv.types";
import type { SchemaColumnName } from "@/stores/schema";
import type { ValidationErrorList } from "../../validation.types";

type ValidateRequiredPayload = {
  columnCells: CsvCellValue[];
  columnName: SchemaColumnName;
  maxOutput: number;
};

export function validateRequired({
  columnCells,
  columnName,
  maxOutput,
}: ValidateRequiredPayload): ValidationErrorList<"required"> {
  const errors = [];

  for (let i = 0; i < columnCells.length; i++) {
    if (errors.length >= maxOutput) break;
    const cellValue = columnCells[i];
    if (typeof cellValue === "string" && cellValue.length) continue;
    const path = `${i};${columnName}`;
    const error = {
      kind: "error",
      type: "required",
      path,
      message: `All cells in column ${columnName} should hold a value.`,
    };
    errors.push(error);
  }
  // @ts-expect-error no TS syntax allowed in worker function body
  return errors;
}
