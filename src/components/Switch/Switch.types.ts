import type { VoidFn } from "@ubloimmo/front-util";

export type SwitchProps = {
  checked?: boolean;
  onChange?: VoidFn<[boolean]>;
  required?: boolean;
  name?: string;
  id?: string;
};
