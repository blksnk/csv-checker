/**
 * Triggers a browser download of a string as a file.
 *
 * @param {string} contents - File body
 * @param {string} filename - Suggested download filename
 * @param {string} [mimeType="text/plain;charset=utf-8"] - MIME type for the blob
 * @return {void}
 */
export function downloadStringAsFile(
  contents: string,
  filename: string,
  mimeType = "text/plain;charset=utf-8",
): void {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
