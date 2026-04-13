import { WorkerPool } from "@/utils/worker.utils";
import type { CsvRow } from "../csv/csv.types";
import type { SchemaColumn } from "../schema";
import type { ValidationErrorList, ValidationResult } from "./validation.types";
import { extractColumnCells } from "./workers/columnCellExtractor.worker";
import { validateColumnTypes } from "./workers/validators/typeValidator.worker";
import { validateUnique } from "./workers/validators/uniqueValidator.worker";
import { validateRequired } from "./workers/validators/requiredValidator.worker";
import { validateRequiredIfFilled } from "./workers/validators/requiredIfFilledValidator.worker";
import { validateRequiredIfNotFilled } from "./workers/validators/requiredIfNotFilledValidator.worker";
import { aggregateErrors } from "./workers/errorAggregator.worker";

const VALIDATION_WORKER_POOL = new WorkerPool();

// we limit the amount of data returned from each worker in order to prevent page crashes due to OOM errors during serialization
// this is already 1000*nb columns * applied validation rules
const MAX_ERRORS_PER_WORKER = 1_000;

/**
 * Runs column validators in workers and merges results into a single {@link ValidationErrorMap}.
 *
 * @param {CsvRow[]} csvRows - All loaded rows
 * @param {SchemaColumn[]} columns - Schema columns with types and constraints
 * @return {Promise<ValidationResult>} Aggregated errors and truncation flag
 */
export async function validateCsvData(
  csvRows: CsvRow[],
  columns: SchemaColumn[],
): Promise<ValidationResult> {
  let truncated = false;
  // TODO: terminate all currenly running workers before triggering validation
  const workerResults = await Promise.all(
    columns.map(async (column) => {
      const columnName = column.name;
      const columnType = column.type;
      const columnCells = await VALIDATION_WORKER_POOL.execute(
        extractColumnCells,
        { columnName, csvRows },
      );
      const typeErrors = await VALIDATION_WORKER_POOL.execute(
        validateColumnTypes,
        {
          columnCells,
          columnType,
          columnName,
          maxOutput: MAX_ERRORS_PER_WORKER,
        },
      );
      let uniqueErrors: ValidationErrorList<"unique"> = [];
      let requiredErrors: ValidationErrorList<"required"> = [];
      let requiredIfFilledErrors: ValidationErrorList<"requiredIfFilled"> = [];
      let requiredIfNotFilledErrors: ValidationErrorList<"requiredIfNotFilled"> =
        [];
      if (column.constraints.unique) {
        uniqueErrors = await VALIDATION_WORKER_POOL.execute(validateUnique, {
          columnCells,
          columnName,
          maxOutput: MAX_ERRORS_PER_WORKER,
        });
      }
      if (column.constraints.required) {
        requiredErrors = await VALIDATION_WORKER_POOL.execute(
          validateRequired,
          { columnCells, columnName, maxOutput: MAX_ERRORS_PER_WORKER },
        );
      }
      if (
        column.constraints.requiredIfFilled?.active &&
        column.constraints.requiredIfFilled.columnName
      ) {
        const relatedCells = await VALIDATION_WORKER_POOL.execute(
          extractColumnCells,
          {
            columnName: column.constraints.requiredIfFilled.columnName,
            csvRows,
          },
        );
        requiredIfFilledErrors = await VALIDATION_WORKER_POOL.execute(
          validateRequiredIfFilled,
          {
            columnCells,
            columnName,
            ifFilledColumnCells: relatedCells,
            ifFilledColumnName: column.constraints.requiredIfFilled.columnName,
            maxOutput: MAX_ERRORS_PER_WORKER,
          },
        );
      }
      if (
        column.constraints.requiredIfNotFilled?.active &&
        column.constraints.requiredIfNotFilled.columnName
      ) {
        const relatedCells = await VALIDATION_WORKER_POOL.execute(
          extractColumnCells,
          {
            columnName: column.constraints.requiredIfNotFilled.columnName,
            csvRows,
          },
        );
        requiredIfNotFilledErrors = await VALIDATION_WORKER_POOL.execute(
          validateRequiredIfNotFilled,
          {
            columnCells,
            columnName,
            ifNotFilledColumnCells: relatedCells,
            ifNotFilledColumnName:
              column.constraints.requiredIfNotFilled.columnName,
            maxOutput: MAX_ERRORS_PER_WORKER,
          },
        );
      }

      if (!truncated) {
        for (const errors of [
          typeErrors,
          uniqueErrors,
          requiredErrors,
          requiredIfFilledErrors,
          requiredIfFilledErrors,
        ]) {
          if (truncated) break;
          if (errors.length === MAX_ERRORS_PER_WORKER) {
            truncated = true;
            break;
          }
        }
      }

      return {
        typeErrors,
        uniqueErrors,
        requiredErrors,
        requiredIfFilledErrors,
        requiredIfNotFilledErrors,
      };
    }),
  );

  const errorMap = await VALIDATION_WORKER_POOL.execute(aggregateErrors, {
    columnErrors: workerResults,
  });

  return { errorMap, truncated };
}
