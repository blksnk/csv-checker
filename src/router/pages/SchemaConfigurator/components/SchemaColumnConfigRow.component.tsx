import { Field, Select, Switch, type SelectOption } from "@/components";
import { STORES } from "@/stores";
import {
  type SchemaColumnConstraints,
  type SchemaColumnName,
  type SchemaColumnRelationConstraint,
  type SchemaColumnType,
} from "@/stores/schema";
import { isNonEmptyString } from "@/utils/string.utils";
import type { Observable } from "@legendapp/state";
import { Memo, Show, useObservable } from "@legendapp/state/react";
import type { DeepKeyOfType } from "@ubloimmo/front-util";
import { H4, Paragraph, Separator, XStack, YStack } from "tamagui";
import { COLUMN_TYPE_OPTIONS } from "../SchemaConfigurator.constants";

type SchemaColumnConfigRowProps = {
  item$: Observable<SchemaColumnName>;
  columnNameOptions$: Observable<SelectOption<SchemaColumnName>[]>;
};

type RelationConstraintKey = DeepKeyOfType<
  Required<SchemaColumnConstraints>,
  SchemaColumnRelationConstraint
>;

type BooleanConstraintKey = Exclude<
  keyof SchemaColumnConstraints,
  RelationConstraintKey
>;

export function SchemaColumnConfigRow({
  item$: columnName$,
  columnNameOptions$,
}: SchemaColumnConfigRowProps) {
  const column$ = useObservable(() => STORES.schema.columns[columnName$.get()]);

  const setRelationConstraintColumn =
    (constraint: RelationConstraintKey) =>
    (relationColumnName: SchemaColumnName) => {
      STORES.schema.configureColumnConstraints(
        columnName$.peek(),
        (constraints$) => {
          constraints$[constraint].set({
            active: true,
            columnName: relationColumnName,
          });
        },
      );
    };

  const toggleRelationConstraint =
    (constraint: RelationConstraintKey) => (active: boolean) => {
      STORES.schema.configureColumnConstraints(
        columnName$.peek(),
        (constraints$) => {
          constraints$[constraint].assign({ active });
        },
      );
    };

  const setBooleanConstraint =
    (constraint: BooleanConstraintKey) => (active: boolean) => {
      STORES.schema.configureColumnConstraints(
        columnName$.peek(),
        (constraints$) => {
          constraints$[constraint].set(active);
        },
      );
    };

  const setType = (type: SchemaColumnType) => {
    STORES.schema.configureColumnType(columnName$.peek(), type);
  };

  return (
    <YStack
      gap="$2"
      width="100%"
      py="$4"
      px="$4"
      rounded="$6"
      backgroundColor="$background08"
    >
      <XStack items="baseline" gap="$2">
        <H4>
          <Memo>{column$.name}</Memo>
        </H4>
        <Paragraph size="$5" fontWeight="500" color="$gray10">
          (column #<Memo>{column$.index}</Memo>)
        </Paragraph>
      </XStack>

      <YStack gap="0">
        <Paragraph size="$1" color="$gray11" fontWeight="600">
          Beginning with:
        </Paragraph>
        <Paragraph my="$2" size="$1" color="$gray10" overflow="hidden" ellipsis>
          <Memo>
            {() =>
              (STORES.schema.columns[columnName$.get()].previewData.get() ?? [])
                .map((item) => String(item))
                .filter(isNonEmptyString)
                .join(", ")
            }
          </Memo>
        </Paragraph>
      </YStack>

      <Separator mt="$3" />

      <XStack width="100%" my="$2" flexGrow={1} gap="$4" flexWrap="wrap">
        <Field
          label="Format"
          tooltip="Dictates the type of the data held in this column. All cells in this column should conform to the chosen format."
          Input={({ id }) => (
            <Memo>
              {() => (
                <Select
                  id={id}
                  value={column$.get().type}
                  placeholder="Column type"
                  onChange={setType}
                  options={COLUMN_TYPE_OPTIONS}
                />
              )}
            </Memo>
          )}
        />
        <Separator vertical />
        <Field
          label="Unique"
          tooltip="All cells in this column must have different values."
          Input={({ id }) => (
            <Memo>
              {() => (
                <Switch
                  id={id}
                  checked={column$.get().constraints.unique}
                  onChange={setBooleanConstraint("unique")}
                />
              )}
            </Memo>
          )}
        />
        <Separator vertical />
        <Field
          label="Required"
          tooltip="All cells in this column must be filled out."
          Input={({ id }) => (
            <Memo>
              {() => (
                <Switch
                  id={id}
                  checked={column$.get().constraints.required}
                  onChange={setBooleanConstraint("required")}
                />
              )}
            </Memo>
          )}
        />
        <Field
          label="Required if filled"
          tooltip="Cells in this column should only be required if another cell in the same row is filled."
          Input={({ id }) => (
            <XStack gap="$4" width={"100%"}>
              <Memo>
                {() => (
                  <Switch
                    id={id}
                    checked={column$.get().constraints.requiredIfFilled?.active}
                    onChange={toggleRelationConstraint("requiredIfFilled")}
                  />
                )}
              </Memo>
              <Show
                if={() =>
                  STORES.schema.columns[
                    columnName$.get()
                  ].constraints.requiredIfFilled.active.get()
                }
              >
                {() => (
                  <Memo>
                    {() => (
                      <Select
                        value={
                          column$.get().constraints.requiredIfFilled?.columnName
                        }
                        options={columnNameOptions$.get()}
                        onChange={setRelationConstraintColumn(
                          "requiredIfFilled",
                        )}
                        placeholder="Select a column"
                      />
                    )}
                  </Memo>
                )}
              </Show>
            </XStack>
          )}
        />
        <Field
          label="Required if empty"
          tooltip="Cells in this column should only be required if another cell in the same row is empty."
          Input={({ id }) => (
            <XStack gap="$4" width={"100%"}>
              <Memo>
                {() => (
                  <Switch
                    id={id}
                    checked={
                      column$.get().constraints.requiredIfNotFilled?.active
                    }
                    onChange={toggleRelationConstraint("requiredIfNotFilled")}
                  />
                )}
              </Memo>
              <Show
                if={() =>
                  STORES.schema.columns[
                    columnName$.get()
                  ].constraints.requiredIfNotFilled.active.get()
                }
              >
                {() => (
                  <Memo>
                    {() => (
                      <Select
                        value={
                          column$.get().constraints.requiredIfNotFilled
                            ?.columnName
                        }
                        options={columnNameOptions$.get()}
                        onChange={setRelationConstraintColumn(
                          "requiredIfNotFilled",
                        )}
                        placeholder="Select a column"
                      />
                    )}
                  </Memo>
                )}
              </Show>
            </XStack>
          )}
        />
      </XStack>
    </YStack>
  );
}
