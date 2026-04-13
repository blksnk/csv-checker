import type { Nullable, VoidFn } from "@ubloimmo/front-util";

/** One selectable option with optional multi-line description. */
export type SelectOption<TValue> = {
  label: string;
  value: TValue;
  description?: string;
};

/** Group heading containing nested {@link SelectOption} items. */
export type SelectOptionGroup<TValue> = {
  label: string;
  options: SelectOption<TValue>[];
};

/** Either a flat option or an option group. */
export type SelectOptionOrGroup<TValue> =
  | SelectOption<TValue>
  | SelectOptionGroup<TValue>;

/** Shared Tamagui select props excluding the nullable discriminant. */
export type SelectPropsBase<TValue> = {
  value?: Nullable<TValue>;
  options?: SelectOptionOrGroup<TValue>[];
  onChange?: VoidFn<[TValue]>;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
};

/**
 * Select control: either a required string value or nullable when `nullable: true`.
 *
 * @template TValue - Selected value type (typically string enum)
 */
export type SelectProps<TValue> =
  | (SelectPropsBase<TValue> & { nullable?: never })
  | (SelectPropsBase<Nullable<TValue>> & { nullable: boolean });
