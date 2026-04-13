import type {
  ValidationErrorList,
  ValidationErrorMap,
  ValidationErrorType,
} from "../validation.types";

/** Per-column error lists keyed by validator name prefix. */
type AggregateErrors = {
  [TErrorType in ValidationErrorType as `${TErrorType}Errors`]: ValidationErrorList<TErrorType>;
};

/** Input for {@link aggregateErrors}. */
type AggregateErrorsPayload = {
  columnErrors: AggregateErrors[];
};

/**
 * Flattens per-column error arrays into a nested map: cell path → rule → error.
 *
 * @param {AggregateErrorsPayload} payload - One aggregate object per schema column
 * @return {ValidationErrorMap} Merged error map
 */
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
