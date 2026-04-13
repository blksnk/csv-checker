import { STORES } from "@/stores";
import { Memo, Show, useValue } from "@legendapp/state/react";
import {
  BrushCleaning,
  X,
  CheckCircle,
  Download,
} from "@tamagui/lucide-icons-2";
import { Callout, Tooltip } from "@/components";
import {
  Button,
  H3,
  H4,
  Paragraph,
  Separator,
  Text,
  XStack,
  YStack,
} from "tamagui";
import { EditorErrorItem } from "./EditorErrorItem.component";
import { lineBreaker } from "@/utils/string.utils";
import { Virtuoso } from "react-virtuoso";
import { Link } from "react-router";
import { PAGES } from "@/router/pages";

export function EditorErrorPanel() {
  const errorCellPaths = useValue(
    () => STORES.validation.errorCellPaths.get(),
    {
      shallow: true,
    },
  );

  return (
    <YStack
      flex={1}
      height="100%"
      borderRightColor="$borderColor"
      borderRightWidth={1}
      bg="$background"
      px="$4"
      py="$2"
      gap="$4"
      pb="$10"
    >
      <XStack items="center" justify="space-between" mr="$-4" pr="$2">
        <H3 fontWeight="600">Validation results</H3>
        <Tooltip
          content={lineBreaker(
            'Click to close this panel.\nYou can always open it again by cliking on the "Errors" badge at the bottom-left of the screen.',
          )}
        >
          <Button
            iconAfter={X}
            onClick={STORES.editor.showErrorPanel.toggle}
            size="$2"
          ></Button>
        </Tooltip>
      </XStack>
      <Paragraph>
        Your data currently contains&nbsp;
        <Memo>
          {() => {
            const count = STORES.validation.errorCount.get();
            const truncated = STORES.validation.errorMapIsTruncated.get();
            return (
              <Text fontWeight="bold" theme={count ? "error" : "green"}>
                {count ? `${truncated ? "at least " : ""}${count}` : "no"} cells
                with errors
              </Text>
            );
          }}
        </Memo>
        .
      </Paragraph>

      <Show if={STORES.validation.errorMapIsTruncated}>
        {() => (
          <Callout title="Numerous errors detected." theme="yellow">
            Your data contains a large number of errors. This can indicate a
            mismatch between your speadsheet's data and your validation rules.
            <br />
            Are you sure your validation rules are correct?
            <br />
            <br />
            If needed, you can always review and update your{" "}
            <Link to={PAGES.SchemaConfigurator.path}>
              <Text fontWeight="600">validation rules</Text>
            </Link>
            .
          </Callout>
        )}
      </Show>

      <Separator />

      <Show
        if={() => !!STORES.validation.errorCount.get()}
        else={() => (
          <YStack
            items="center"
            justify="center"
            gap="$4"
            p="$4"
            theme="success_surface1"
            bg="$background"
            rounded="$4"
            flex={1}
          >
            <BrushCleaning size="$6" />
            <H4>Nicely done!</H4>
            <Paragraph textAlign="center" size="$5">
              According to the rules you defined, you managed to fix all errors!
              <br />
              Your data is now clean and ready to import.
            </Paragraph>

            <Tooltip content="Download your speadsheet as a CSV file, free of errors.">
              <Button
                icon={Download}
                theme="accent"
                onClick={STORES.csv.download}
              >
                Download my data as a CSV file
              </Button>
            </Tooltip>
            <Tooltip content="Better safe than sorry!" placement="bottom">
              <Button
                icon={CheckCircle}
                size="$2"
                theme="surface2"
                onClick={STORES.validation.validate}
              >
                Re-validate your data just to make sure?
              </Button>
            </Tooltip>
          </YStack>
        )}
      >
        {() => (
          <YStack flex={1}>
            <Virtuoso
              style={{ height: "100%" }}
              data={errorCellPaths}
              itemContent={(_, path) => <EditorErrorItem path={path} />}
            />
          </YStack>
        )}
      </Show>
      {/*<For each={STORES.validation.errorMap} item={EditorErrorItem} />*/}
    </YStack>
  );
}
