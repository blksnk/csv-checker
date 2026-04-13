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

export function isSelectOption<TValue>(
  optionOrGroup: SelectOptionOrGroup<TValue>,
): optionOrGroup is SelectOption<TValue> {
  return "value" in optionOrGroup;
}

export function isSelectOptionGroup<TValue>(
  optionOrGroup: SelectOptionOrGroup<TValue>,
): optionOrGroup is SelectOptionGroup<TValue> {
  return "options" in optionOrGroup;
}

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

type IndexGetterFn<TValue> = ReturnType<typeof getItemIndex<TValue>>;

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
