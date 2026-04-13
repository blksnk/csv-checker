import { type SelectOption } from "@/components";
import { PageLayout } from "@/layouts";
import { STORES } from "@/stores";
import type { SchemaColumnName } from "@/stores/schema";
import { For, useObservable } from "@legendapp/state/react";
import { H2, H3, Paragraph, Separator, Text, YStack } from "tamagui";
import { SchemaColumnConfigRow } from "./components/SchemaColumnConfigRow.component";
import { Link } from "react-router";
import { PAGES } from "..";

export function SchemaConfiguratorPage() {
  const columnNameOptions$ = useObservable<SelectOption<SchemaColumnName>[]>(
    () => {
      return [...STORES.schema.columnNames.get()]
        .sort((a, b) => a.localeCompare(b))
        .map((value) => ({ label: value, value }));
    },
  );

  return (
    <PageLayout
      title="Rules"
      padding="$4"
      subTitle="This is where you can assign validation rules to your data."
    >
      <YStack pb="$10" pt="$4" gap="$4">
        <H2 fontWeight="600">Data validation rules</H2>

        <Paragraph>
          Define what consitutes "valid" data by assigning rules to each column
          in your spreadsheet.
          <br />
          No need to do it all at once: the rules you set may be changed &
          updated at any time.
        </Paragraph>

        <Paragraph>
          Once you're satisfied, head to the "
          <Link to={PAGES.Editor.path}>
            <Text fontWeight="500">{PAGES.Editor.displayName}</Text>
          </Link>
          " page to see, edit and fix your data.
        </Paragraph>

        <Separator />

        <H3 fontWeight="600" bg="white">
          Spreadsheet columns
        </H3>

        <For
          each={STORES.schema.columnNames}
          item={SchemaColumnConfigRow}
          itemProps={{ columnNameOptions$ }}
        />
      </YStack>
    </PageLayout>
  );
}
