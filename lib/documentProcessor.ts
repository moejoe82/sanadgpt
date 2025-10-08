import { createHash } from "crypto";

export type SupportedMime =
  | "text/plain"
  | "application/pdf"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export interface ProcessedDocument {
  text: string;
  sha256: string;
}

// Simplified text extraction for preview generation only
// OpenAI handles the main processing automatically
export async function extractTextFromDocument(
  fileBuffer: Buffer,
  mimeType: SupportedMime
): Promise<string> {
  if (mimeType === "text/plain") {
    return fileBuffer.toString("utf8");
  }

  if (mimeType === "application/pdf") {
    // Lazy import to avoid bundling if unused
    const pdfParse = await import("pdf-parse");
    const result = await (pdfParse as unknown as { default: (buffer: Buffer) => Promise<{ text: string }> }).default(fileBuffer);
    return result.text;
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value ?? "";
  }

  throw new Error(`Unsupported mime type: ${mimeType}`);
}

export function computeSha256Hex(fileBuffer: Buffer): string {
  const hash = createHash("sha256");
  hash.update(fileBuffer);
  return hash.digest("hex");
}

// Generate preview text (first 200 chars) and hash for duplicate detection
export async function processDocument(
  fileBuffer: Buffer,
  mimeType: SupportedMime
): Promise<ProcessedDocument> {
  const text = await extractTextFromDocument(fileBuffer, mimeType);
  const sha256 = computeSha256Hex(fileBuffer);
  return { text, sha256 };
}

// Generate preview text for UI display (first 200 characters)
export function generatePreviewText(
  text: string,
  maxLength: number = 200
): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

// Browser-oriented helpers for client-side preview generation
export async function extractTextFromFile(file: File): Promise<string> {
  const mimeType = file.type;
  const arrayBuffer = await file.arrayBuffer();

  if (mimeType === "text/plain") {
    return new TextDecoder("utf-8").decode(arrayBuffer);
  }

  if (mimeType === "application/pdf") {
    try {
      const pdfParse = await import("pdf-parse");
      // pdf-parse expects a Node.js Buffer
      // This will only work in environments where Buffer is available (e.g., server-side)
      // For pure browser usage, consider a browser PDF extractor (e.g., pdfjs-dist)
      const nodeBuffer = Buffer.from(arrayBuffer as ArrayBuffer);
      const result = await (pdfParse as unknown as { default: (buffer: Buffer) => Promise<{ text: string }> }).default(nodeBuffer);
      return result.text;
    } catch {
      throw new Error(
        "PDF parsing is not available in this environment. Run on server or add a browser-compatible PDF parser."
      );
    }
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value ?? "";
  }

  throw new Error(`Unsupported file type: ${mimeType}`);
}

// Generate SHA-256 hash for duplicate detection (browser-compatible)
export async function sha256Hex(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const bytes = new Uint8Array(hashBuffer);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i].toString(16).padStart(2, "0");
    hex += b;
  }
  return hex;
}

export function getFileExtension(filename: string, mimeType: string): string {
  const dot = filename.lastIndexOf(".");
  if (dot !== -1 && dot < filename.length - 1) {
    return filename.slice(dot + 1).toLowerCase();
  }

  switch (mimeType) {
    case "text/plain":
      return "txt";
    case "application/pdf":
      return "pdf";
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return "docx";
    default:
      return "";
  }
}
