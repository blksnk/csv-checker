import { useEffectOnce } from "@legendapp/state/react";
import type { Nullish, VoidFn } from "@ubloimmo/front-util";
import { useState, type RefObject } from "react";

/** Callback invoked when intersection visibility toggles. */
type UseVisibilityCallbackFn = VoidFn<[visible: boolean]>;

/**
 * Subscribes to `IntersectionObserver` visibility for a ref’s element (runs once on mount).
 *
 * @template TElement - HTMLElement subtype
 * @param {RefObject<Nullish<TElement>>} ref - Target element ref
 * @param {UseVisibilityCallbackFn} callback - Receives `true` when intersecting
 * @return {void}
 */
export function useVisibilityChange<TElement extends HTMLElement>(
  ref: RefObject<Nullish<TElement>>,
  callback: UseVisibilityCallbackFn,
) {
  useEffectOnce(() => {
    const observer = new IntersectionObserver(([entry]) =>
      callback(entry.isIntersecting),
    );

    if (ref.current) observer.observe(ref.current);
    return () => {
      observer.disconnect();
    };
  }, [callback]);
}

/**
 * Boolean hook: whether the ref element is currently intersecting the viewport.
 *
 * @template TElement - HTMLElement subtype
 * @param {RefObject<Nullish<TElement>>} ref - Target element ref
 * @return {boolean} Latest `isIntersecting` state
 */
export function useIsVisible<TElement extends HTMLElement>(
  ref: RefObject<Nullish<TElement>>,
) {
  const [isIntersecting, setIntersecting] = useState(false);
  useVisibilityChange(ref, setIntersecting);

  return isIntersecting;
}
