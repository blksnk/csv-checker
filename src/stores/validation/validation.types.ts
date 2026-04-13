import type {
  AsyncFn,
  Enum,
  KeyOf,
  Nullable,
  VoidFn,
} from "@ubloimmo/front-util";
import type { SchemaColumnConstraints, SchemaColumnName } from "../schema";

/** Lifecycle states for the async validation run. */
export const VALIDATION_STATES = [
  "pending",
  "running",
  "stale",
  "done",
] as const;

/** One of {@link VALIDATION_STATES}. */
export type ValidationState = Enum<typeof VALIDATION_STATES>;

/** Cell address: `rowIndex;columnName`. */
export type ValidationCellPath = `${number};${SchemaColumnName}`;

/** Discriminator keys for validation issues (constraint keys or `type`). */
export type ValidationErrorType =
  | KeyOf<SchemaColumnConstraints, string>
  | "type";

/**
 * A single failed check for one cell.
 *
 * @template TErrorType - Which rule failed
 */
export type ValidationError<TErrorType extends ValidationErrorType> = {
  kind: "error";
  path: ValidationCellPath;
  type: TErrorType;
  message: string;
  relatedPaths?: ValidationCellPath[];
};

/** Sentinel value when a cell passes all checks (used in union results). */
export type ValidationSuccess = {
  kind: "success";
};

/**
 * Either a {@link ValidationError} or {@link ValidationSuccess}.
 *
 * @template TErrorType - Error kind when not success
 */
export type ValidationSuccessOrError<TErrorType extends ValidationErrorType> =
  | ValidationError<TErrorType>
  | ValidationSuccess;

/**
 * List of errors of the same rule type (e.g. all `"unique"`).
 *
 * @template TErrorType - Error kind
 */
export type ValidationErrorList<TErrorType extends ValidationErrorType> = Array<
  ValidationError<TErrorType>
>;

/**
 * Per-rule errors for one cell (`path` is implicit from the outer map).
 */
export type ValidationCellErrorMap = Partial<
  Record<ValidationErrorType, ValidationError<ValidationErrorType>>
>;

/**
 * Full validation result: cell path → per-rule errors.
 */
export type ValidationErrorMap = Partial<
  Record<ValidationCellPath, ValidationCellErrorMap>
>;

/** Aggregated worker output plus whether error lists hit the safety cap. */
export type ValidationResult = {
  errorMap: ValidationErrorMap;
  truncated: boolean;
};

/**
 * Observable validation state, error index, and `validate` / `invalidate` actions.
 */
export type ValidationStore = {
  state: ValidationState;
  errorMap: ValidationErrorMap;
  errorCellPaths: ValidationCellPath[];
  errorCount: number;
  errorMapIsTruncated: boolean;
  lastValidationTimestamp: Nullable<number>;
  validate: AsyncFn;
  invalidate: VoidFn;
};
