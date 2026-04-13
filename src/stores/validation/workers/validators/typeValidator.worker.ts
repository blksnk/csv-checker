import type { CsvCellValue } from "@/stores/csv/csv.types";
import type { SchemaColumnName, SchemaColumnType } from "@/stores/schema";
import type { ValidationErrorList } from "../../validation.types";

type ValidateCellPayload = {
  columnCells: CsvCellValue[];
  columnType: SchemaColumnType;
  columnName: SchemaColumnName;
  maxOutput: number;
};

export function validateColumnTypes({
  columnCells,
  columnType,
  columnName,
  maxOutput,
}: ValidateCellPayload): ValidationErrorList<"type"> {
  const BOOLEAN_VALUE_SET = new Set(["true", "false"]);
  const CURRENCY_SIGN_SET = new Set(["$", "€", "¥", "£"]);
  const INVALID_DATE = "Invalid Date";
  // https://colinhacks.com/essays/reasonable-email-regex
  const EMAIL_REGEX =
    /^(?!\.)(?!.*\.\.)([a-z0-9_'+\-\.]*)[a-z0-9_'+\-]@([a-z0-9][a-z0-9\-]*\.)+[a-z]{2,}$/gi;
  // https://regex101.com/library/wZ4uU6?orderBy=RELEVANCE&search=phone
  const PHONE_REGEX =
    /(?:([+]\d{1,4})[-.\s]?)?(?:[(](\d{1,3})[)][-.\s]?)?(\d{1,4})[-.\s]?(\d{1,4})[-.\s]?(\d{1,9})/g;
  // https://uibakery.io/regex-library/url
  const URL_REGEX =
    /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/g;
  // https://regex101.com/library/nF0kX0?orderBy=RELEVANCE&search=uuid
  const UUID_REGEX =
    /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g;
  // https://regex101.com/r/uV1jN3/1
  // matches with currency sign either at the start or end, no spaces allowed
  const CURRENCY_REGEX =
    /^[\$€¥£]?([0-9]{1,3},([0-9]{3},)*[0-9]{3}|[0-9]+)(\.[0-9][0-9])?[\$€¥£]?$/g;

  // @ts-expect-error while the type error would be fixed with just a type hint, the current worker implementation does not allow us to have TS syntax inside the function body
  const errors = [];

  columnCells.forEach((cellValue, index) => {
    if (errors.length >= maxOutput) return;

    const path = `${index};${columnName}`;
    const error = {
      kind: "error",
      type: "type",
      path,
      message: `All cells in column "${columnName}" should conform to column type "${columnType}".`,
    };

    if (typeof cellValue !== "string" || !cellValue.length) {
      return;
    }

    // abort type check if cell is empty
    switch (columnType) {
      case "int":
        if (isNaN(parseInt(cellValue))) errors.push(error);
        return;
      case "float":
        if (isNaN(parseFloat(cellValue))) errors.push(error);
        return;
      case "boolean":
        if (!BOOLEAN_VALUE_SET.has(cellValue)) errors.push(error);
        return;
      case "date":
        if (new Date(cellValue).toString() === INVALID_DATE) errors.push(error);
        return;
      case "email":
        EMAIL_REGEX.lastIndex = 0;
        if (!EMAIL_REGEX.test(cellValue)) errors.push(error);
        return;
      case "phone":
        PHONE_REGEX.lastIndex = 0;
        if (!PHONE_REGEX.test(cellValue)) errors.push(error);
        return;
      case "url":
        URL_REGEX.lastIndex = 0;
        if (!URL_REGEX.test(cellValue)) errors.push(error);
        return;
      case "uuid":
        UUID_REGEX.lastIndex = 0;
        console.log(UUID_REGEX.test(cellValue));
        UUID_REGEX.lastIndex = 0;
        if (!UUID_REGEX.test(cellValue)) errors.push(error);
        return;
      case "currency":
        CURRENCY_REGEX.lastIndex = 0;
        if (!CURRENCY_REGEX.test(cellValue)) errors.push(error);
        return;
      case "currency_sign":
        if (!CURRENCY_SIGN_SET.has(cellValue)) errors.push(error);
        return;
      // type: string is the default and is always true since we store csv cell values as strings
      // type: id is treated the same since we don't have the granularity to enforce any specific ID scheme
      default:
        return;
    }
  });

  // @ts-expect-error while the type error would be fixed with just a type hint, the current worker implementation does not allow us to have TS syntax inside the function body
  return errors;
}
