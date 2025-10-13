"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useI18n, useLanguage } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  // Citations are handled automatically by Agent Builder
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const t = useI18n();
  const { direction } = useLanguage();
  const alignment = direction === "rtl" ? "text-right" : "text-left";

  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const appendMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const updateAssistant = useCallback((id: string, delta: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, content: m.content + delta } : m))
    );
  }, []);

  async function send() {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput("");
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
          conversationHistory: messages
            .filter((msg) => msg.id !== userId)
            .map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP ${resp.status}: ${resp.statusText}`
        );
      }

      const data = await resp.json();
      if (data.content) {
        updateAssistant(assistantId, data.content);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Chat error:", errorMessage);
      updateAssistant(
        assistantId,
        `${t("حدث خطأ في الإجابة.", "An error occurred.")}: ${errorMessage}`
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      dir={direction}
      className={`flex h-full flex-col gap-4 rounded-3xl border border-border/60 bg-background/70 p-6 shadow-soft backdrop-blur supports-[backdrop-filter]:bg-background/55 ${alignment}`}
    >
      <div className="flex-1 space-y-4 overflow-y-auto scrollbar-thin" aria-live="polite">
          {messages.length === 0 && !loading && (
            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/40 p-6 text-sm text-muted-foreground">
              {t(
                "ابدأ المحادثة بطرح سؤال حول إجراءات التدقيق أو السياسات.",
                "Ask a question about audit procedures or policies to begin."
              )}
            </div>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={
                message.role === "user"
                  ? "flex justify-end"
                  : "flex justify-start"
              }
            >
              <div
                className={`max-w-[min(90%,40rem)] rounded-3xl border px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  message.role === "user"
                    ? "rounded-br-lg border-primary/30 bg-primary text-primary-foreground"
                    : "rounded-bl-lg border-border/60 bg-muted/40 text-foreground"
                }`}
              >
                <div className="whitespace-pre-wrap text-pretty">{message.content}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[min(90%,32rem)] rounded-3xl rounded-bl-lg border border-border/50 bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
                {t("جاري التفكير...", "Thinking...")}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

      <form
        className="flex flex-col gap-3 border-t border-border/60 bg-background/80 py-4"
          onSubmit={(event) => {
            event.preventDefault();
            send();
          }}
        >
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                send();
              }
            }}
            aria-label={t("اطرح سؤالك هنا", "Ask your question")}
            placeholder={t("اطرح سؤالك هنا", "Ask your question...")}
            className="resize-none bg-background/70"
          />
          <div className="flex flex-wrap items-center justify-end gap-3">
            <p className="text-xs text-muted-foreground">
              {t(
                "اضغط على إدخال للإرسال. استخدم Shift + إدخال لسطر جديد.",
                "Press Enter to send. Use Shift + Enter for a new line."
              )}
            </p>
            <Button type="submit" disabled={loading || !input.trim()}>
              {loading
                ? t("جاري الإرسال...", "Sending...")
                : t("إرسال", "Send")}
            </Button>
          </div>
      </form>
    </div>
  );
}
