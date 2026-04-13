import { useEffectOnce } from "@legendapp/state/react";
import type { Nullish, VoidFn } from "@ubloimmo/front-util";
import { useState, type RefObject } from "react";

type UseVisibilityCallbackFn = VoidFn<[visible: boolean]>;

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

export function useIsVisible<TElement extends HTMLElement>(
  ref: RefObject<Nullish<TElement>>,
) {
  const [isIntersecting, setIntersecting] = useState(false);
  useVisibilityChange(ref, setIntersecting);

  return isIntersecting;
}
