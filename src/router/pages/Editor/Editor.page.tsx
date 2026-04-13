import { PageLayout } from "@/layouts";
import { EditorTable } from "./components/EditorTable";
import { Show, useMountOnce } from "@legendapp/state/react";
import { STORES } from "@/stores";
import { EditorBanner } from "./components/EditorBanner";
import { XStack } from "tamagui";
import { EditorErrorPanel } from "./components/EditorErrorPanel";
import { when } from "@legendapp/state";

export function EditorPage() {
  // setup keyboard events for undo/redo
  useMountOnce(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const meta = event.ctrlKey || event.metaKey;
      const shift = event.shiftKey;
      if (!meta) return;
      switch (event.key.toLowerCase()) {
        case "z":
          if (shift) return STORES.editor.history.redo();
          return STORES.editor.history.undo();
        case "u":
          return STORES.editor.history.undo();
        case "r":
          return STORES.editor.history.redo();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  });

  // trigger validation once on mount if stale or pending
  useMountOnce(() => {
    const validateIfNeeded = async () => {
      await when(STORES.csvRowsSync.isLoaded);
      await when(STORES.schemaColumnsSync.isLoaded);
      const state = STORES.validation.state.peek();
      if (state === "pending" || state === "stale") {
        STORES.validation.validate();
      }
    };
    validateIfNeeded();
  });

  return (
    <PageLayout title="Editor" subTitle="Edit & fix your data." noPadding>
      <XStack bg="$background" height="100%">
        <Show if={STORES.editor.showErrorPanel}>
          {() => <EditorErrorPanel />}
        </Show>
        <EditorTable />
      </XStack>
      <EditorBanner />
    </PageLayout>
  );
}
