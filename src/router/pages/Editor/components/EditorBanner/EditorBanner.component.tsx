import { STORES } from "@/stores";
import { Memo } from "@legendapp/state/react";
import { Button, Paragraph, Separator, XStack, type ThemeName } from "tamagui";
import { Banner, Badge, Tooltip } from "@/components";
import { capitalize, type ValueMap } from "@ubloimmo/front-util";
import type { ValidationState } from "@/stores/validation";
import { CheckCircle, Download } from "@tamagui/lucide-icons-2";
import { EditorBannerNavigator } from "./EditorBannerNavigator.component";

const VALIDATION_STATE_COLORS: ValueMap<ValidationState, ThemeName> = {
  done: "light",
  running: "yellow_surface1",
  pending: "yellow_surface1",
  stale: "warning_surface1",
};

export function EditorBanner() {
  const runValidation = () => {
    STORES.validation.validate();
  };

  return (
    <Banner>
      <XStack gap="$2" flex={1} justify="flex-start" items="center">
        <Paragraph fontWeight="500">
          <Memo>{STORES.csv.file.name}</Memo>
        </Paragraph>
        <Separator vertical />
        <Badge>
          <Memo>{() => STORES.csv.rows.get().length}</Memo> Rows
        </Badge>
        <Memo>
          {() => (
            <Badge
              theme={VALIDATION_STATE_COLORS[STORES.validation.state.get()]}
            >
              Validation {capitalize(STORES.validation.state.get())}
            </Badge>
          )}
        </Memo>
        <Memo>
          {() => {
            const errorCount = STORES.validation.errorCount.get();
            const truncated = STORES.validation.errorMapIsTruncated.get();
            return (
              <Tooltip content="Click to see open the validation panel and see all errors in detail.">
                <Badge
                  theme={errorCount ? "error_surface1" : "success"}
                  onClick={STORES.editor.showErrorPanel.toggle}
                >
                  {errorCount ? `${errorCount}${truncated ? "+" : ""}` : "No"}{" "}
                  Errors
                </Badge>
              </Tooltip>
            );
          }}
        </Memo>
      </XStack>

      <EditorBannerNavigator />

      <XStack flex={1} justify="flex-end" gap="$2">
        <Memo>
          {() => (
            <Tooltip content="Validates the whole spreadsheet according to the rules your defined.">
              <Button
                disabled={STORES.validation.state.get() === "running"}
                theme="black"
                icon={CheckCircle}
                size="$2"
                onClick={runValidation}
              >
                Re-validate
              </Button>
            </Tooltip>
          )}
        </Memo>
        <Tooltip content="Download a copy of the data in its current state as a CSV file.">
          <Button
            size="$2"
            icon={Download}
            theme="accent"
            onClick={STORES.csv.download}
          >
            Download
          </Button>
        </Tooltip>
      </XStack>
    </Banner>
  );
}
