import { useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import type { DropZoneProps } from "./Dropzone.types";

import styles from "./DropZone.module.css";
import { Theme } from "@tamagui/web";
import { useCssClasses } from "../../utils/css.utils";
import { Paragraph } from "tamagui";
import { lineBreaker } from "@/utils/string.utils";
import { Upload } from "@tamagui/lucide-icons-2";

/**
 * Single-file CSV picker with drag-and-drop and click-to-upload.
 *
 * @param {DropZoneProps} props - `onDrop` handler and optional label copy
 * @return {JSX.Element} Themed dropzone region
 */
export function DropZone(props: DropZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles.at(0);
      if (!file) return;

      props.onDrop?.(file);
    },
    [props],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [],
    },
    multiple: false,
  });

  const klass = useCssClasses(styles.dropzone, [styles.active, isDragActive]);

  const label = useMemo(
    () => props.label ?? "Drop a CSV file here, or click to upload.",
    [props.label],
  );

  return (
    <Theme name={isDragActive ? "accent" : "surface1"}>
      <div {...getRootProps()} className={klass}>
        <input {...getInputProps()} />
        <Upload size="$4" />
        <Paragraph
          size="$5"
          textAlign="center"
          hoverStyle={{ color: "$accent0" }}
          transition="quick"
        >
          {lineBreaker(label)}
        </Paragraph>
      </div>
    </Theme>
  );
}
