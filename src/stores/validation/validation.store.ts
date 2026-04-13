import {
  batch,
  observable,
  ObservableHint,
  type Observable,
} from "@legendapp/state";
import type { ValidationStore } from "./validation.types";
import { validateCsvData } from "./validation.utils";
import { csv$ } from "../csv";
import { schema$ } from "../schema";
import { objectKeys } from "@ubloimmo/front-util";

/** Async validation state, flattened error paths, and `validate` / `invalidate`. */
export const validation$: Observable<ValidationStore> =
  observable<ValidationStore>({
    state: "pending",
    errorMap: ObservableHint.plain({}),
    errorMapIsTruncated: false,
    errorCellPaths: () => {
      return objectKeys(validation$.errorMap.get());
    },
    errorCount: () => {
      return validation$.errorCellPaths.get().length;
    },
    lastValidationTimestamp: null,
    validate: async () => {
      validation$.lastValidationTimestamp.set(Date.now());
      batch(() => {
        validation$.state.set("running");
      });
      const { errorMap, truncated } = await validateCsvData(
        csv$.rows.peek(),
        schema$.columnsArray.peek(),
      );
      batch(() => {
        validation$.errorMap.set(errorMap);
        validation$.errorMapIsTruncated.set(truncated);
        validation$.state.set("done");
      });
    },
    invalidate: () => {
      validation$.state.set("stale");
    },
  });
