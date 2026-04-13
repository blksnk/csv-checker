import type { FC } from "react";

type FieldInputProps = {
  id: string;
};

type FieldInput = FC<FieldInputProps>;

export type FieldProps = {
  Input: FieldInput;
  label: string;
  tooltip?: string;
};
