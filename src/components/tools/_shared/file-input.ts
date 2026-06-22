/**
 * Bounded file reading for upload tools (color-palette, image-to-data-uri).
 * Enforces a size cap + MIME allowlist *before* touching FileReader so a
 * multi-GB drop can't hang the tab, and returns a typed result the caller
 * maps to a localized message instead of failing silently.
 */

export const DEFAULT_MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB

export type FileRejectReason = "too-large" | "wrong-type" | "read-failed";

export interface FileValidateOptions {
  maxBytes?: number;
  /** MIME prefixes or exact types, e.g. ["image/"]. */
  accept?: string[];
}

export type ReadResult =
  | { ok: true; dataUri: string; file: File }
  | { ok: false; reason: FileRejectReason };

export function validateFile(
  file: File,
  options: FileValidateOptions = {},
): FileRejectReason | null {
  const { maxBytes = DEFAULT_MAX_IMAGE_BYTES, accept } = options;
  if (accept && !accept.some((a) => file.type.startsWith(a))) return "wrong-type";
  if (file.size > maxBytes) return "too-large";
  return null;
}

export async function readImageFile(
  file: File,
  options: FileValidateOptions = {},
): Promise<ReadResult> {
  const reason = validateFile(file, { accept: ["image/"], ...options });
  if (reason) return { ok: false, reason };
  try {
    const dataUri = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error ?? new Error("read failed"));
      reader.readAsDataURL(file);
    });
    return { ok: true, dataUri, file };
  } catch {
    return { ok: false, reason: "read-failed" };
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
