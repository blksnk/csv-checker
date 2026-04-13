import type { CsvCellValue } from "@/stores/csv/csv.types";
import type { SchemaColumnName } from "@/stores/schema";
import type { ValidationErrorList } from "../../validation.types";

type ValidateRequiredIfFilledPayload = {
  columnCells: CsvCellValue[];
  columnName: SchemaColumnName;
  ifFilledColumnCells: CsvCellValue[];
  ifFilledColumnName: SchemaColumnName;
  maxOutput: number;
};

export function validateRequiredIfFilled({
  columnCells,
  columnName,
  ifFilledColumnCells,
  ifFilledColumnName,
  maxOutput,
}: ValidateRequiredIfFilledPayload): ValidationErrorList<"requiredIfFilled"> {
  const errors = [];

  for (let i = 0; i < columnCells.length; i++) {
    if (errors.length >= maxOutput) break;

    const cellValue = columnCells[i];
    const ifFilledCellValue = ifFilledColumnCells[i];

    // abort if related cell is empty
    const notRequired =
      typeof ifFilledCellValue !== "string" || !ifFilledCellValue.length;
    if (notRequired) continue;

    if (typeof cellValue === "string" && cellValue.length) continue;
    const path = `${i};${columnName}`;
    const relatedPath = `${i};${ifFilledColumnName}`;
    const error = {
      kind: "error",
      type: "required",
      path,
      relatedPaths: [relatedPath],
      message: `Cells in the column "${columnName}" should hold a value when the same row's "${ifFilledColumnName}" column is not empty.`,
    };
    errors.push(error);
  }
  // @ts-expect-error no TS syntax allowed in worker function body
  return errors;
}
