/** CSV file drop target using `react-dropzone`. */
export type DropZoneProps = {
  onDrop?: (file: File) => void;
  label?: string;
};
