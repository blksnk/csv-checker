/**
 * Predicate typescript function that checks whether the value corresponds to a Map
 *
 * @param value — unknown value to check
 * @returns — true if the value corresponds to a Map
 */
export const isMap = <TKey, TValue>(
  value: unknown,
): value is Map<TKey, TValue> => {
  return value instanceof Map;
};
