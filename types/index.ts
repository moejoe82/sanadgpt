export type SupportedLanguage = "ar" | "en";

export interface DocumentMeta {
  id?: string;
  name: string;
  sizeBytes: number;
  mimeType:
    | "text/plain"
    | "application/pdf"
    | "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  sha256: string;
  uploadedAt?: string;
}

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  language: SupportedLanguage;
  createdAt?: string;
}

export interface AuditAnswer {
  questionId?: string;
  answer: string;
  confidence?: number;
  citations?: Array<{ title: string; url?: string; page?: number }>;
  language: SupportedLanguage;
}
