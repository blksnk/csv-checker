import { Paragraph, Tooltip as T } from "tamagui";
import type { TooltipProps } from "./Tooltip.types";

/**
 * Hover/focus tooltip with arrow and light theme content.
 *
 * @param {TooltipProps} props - Trigger children, content, placement
 * @return {JSX.Element} Tamagui tooltip
 */
export function Tooltip({
  children,
  content,
  placement = "top",
}: TooltipProps) {
  return (
    <T placement={placement}>
      <T.Trigger width="fit-content">{children}</T.Trigger>
      <T.Content
        theme="light"
        enterStyle={{ x: 0, y: -5, opacity: 0, scale: 0.9 }}
        exitStyle={{ x: 0, y: -5, opacity: 0, scale: 0.9 }}
        scale={1}
        x={0}
        y={0}
        opacity={1}
        py="$2"
        px="$3"
        transition={[
          "quick",
          {
            opacity: {
              overshootClamping: true,
            },
          },
        ]}
      >
        <T.Arrow />
        <Paragraph size="$2" maxWidth={200}>
          {content}
        </Paragraph>
      </T.Content>
    </T>
  );
}
