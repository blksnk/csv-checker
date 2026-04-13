import type { VoidFn } from "@ubloimmo/front-util";

/** Controlled boolean switch mapped to Tamagui `Switch`. */
export type SwitchProps = {
  checked?: boolean;
  onChange?: VoidFn<[boolean]>;
  required?: boolean;
  name?: string;
  id?: string;
};
