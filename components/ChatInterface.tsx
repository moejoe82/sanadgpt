"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n, useLanguage } from "@/components/LanguageProvider";

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
    // Only scroll if there are messages
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
          conversationHistory: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!resp.ok) {
        throw new Error("Network error");
      }

      // Handle both streaming and non-streaming responses
      const contentType = resp.headers.get("content-type");

      if (contentType?.includes("text/event-stream")) {
        // Handle streaming response
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
              const t = line.trim();
              if (!t.startsWith("data:")) continue;
              const dataStr = t.slice(5).trim();
              if (!dataStr || dataStr === "[DONE]") continue;
              try {
                const evt = JSON.parse(dataStr);
                if (typeof evt?.content === "string") {
                  updateAssistant(assistantId, evt.content);
                }
              } catch {
                // ignore JSON parse errors
              }
            }
          }
        }
      } else {
        // Handle JSON response from Agent Builder
        const data = await resp.json();
        if (data.content) {
          updateAssistant(assistantId, data.content);
          // Citations are handled automatically by Agent Builder
        }
      }
    } catch {
      updateAssistant(assistantId, t("حدث خطأ في الإجابة.", "An error occurred."));
    } finally {
      setLoading(false);
      // flush remaining buffer if it contains a final JSON object
    }
  }

  return (
    <div
      dir={direction}
      className={`flex flex-col h-full max-h-[80vh] border rounded-lg p-4 gap-3 bg-white/90 dark:bg-slate-900/80 ${alignment}`}
    >
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((m) => (
          <div
            key={m.id}
            className={
              m.role === "user" ? "flex justify-end" : "flex justify-start"
            }
          >
            <div
              className={
                "max-w-[80%] rounded-2xl px-4 py-2 shadow-sm transition " +
                (m.role === "user"
                  ? "bg-slate-900 text-white rounded-br-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-sm")
              }
            >
              <div className="whitespace-pre-wrap leading-relaxed">
                {m.content}
              </div>
              {/* Citations are handled automatically by Agent Builder */}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-sm animate-pulse">
              {t("جاري التفكير...", "Thinking...")}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 items-center">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={t("اطرح سؤالك هنا", "Ask your question...")}
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="rounded-md bg-slate-900 text-white px-4 py-2 hover:bg-slate-800 disabled:opacity-50"
        >
          {t("إرسال", "Send")}
        </button>
      </div>
    </div>
  );
}
