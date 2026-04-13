import type { SchemaColumnRecord } from "@/stores/schema";
import type { VoidFn } from "@ubloimmo/front-util";

export type ImporterFilePreviewProps = {
  file: File;
  cancel: VoidFn;
};

export type ImporterFilePreviewContentProps = Omit<
  ImporterFilePreviewProps,
  "cancel"
> & {
  columnsPromise: Promise<SchemaColumnRecord>;
};
