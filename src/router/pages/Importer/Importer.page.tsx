import { PageLayout } from "@/layouts";
import { DropZone } from "@/components";
import { H4, Paragraph, XStack, YStack } from "tamagui";
import { useMemo, useState } from "react";
import type { Optional } from "@ubloimmo/front-util";
import { ImporterFilePreview } from "./components/ImporterFilePreview/ImporterFilePreview.component";
import { AlertTriangle } from "@tamagui/lucide-icons-2";
import { useValue } from "@legendapp/state/react";
import { STORES } from "@/stores";
import { lineBreaker } from "@/utils/string.utils";

export function ImporterPage() {
  const [file, setFile] = useState<Optional<File>>(undefined);

  const removeFile = () => setFile(undefined);

  const storedFileName = useValue(STORES.csv.file.name);

  const dropZoneLabel = useMemo(() => {
    if (file)
      return `You dropped ${file.name}.\nDrop another file to preview it.`;
    return "Click or drop your spreadsheet file here in .csv format to preview it.";
  }, [file]);

  const overwriteWarning = useMemo(() => {
    if (!file || !storedFileName) return null;
    const isSameFile = file.name === storedFileName;
    const body = `Uploading this file ${isSameFile ? "" : `(${file.name}) `}will overwrite the data in your current draft (${storedFileName}) and possibly update your validation rules:
      Rules for existing columns will be preserved. New columns will be added while removed columns will be deleted from the current rule set.

      Please make sure you wish to overwrite it before proceeding with the upload.`;
    if (file.name === storedFileName) {
      return {
        title:
          "You just dropped a file with the same name as the one you're currenly editing.",
        body,
      };
    }
    return {
      title:
        "It seems you uploaded a different file from the one you're currenly editing.",
      body,
    };
  }, [file, storedFileName]);

  return (
    <PageLayout
      noPadding
      title="Upload your data"
      subTitle="Start with uploading the data you wish to import."
    >
      <XStack height="100%">
        <YStack flex={1} height="100%" p="$4" gap="$4">
          {!file && (
            <>
              <H4>Get started by dropping a spreadsheet file in CSV format.</H4>
              <Paragraph>
                You'll get to preview its contents{" "}
                {storedFileName
                  ? `and compare it with your current draft (${storedFileName}) `
                  : ""}
                before deciding whether to upload it or not.
              </Paragraph>
            </>
          )}

          <DropZone onDrop={setFile} label={dropZoneLabel} />
          {overwriteWarning && (
            <YStack
              width="100%"
              theme="warning_surface1"
              rounded="$4"
              p="$4"
              gap="$1"
              bg="$background"
              border="1px solid $borderColor"
            >
              <XStack gap="$4">
                <AlertTriangle size="$2" />
                <Paragraph fontWeight="800" mb="$4">
                  {overwriteWarning.title}
                </Paragraph>
              </XStack>
              <Paragraph size="$3">
                {lineBreaker(overwriteWarning.body)}
              </Paragraph>
            </YStack>
          )}
        </YStack>
        {file && <ImporterFilePreview file={file} cancel={removeFile} />}
      </XStack>
    </PageLayout>
  );
}
