import type { FC } from "react";

/** Passed to field input components (stable `id` for label association). */
type FieldInputProps = {
  id: string;
};

/** Renders the actual control for a {@link FieldProps} row. */
type FieldInput = FC<FieldInputProps>;

/**
 * Labeled field with optional help tooltip wrapping the label.
 */
export type FieldProps = {
  Input: FieldInput;
  label: string;
  tooltip?: string;
};
