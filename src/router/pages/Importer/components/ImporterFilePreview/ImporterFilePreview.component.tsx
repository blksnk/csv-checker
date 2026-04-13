import {
  H3,
  H4,
  Paragraph,
  Separator,
  Spinner,
  XStack,
  YStack,
  Button,
  H2,
} from "tamagui";
import type {
  ImporterFilePreviewContentProps,
  ImporterFilePreviewProps,
} from "./ImporterFilePreview.types";
import { Fragment, Suspense, use, useMemo, useState } from "react";
import { schemaColumnsFromCsvFile } from "@/stores/schema/schema.utils";
import { objectValues } from "@ubloimmo/front-util";
import { isNonEmptyString } from "@/utils/string.utils";
import { Badge, Banner } from "@/components";
import { STORES } from "@/stores";
import { when } from "@legendapp/state";
import { useNavigate } from "react-router";
import { PAGES } from "@/router/pages";
import { Tooltip } from "@/components";
import { Show, useValue } from "@legendapp/state/react";
import { Upload, X } from "@tamagui/lucide-icons-2";

export function ImporterFilePreview({
  file,
  cancel,
}: ImporterFilePreviewProps) {
  const columnsPromise = schemaColumnsFromCsvFile(file);
  const navigate = useNavigate();
  const [inProgress, setInProgress] = useState(false);

  const onImportClick = async () => {
    if (inProgress) return;
    setInProgress(true);
    STORES.csv.loadFromFile(file);
    await when(STORES.csv.loaded);
    navigate(PAGES.SchemaConfigurator.path);
  };
  return (
    <YStack
      flex={2}
      gap="$4"
      p="$4"
      pb="$10"
      borderLeftColor="$borderColor"
      borderLeftWidth={1}
      position="relative"
    >
      <YStack overflow="scroll" gap="$4" flex={1}>
        <H2 fontWeight="600">File preview</H2>
        <Paragraph>
          Here is a short preview of the file you just submitted. Take a minute
          looking it over, making sure no column is missing. Once you're sure
          you wish to proceed, click on the "Import" button down below to submit
          it for validation.
        </Paragraph>
        <Separator />
        <H3 fontWeight="600">Name: {file.name}</H3>

        <Suspense fallback={<Spinner />}>
          <FilePreviewContents file={file} columnsPromise={columnsPromise} />
        </Suspense>
      </YStack>
      <Banner>
        <Button iconAfter={X} size="$4" onClick={cancel}>
          Cancel
        </Button>
        <Button
          iconAfter={Upload}
          size="$4"
          onClick={onImportClick}
          disabled={inProgress}
          cursor={inProgress ? "wait" : "pointer"}
          theme={inProgress ? "black" : "accent"}
        >
          {inProgress ? "Upload in progress... Please wait" : "Upload file"}
        </Button>
      </Banner>
    </YStack>
  );
}

function FilePreviewContents({
  file,
  columnsPromise,
}: ImporterFilePreviewContentProps) {
  const columns = use(columnsPromise);

  const deletedColumns = useValue(() =>
    [...STORES.schema.columnsArray.get()]
      .filter(({ name }) => !columns[name])
      .sort((a, b) => a.index - b.index),
  );

  const columnsArr = useMemo(
    () => objectValues(columns).sort((a, b) => a.index - b.index),
    [columns],
  );

  const mbSize = useMemo(() => (file.size / 1_000_000).toFixed(2), [file]);

  const lastModified = useMemo(
    () => new Date(file.lastModified).toLocaleString(),
    [file],
  );

  return (
    <>
      <Separator />
      <XStack gap="$4" justify="space-evenly" width="100%">
        <Paragraph>Size: {mbSize} Mo</Paragraph>
        <Separator vertical />
        <Paragraph>Last modified: {lastModified}</Paragraph>
        <Separator vertical />
        <Paragraph>
          {columnsArr.length} Column{columnsArr.length === 1 ? "" : "s"}
        </Paragraph>
      </XStack>
      <Separator />
      <YStack gap="$4" flex={1} pb="$8">
        <H3 fontWeight="600" bg="white" zIndex={1}>
          Spreadsheet columns
        </H3>

        <Paragraph>
          We found {columnsArr.length} column
          {columnsArr.length === 1 ? "" : "s"} in the spreadsheet you just
          dropped.
        </Paragraph>

        {columnsArr.map(({ name, index, previewData }) => (
          <Fragment key={`${name}-${index}`}>
            {!!index && <Separator />}
            <YStack gap="$2" justify="space-between">
              <XStack gap="$4" items="center" justify="space-between">
                <XStack items="baseline" gap="$2">
                  <H4 fontWeight="500">{name}</H4>
                  <Paragraph size="$6" fontWeight="500" color="$gray10">
                    (column #{index})
                  </Paragraph>
                </XStack>
                <Show
                  if={STORES.schema.columns[name]}
                  else={() => (
                    <Tooltip content="This column's data will be added to ">
                      <Badge theme="blue">New column</Badge>
                    </Tooltip>
                  )}
                >
                  {() => (
                    <Tooltip content="This column's rules will be preserved after the upload.">
                      <Badge theme="green">Existing column</Badge>
                    </Tooltip>
                  )}
                </Show>
              </XStack>
              <Paragraph size="$1" color="$gray11" fontWeight="600">
                Beginning with:
              </Paragraph>
              <Paragraph color="$gray10" size="$1">
                {previewData
                  .map((item) => String(item))
                  .filter(isNonEmptyString)
                  .join(", ")}
              </Paragraph>
            </YStack>
          </Fragment>
        ))}

        {!!deletedColumns.length && (
          <>
            <Separator />
            <H3
              fontWeight="600"
              position="sticky"
              top="0"
              bg="white"
              zIndex={1}
            >
              Deleted columns
            </H3>

            <Paragraph>
              These columns are currently present in your draft but not in the
              spreadsheet you just dropped.
              <br />
              Their data and validation rules will be deleted if you upload this
              file as-is.
            </Paragraph>

            {deletedColumns.map(({ name, index, previewData }) => (
              <Fragment key={`${name}-${index}`}>
                {!!index && <Separator />}
                <YStack gap="$2" justify="space-between">
                  <XStack gap="$4" items="center" justify="space-between">
                    <XStack items="baseline" gap="$2">
                      <H4
                        style={{ textDecoration: "line-through" }}
                        fontWeight="500"
                      >
                        {name}
                      </H4>
                      <Paragraph size="$6" fontWeight="500" color="$gray10">
                        (column #{index})
                      </Paragraph>
                    </XStack>
                    <Tooltip content="This column's rules & data will be deleted upon upload.">
                      <Badge theme="error">Deleted column</Badge>
                    </Tooltip>
                  </XStack>
                  <Paragraph size="$1" color="$gray11" fontWeight="600">
                    Beginning with:
                  </Paragraph>
                  <Paragraph color="$gray10" size="$1">
                    {previewData
                      .map((item) => String(item))
                      .filter(isNonEmptyString)
                      .join(", ")}
                  </Paragraph>
                </YStack>
              </Fragment>
            ))}
          </>
        )}
      </YStack>
    </>
  );
}
