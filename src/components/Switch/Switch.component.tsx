import { Switch as Sw, View } from "tamagui";
import type { SwitchProps } from "./Switch.types";

export function Switch(props: SwitchProps) {
  return (
    <View height="$4" justify="center">
      <Sw
        id={props.id}
        checked={props.checked}
        onCheckedChange={props.onChange}
        required={props.required}
        name={props.name}
        size="$3"
        cursor="pointer"
        transition="300ms"
        activeStyle={{
          backgroundColor: "$green7",
        }}
      >
        <Sw.Thumb transition="quick" />
      </Sw>
    </View>
  );
}
