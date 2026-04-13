import type { SchemaColumnRecord } from "@/stores/schema";
import type { VoidFn } from "@ubloimmo/front-util";

/** Props for the side panel that previews a dropped file before import. */
export type ImporterFilePreviewProps = {
  file: File;
  cancel: VoidFn;
};

/** Internal preview body: parsed columns promise without cancel (used with `use()`). */
export type ImporterFilePreviewContentProps = Omit<
  ImporterFilePreviewProps,
  "cancel"
> & {
  columnsPromise: Promise<SchemaColumnRecord>;
};
