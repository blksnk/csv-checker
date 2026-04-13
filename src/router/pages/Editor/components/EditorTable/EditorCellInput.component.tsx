import { Select, type SelectOption } from "@/components";
import { STORES } from "@/stores";
import type { CsvCellValue } from "@/stores/csv/csv.types";
import type { CellPath } from "@/stores/editor";
import type { SchemaColumn, SchemaColumnType } from "@/stores/schema";
import { isNonEmptyString } from "@/utils/string.utils";
import type { Observable } from "@legendapp/state";
import { Memo, Switch, useObservable } from "@legendapp/state/react";
import { isBoolean, type Optional, type ValueMap } from "@ubloimmo/front-util";
import type { FC, FocusEvent, HTMLInputTypeAttribute } from "react";
import { Checkbox, type CheckedState, Input } from "tamagui";

/** Binds editors to a stable {@link CellPath}. */
type EditorCellInputProps = {
  path$: Observable<CellPath>;
};

/** Shared props for concrete cell widgets. */
type EditorCellInputInnerProps = EditorCellInputProps & {
  column$: Observable<SchemaColumn>;
  value$: Observable<(() => Optional<string>) | Optional<string>>;
};

const INPUT_TYPE_MAP: Partial<
  ValueMap<SchemaColumnType, HTMLInputTypeAttribute>
> = {
  boolean: "checkbox",
  currency: "text",
  email: "email",
  date: "date",
  int: "number",
  float: "number",
  id: "text",
  uuid: "text",
  url: "url",
  phone: "tel",
  string: "text",
};

/**
 * Default text/numeric/date input; commits on blur via {@link STORES.editor.editCell}.
 *
 * @param {EditorCellInputInnerProps} props - Column, path, and value observables
 * @return {JSX.Element} Tamagui input
 */
function GenericCellInput({
  column$,
  path$,
  value$,
}: EditorCellInputInnerProps) {
  const inputType = useObservable(() => INPUT_TYPE_MAP[column$.type.get()]);

  const onBlur = (event: FocusEvent<HTMLInputElement>) => {
    const text = event.target.value;
    STORES.editor.editCell(path$, text);
  };

  return (
    <Memo>
      {() => (
        <Input
          theme="surface1"
          type={inputType.get()}
          defaultValue={value$.get()}
          required={column$.constraints.required.get()}
          onBlur={onBlur}
          rounded="0"
          minH="100%"
          autoFocus
          backgroundColor="$colorTransparent"
          p="$2"
          borderWidth={0}
        />
      )}
    </Memo>
  );
}

const CURRENCY_SIGN_OPTIONS: SelectOption<string>[] = ["$", "€", "¥", "£"].map(
  (sign) => ({ label: sign, value: sign }),
);

/**
 * Small select for `currency_sign` columns.
 *
 * @param {EditorCellInputInnerProps} props - Column, path, value
 * @return {JSX.Element} Select
 */
function CurrencySignSelect({
  value$,
  path$,
  column$,
}: EditorCellInputInnerProps) {
  const onSelect = (value: CsvCellValue) => {
    STORES.editor.editCell(path$, value);
    STORES.editor.unfocus();
  };

  return (
    <Memo>
      {() => {
        const required = column$.constraints.required.get();
        return (
          <Select
            options={CURRENCY_SIGN_OPTIONS}
            value={value$.get()}
            onChange={onSelect}
            required={required}
            nullable={!required}
          />
        );
      }}
    </Memo>
  );
}

/**
 * Checkbox mapping `"true"` / `"false"` strings for `boolean` columns.
 *
 * @param {EditorCellInputInnerProps} props - Column, path, value
 * @return {JSX.Element} Checkbox
 */
function BooleanCheckbox({
  value$,
  path$,
  column$,
}: EditorCellInputInnerProps) {
  const onChecked = (checked: CheckedState) => {
    const cellValue = isBoolean(checked) ? String(checked) : null;
    STORES.editor.editCell(path$, cellValue);
  };

  const checked$ = useObservable<CheckedState>(() => {
    const value = value$.get()?.toLowerCase()?.trim();
    if (!isNonEmptyString(value)) return "indeterminate";
    if (value === "true") return true;
    if (value === "false") return false;
    return "indeterminate";
  });

  return (
    <Memo>
      {() => (
        <Checkbox
          checked={checked$.get()}
          onCheckedChange={onChecked}
          required={column$.constraints.required.get()}
        />
      )}
    </Memo>
  );
}

/**
 * Non-default editors for `currency_sign` and `boolean` column types.
 *
 * @param {EditorCellInputInnerProps} innerProps - Shared cell props
 * @return {Partial<ValueMap<SchemaColumnType, FC<EditorCellInputInnerProps>>>} Type-specific components
 */
const SPECIFIC_INPUT_CASES = (
  innerProps: EditorCellInputInnerProps,
): Partial<ValueMap<SchemaColumnType, FC<EditorCellInputInnerProps>>> => ({
  currency_sign: () => <CurrencySignSelect {...innerProps} />,
  boolean: () => <BooleanCheckbox {...innerProps} />,
});

/**
 * Merges {@link SPECIFIC_INPUT_CASES} with the default text input case.
 *
 * @param {EditorCellInputInnerProps} innerProps - Shared cell props
 * @return Record keyed by type with `default` fallback
 */
const INPUT_CASES = (innerProps: EditorCellInputInnerProps) => ({
  ...SPECIFIC_INPUT_CASES(innerProps),
  default: () => <GenericCellInput {...innerProps} />,
});

/**
 * Picks input widget by {@link SchemaColumnType} (text, checkbox, currency sign select, etc.).
 *
 * @param {EditorCellInputProps} props - Observable cell path
 * @return {JSX.Element} Type-specific editor
 */
export function EditorCellInput({ path$ }: EditorCellInputProps) {
  const column$ = useObservable(
    () => STORES.schema.columns[path$.columnName.get()],
  );
  const value$ = useObservable(() => {
    const { rowIndex, columnName } = path$.get();
    return STORES.csv.rows[rowIndex][columnName].get() ?? undefined;
  });

  return (
    <Switch value={column$.type}>
      {INPUT_CASES({ path$, column$, value$ })}
    </Switch>
  );
}
