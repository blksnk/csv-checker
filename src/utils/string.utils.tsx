import { isString } from "@ubloimmo/front-util";
import { Fragment, type ReactNode } from "react";

/**
 * Checks if the input string is empty.
 *
 * @param {string} str - the input string to be checked
 * @return {boolean} true if the input string is empty, false otherwise
 */
export const isEmptyString = (str: string): boolean => {
  return str.length === 0;
};

/**
 * Checks if the given value is a non-empty string.
 *
 * @param {unknown} value - The value to check.
 * @return {boolean} Whether the value is a non-empty string or not.
 */
export const isNonEmptyString = (value: unknown): value is string => {
  return isString(value) && !isEmptyString(value);
};

/**
 * Breaks a single string into multiple lines based on its occurences of `\n`.
 *
 * @param {string} str - The string to break into multiple lines
 * @param {boolean} [trimLines = false] - Whether to run `.trim()` on each line
 * @returns {ReactNode} The JSX-compatible broken up lines.
 */
export const lineBreaker = (
  str: string,
  trimLines: boolean = false,
): ReactNode => {
  if (isEmptyString(str)) return str;
  return str.split("\n").map((l, index) => {
    const line = trimLines ? l.trim() : l;
    const key = `${line}-${index}`;
    return index ? (
      <Fragment key={key}>
        <br />
        {line}
      </Fragment>
    ) : (
      <Fragment key={key}>{line}</Fragment>
    );
  });
};
