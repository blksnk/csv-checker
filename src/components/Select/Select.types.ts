import type { Nullable, VoidFn } from "@ubloimmo/front-util";

export type SelectOption<TValue> = {
  label: string;
  value: TValue;
  description?: string;
};

export type SelectOptionGroup<TValue> = {
  label: string;
  options: SelectOption<TValue>[];
};

export type SelectOptionOrGroup<TValue> =
  | SelectOption<TValue>
  | SelectOptionGroup<TValue>;

export type SelectPropsBase<TValue> = {
  value?: Nullable<TValue>;
  options?: SelectOptionOrGroup<TValue>[];
  onChange?: VoidFn<[TValue]>;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
};

export type SelectProps<TValue> =
  | (SelectPropsBase<TValue> & { nullable?: never })
  | (SelectPropsBase<Nullable<TValue>> & { nullable: boolean });
