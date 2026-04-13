import type {
  AsyncFn,
  Enum,
  KeyOf,
  Nullable,
  VoidFn,
} from "@ubloimmo/front-util";
import type { SchemaColumnConstraints, SchemaColumnName } from "../schema";

export const VALIDATION_STATES = [
  "pending",
  "running",
  "stale",
  "done",
] as const;

export type ValidationState = Enum<typeof VALIDATION_STATES>;

export type ValidationCellPath = `${number};${SchemaColumnName}`;

export type ValidationErrorType =
  | KeyOf<SchemaColumnConstraints, string>
  | "type";

export type ValidationError<TErrorType extends ValidationErrorType> = {
  kind: "error";
  path: ValidationCellPath;
  type: TErrorType;
  message: string;
  relatedPaths?: ValidationCellPath[];
};

export type ValidationSuccess = {
  kind: "success";
};

export type ValidationSuccessOrError<TErrorType extends ValidationErrorType> =
  | ValidationError<TErrorType>
  | ValidationSuccess;

export type ValidationErrorList<TErrorType extends ValidationErrorType> = Array<
  ValidationError<TErrorType>
>;

/**
 * A map that holds zero or more errors for a single cell
 */
export type ValidationCellErrorMap = Partial<
  Record<ValidationErrorType, ValidationError<ValidationErrorType>>
>;

/**
 * A map that holds zero or more errors for each cell
 */
export type ValidationErrorMap = Partial<
  Record<ValidationCellPath, ValidationCellErrorMap>
>;

export type ValidationResult = {
  errorMap: ValidationErrorMap;
  truncated: boolean;
};

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
