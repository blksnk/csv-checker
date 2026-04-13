import {
  isArray,
  isObject,
  objectFromEntries,
  type Nullish,
  type Optional,
  type Predicate,
} from "@ubloimmo/front-util";
import { isEmptyString, isNonEmptyString } from "./string.utils";
import { isMap } from "./map.utils";
import { useMemo } from "react";

type CssClassRecord =
  | Record<string, Nullish<boolean>>
  | Map<string, Nullish<boolean>>;
type CssClassArray = (
  | Nullish<string>
  | [className: string, active: Nullish<boolean>]
)[];
type CssClassInput = CssClassArray | [CssClassRecord];

/**
 * Predicate typescript function that checks whether a provided {@link CssClassInput} contains a single {@link CssClassRecord}
 *
 * @param {CssClassInput} classes — css class input value to check
 * @returns — true if the value corresponds to a {@link CssClassRecord}
 */
const isClassRecord = (classes: CssClassInput): classes is [CssClassRecord] => {
  return (
    isArray(classes) &&
    classes.length === 1 &&
    !isArray(classes[0]) &&
    (isObject(classes[0]) || isMap(classes[0]))
  );
};

const isClassArray = isArray as Predicate<CssClassArray>;

/**
 * Combines multiple Css classes into a single string
 *
 * @param {CssClassInput} classes - List of classes to combine
 * @returns {Optional<string>} A concatenated string containing all provided active classes or undefined if none active
 *
 * @example
 * cssClasses("base", "secondary", ["not-included", false], ["included", true])
 * // -> "base secondary included"
 * cssClasses("base", "secondary", "included")
 * // -> "base secondary included"
 * cssClasses({ base: true, secondary: true, "not-included": false, included: true })
 * // -> "base secondary included"
 */
export const cssClasses = (...classes: CssClassInput): Optional<string> => {
  if (!classes.length) return undefined;

  let classStr = "";

  const appendClass = (classKey: string) => {
    classStr += ` ${classKey}`;
  };

  if (classes.length === 1 && isNonEmptyString(classes[0])) return classes[0];

  if (isClassRecord(classes)) {
    const record: Record<string, Nullish<boolean>> = isMap(classes[0])
      ? objectFromEntries(Array.from(classes[0].entries()))
      : classes[0];
    for (const classKey in record) {
      const active = record[classKey];
      if (active) appendClass(classKey);
    }
    if (isEmptyString(classStr)) return undefined;
    return classStr.trim();
  }

  for (const item of classes) {
    if (isNonEmptyString(item)) appendClass(item);
    if (!isClassArray(item)) continue;
    const [classKey, active] = item;
    if (active) appendClass(classKey);
  }

  if (isEmptyString(classStr)) return undefined;
  return classStr.trim();
};

/**
 * Memoized {@link cssClasses} utility. Combines multiple Css classes into a single string.
 * @param {CssClassInput} classes - List of classes to combine
 * @returns {Optional<string>} A concatenated string containing all provided active classes or undefined if none active
 *
 * @example
 * useCssClasses("base", "secondary", ["not-included", false], ["included", true])
 * // -> "base secondary included"
 * useCssClasses("base", "secondary", "included")
 * // -> "base secondary included"
 * uCssClasses({ base: true, secondary: true, "not-included": false, included: true })
 * // -> "base secondary included"
 */
export const useCssClasses = (...classes: CssClassInput): Optional<string> => {
  return useMemo<Optional<string>>(() => cssClasses(...classes), [classes]);
};
