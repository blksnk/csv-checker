import { Select as S } from "tamagui";
import { ChevronDown } from "@tamagui/lucide-icons-2";
import type { SelectProps } from "./Select.types";
import { isEmptyString } from "@/utils/string.utils";
import { useCallback, useMemo } from "react";
import type { Optional } from "@ubloimmo/front-util";
import { getItemIndex, renderSelectItems } from "./Select.utils";

export function Select<TValue extends string>(props: SelectProps<TValue>) {
  const onValueChange = useCallback(
    (value: TValue) => {
      if (!props.onChange) return;
      if (props.nullable && isEmptyString(value)) props.onChange(null);
      props.onChange(value);
    },
    [props],
  );

  const innerValue = useMemo<Optional<TValue>>(() => {
    if (!props.value || isEmptyString(props.value)) return undefined;
    return props.value;
  }, [props.value]);

  const indexGetter = useMemo(
    () => getItemIndex(props.options),
    [props.options],
  );

  const content = useMemo(
    () => renderSelectItems(indexGetter, props.options),
    [indexGetter, props.options],
  );

  return (
    <S<TValue> value={innerValue} onValueChange={onValueChange}>
      <S.Trigger
        flex={1}
        cursor="pointer"
        rounded="$4"
        id={props.id}
        height="$4"
        minW={150}
        width="100%"
        iconAfter={ChevronDown}
      >
        <S.Value placeholder={props.placeholder} />
      </S.Trigger>
      <S.FocusScope loop trapped focusOnIdle>
        <S.Content>
          <S.Viewport
            minW={200}
            maxW="minmax(400px, 100%)"
            bg="$background"
            rounded="$4"
            borderWidth={1}
            borderColor="$borderColor"
          >
            {content}
          </S.Viewport>
        </S.Content>
      </S.FocusScope>
    </S>
  );
}
