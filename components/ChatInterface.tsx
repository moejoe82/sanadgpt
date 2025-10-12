"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useI18n, useLanguage } from "@/components/LanguageProvider";
import {
  Button,
  SurfaceCard,
  Textarea,
  VisuallyHidden,
  type ToastPayload,
} from "@/components/ui/primitives";

import styles from "./chat-interface.module.css";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

interface ChatInterfaceProps {
  onToast?: (toast: ToastPayload) => void;
}

export default function ChatInterface({ onToast }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const t = useI18n();
  const { direction } = useLanguage();

  useEffect(() => {
    if (!bottomRef.current) return;
    bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const appendMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const updateAssistant = useCallback((id: string, delta: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, content: m.content + delta } : m))
    );
  }, []);

  const resetComposer = useCallback(() => {
    setInput("");
  }, []);

  const send = useCallback(async () => {
    if (!input.trim() || loading) return;
    const question = input.trim();
    resetComposer();
    const userId = crypto.randomUUID();
    appendMessage({ id: userId, role: "user", content: question });

    const assistantId = crypto.randomUUID();
    appendMessage({ id: assistantId, role: "assistant", content: "" });
    setLoading(true);

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          conversationHistory: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!resp.ok) {
        throw new Error(t("تعذر الاتصال بالخادم.", "Unable to reach the server."));
      }

      const contentType = resp.headers.get("content-type");

      if (contentType?.includes("text/event-stream")) {
        const reader = resp.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let idx;
          while ((idx = buffer.indexOf("\n\n")) !== -1) {
            const chunk = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 2);
            const lines = chunk.split("\n");
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;
              const dataStr = trimmed.slice(5).trim();
              if (!dataStr || dataStr === "[DONE]") continue;
              try {
                const evt = JSON.parse(dataStr);
                if (typeof evt?.content === "string") {
                  updateAssistant(assistantId, evt.content);
                }
              } catch {
                // ignore malformed chunks
              }
            }
          }
        }
      } else {
        const data = await resp.json();
        if (data.content) {
          updateAssistant(assistantId, data.content);
        }
      }
    } catch (error) {
      const fallback = t("حدث خطأ في الإجابة.", "An error occurred.");
      updateAssistant(assistantId, fallback);
      if (onToast) {
        const description =
          error instanceof Error ? error.message : t("خطأ غير معروف.", "Unknown error.");
        onToast({
          title: t("تعذر إرسال الرسالة", "Message failed"),
          description,
          tone: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [appendMessage, input, loading, messages, onToast, resetComposer, t, updateAssistant]);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      send();
    },
    [send]
  );

  const emptyLabel = useMemo(
    () =>
      t(
        "ابدأ المحادثة بطرح سؤالك الأول.",
        "Start the conversation with your first question."
      ),
    [t]
  );

  return (
    <SurfaceCard className={styles.chatCard} role="region" aria-label={t("المحادثة", "Chat")}> 
      <div
        ref={transcriptRef}
        className={styles.transcript}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        dir={direction}
      >
        {messages.length === 0 && !loading ? (
          <div className={styles.emptyState}>{emptyLabel}</div>
        ) : null}

        {messages.map((m) => (
          <div
            key={m.id}
            data-role={m.role}
            className={styles.messageRow}
          >
            <div className={styles.messageBubble}>
              {m.content}
            </div>
          </div>
        ))}

        {loading ? (
          <div data-role="assistant" className={styles.messageRow}>
            <div className={styles.messageBubble}>
              <span className={styles.loadingBubble}>
                <VisuallyHidden>{t("جاري التفكير...", "Assistant typing...")}</VisuallyHidden>
                <span aria-hidden>•••</span>
              </span>
            </div>
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      <form
        className={styles.composer}
        noValidate
        onSubmit={handleSubmit}
        aria-label={t("أرسل رسالة جديدة", "Send a new message")}
      >
        <Textarea
          dir={direction}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={t("اكتب رسالتك هنا", "Write your message here")}
          className={styles.textarea}
          aria-label={t("مربع نص المحادثة", "Chat input field")}
        />
        <div className={styles.composerControls}>
          <div />
          <Button type="submit" disabled={loading || !input.trim()}>
            {loading ? t("جارٍ الإرسال", "Sending...") : t("إرسال", "Send")}
          </Button>
        </div>
      </form>
    </SurfaceCard>
  );
}
