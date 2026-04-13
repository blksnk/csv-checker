/**
 * Type guard: value is a `Map` instance.
 *
 * @template TKey - Map key type
 * @template TValue - Map value type
 * @param {unknown} value - Value to test
 * @return {value is Map<TKey, TValue>} Whether `value` is a `Map`
 */
export const isMap = <TKey, TValue>(
  value: unknown,
): value is Map<TKey, TValue> => {
  return value instanceof Map;
};
