import type {
  ValidationErrorList,
  ValidationErrorMap,
  ValidationErrorType,
} from "../validation.types";

type AggregateErrors = {
  [TErrorType in ValidationErrorType as `${TErrorType}Errors`]: ValidationErrorList<TErrorType>;
};

type AggregateErrorsPayload = {
  columnErrors: AggregateErrors[];
};

export function aggregateErrors({
  columnErrors,
}: AggregateErrorsPayload): ValidationErrorMap {
  /* @type {ValidatonErrorMap} */
  const errorMap = {};

  for (const {
    typeErrors,
    uniqueErrors,
    requiredErrors,
    requiredIfFilledErrors,
    requiredIfNotFilledErrors,
  } of columnErrors) {
    for (const error of [
      ...typeErrors,
      ...uniqueErrors,
      ...requiredErrors,
      ...requiredIfFilledErrors,
      ...requiredIfNotFilledErrors,
    ]) {
      const path = error.path;
      // @ts-expect-error no TS syntax allowed inside worker code
      errorMap[path] ??= {};
      // @ts-expect-error no TS syntax allowed inside worker code
      errorMap[path][error.type] = error;
    }
  }

  return errorMap;
}
