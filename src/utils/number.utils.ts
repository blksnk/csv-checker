/**
 * Clamps a number to the inclusive range `[min, max]`.
 *
 * @param {number} n - Value to clamp
 * @param {number} min - Lower bound (inclusive)
 * @param {number} max - Upper bound (inclusive)
 * @return {number} `n` limited to `[min, max]`
 */
export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}
