import { isNonEmptyString, lineBreaker } from "@/utils/string.utils";
import type {
  SelectOption,
  SelectOptionGroup,
  SelectOptionOrGroup,
} from "./Select.types";
import { Paragraph, Select as S, Separator, YStack } from "tamagui";
import { Check } from "@tamagui/lucide-icons-2";
import type { Nullable } from "@ubloimmo/front-util";
import { Fragment } from "react/jsx-runtime";
import type { ReactNode } from "react";

/**
 * Type guard: item is a flat {@link SelectOption}.
 *
 * @template TValue - Option value type
 * @param {SelectOptionOrGroup<TValue>} optionOrGroup - Item from options list
 * @return {optionOrGroup is SelectOption<TValue>} Whether the item is a single option
 */
export function isSelectOption<TValue>(
  optionOrGroup: SelectOptionOrGroup<TValue>,
): optionOrGroup is SelectOption<TValue> {
  return "value" in optionOrGroup;
}

/**
 * Type guard: item is a {@link SelectOptionGroup}.
 *
 * @template TValue - Nested option value type
 * @param {SelectOptionOrGroup<TValue>} optionOrGroup - Item from options list
 * @return {optionOrGroup is SelectOptionGroup<TValue>} Whether the item is a group
 */
export function isSelectOptionGroup<TValue>(
  optionOrGroup: SelectOptionOrGroup<TValue>,
): optionOrGroup is SelectOptionGroup<TValue> {
  return "options" in optionOrGroup;
}

/**
 * Builds a flat index map for Tamagui `Select.Item` `index` props (handles grouped options).
 *
 * @template TValue - Option value type
 * @param {SelectOptionOrGroup<TValue>[] | undefined} optionsOrGroups - Full options tree
 * @return {(itemValue: TValue) => number} Getter returning sequential index for a value
 */
export function getItemIndex<TValue>(
  optionsOrGroups?: SelectOptionOrGroup<TValue>[],
) {
  if (!optionsOrGroups?.length) return () => 0;

  const indexMap = new Map<TValue, number>();

  let i = 0;
  for (let j = 0; j < optionsOrGroups.length; j++) {
    const item = optionsOrGroups[j];
    if (isSelectOptionGroup(item)) {
      for (let k = 0; k < item.options.length; k++) {
        const option = item.options[k];
        indexMap.set(option.value, i);
        i++;
      }
      continue;
    }
    indexMap.set(item.value, i);
    i++;
  }
  return function (itemValue: TValue): number {
    return indexMap.get(itemValue) ?? 0;
  };
}

/** Index lookup returned by {@link getItemIndex}. */
type IndexGetterFn<TValue> = ReturnType<typeof getItemIndex<TValue>>;

/**
 * Renders one flat select item with optional description and check indicator.
 *
 * @template TValue - Nullable string value type
 * @param {SelectOption<TValue>} option - Option metadata
 * @param {number} index - Position in the flattened list (for React keys)
 * @param {IndexGetterFn<TValue>} indexGetter - Maps value to Tamagui item index
 * @return {JSX.Element} Fragment with separator and item
 */
export function renderSelectOption<TValue extends Nullable<string>>(
  { label, value, description }: SelectOption<TValue>,
  index: number,
  indexGetter: IndexGetterFn<TValue>,
) {
  const key = `${label}-${value}-${index}`;
  const itemIndex = indexGetter(value);
  return (
    <Fragment key={key}>
      <Separator />
      <S.Item
        width="100%"
        minHeight="$4"
        index={itemIndex}
        value={value ?? ""}
        transition="150ms"
        cursor="pointer"
      >
        <YStack width={400}>
          <S.ItemText>{label}</S.ItemText>
          {isNonEmptyString(description) && (
            <Paragraph size="$1" wordWrap="normal" color="$gray10" width="auto">
              {lineBreaker(description)}
            </Paragraph>
          )}
        </YStack>
        <S.ItemIndicator marginLeft="auto">
          <Check size={16} />
        </S.ItemIndicator>
      </S.Item>
    </Fragment>
  );
}

/**
 * Renders a labeled group containing nested {@link renderSelectOption} rows.
 *
 * @template TValue - Nullable string value type
 * @param {SelectOptionGroup<TValue>} group - Group label and options
 * @param {number} index - Group index for keys
 * @param {IndexGetterFn<TValue>} indexGetter - Flat index resolver
 * @return {JSX.Element} Group fragment
 */
export function renderSelectOptionGroup<TValue extends Nullable<string>>(
  { label, options }: SelectOptionGroup<TValue>,
  index: number,
  indexGetter: IndexGetterFn<TValue>,
) {
  const key = `${label}-${options.length}-${index}`;
  return (
    <Fragment key={key}>
      <Separator />
      <S.Group width="100%">
        <S.Label color="$gray10" textTransform="uppercase" fontWeight="500">
          {label}
        </S.Label>
        {options.map((option, optionIndex) =>
          renderSelectOption(option, optionIndex, indexGetter),
        )}
      </S.Group>
    </Fragment>
  );
}

/**
 * Maps options or groups to Tamagui select viewport content.
 *
 * @template TValue - Nullable string value type
 * @param {IndexGetterFn<TValue>} indexGetter - From {@link getItemIndex}
 * @param {SelectOptionOrGroup<TValue>[] | undefined} optionsOrGroups - Options tree
 * @return {ReactNode} List of items and groups
 */
export function renderSelectItems<TValue extends Nullable<string>>(
  indexGetter: IndexGetterFn<TValue>,
  optionsOrGroups?: SelectOptionOrGroup<TValue>[],
): ReactNode {
  if (!optionsOrGroups?.length) return null;
  return optionsOrGroups.map((optionOrGroup, index) =>
    isSelectOption(optionOrGroup)
      ? renderSelectOption(optionOrGroup, index, indexGetter)
      : renderSelectOptionGroup(optionOrGroup, index, indexGetter),
  );
}
