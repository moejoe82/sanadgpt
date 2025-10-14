"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { useI18n, useLanguage } from "@/components/LanguageProvider";
import { WORKFLOW_ID, CREATE_SESSION_ENDPOINT } from "@/lib/chatkit-config";

const isBrowser = typeof window !== "undefined";
const isDev = process.env.NODE_ENV !== "production";

export default function ChatInterface() {
  const [isInitializingSession, setIsInitializingSession] = useState(true);
  const [scriptStatus, setScriptStatus] = useState<
    "pending" | "ready" | "error"
  >(() =>
    isBrowser && window.customElements?.get("openai-chatkit")
      ? "ready"
      : "pending"
  );
  const [widgetInstanceKey, setWidgetInstanceKey] = useState(0);
  const isMountedRef = useRef(true);
  const t = useI18n();
  const { direction } = useLanguage();

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Handle script loading events
  useEffect(() => {
    if (!isBrowser) {
      return;
    }

    let timeoutId: number | undefined;

    const handleLoaded = () => {
      if (!isMountedRef.current) {
        return;
      }
      console.log("[ChatInterface] ChatKit script loaded");
      setScriptStatus("ready");
    };

    const handleError = (event: Event) => {
      console.error("Failed to load chatkit.js", event);
      if (!isMountedRef.current) {
        return;
      }
      setScriptStatus("error");
      setIsInitializingSession(false);
    };

    window.addEventListener("chatkit-script-loaded", handleLoaded);
    window.addEventListener(
      "chatkit-script-error",
      handleError as EventListener
    );

    if (window.customElements?.get("openai-chatkit")) {
      handleLoaded();
    } else if (scriptStatus === "pending") {
      timeoutId = window.setTimeout(() => {
        if (!window.customElements?.get("openai-chatkit")) {
          handleError(
            new CustomEvent("chatkit-script-error", {
              detail:
                "ChatKit web component is unavailable. Verify that the script URL is reachable.",
            })
          );
        }
      }, 5000);
    }

    return () => {
      window.removeEventListener("chatkit-script-loaded", handleLoaded);
      window.removeEventListener(
        "chatkit-script-error",
        handleError as EventListener
      );
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [scriptStatus]);

  const isWorkflowConfigured = Boolean(
    WORKFLOW_ID && !WORKFLOW_ID.startsWith("wf_replace")
  );

  useEffect(() => {
    if (!isWorkflowConfigured && isMountedRef.current) {
      setIsInitializingSession(false);
    }
  }, [isWorkflowConfigured]);

  const getClientSecret = useCallback(
    async (currentSecret: string | null) => {
      console.log("[ChatInterface] getClientSecret called", {
        currentSecretPresent: Boolean(currentSecret),
        workflowId: WORKFLOW_ID,
        isWorkflowConfigured,
        endpoint: CREATE_SESSION_ENDPOINT,
      });

      if (!isWorkflowConfigured) {
        const detail =
          "Set NEXT_PUBLIC_CHATKIT_WORKFLOW_ID in your .env.local file.";
        if (isMountedRef.current) {
          setIsInitializingSession(false);
        }
        throw new Error(detail);
      }

      if (isMountedRef.current) {
        if (!currentSecret) {
          setIsInitializingSession(true);
        }
      }

      try {
        console.log(
          "[ChatInterface] Creating session with workflow:",
          WORKFLOW_ID
        );
        const response = await fetch(CREATE_SESSION_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            workflow: { id: WORKFLOW_ID },
            chatkit_configuration: {
              file_upload: {
                enabled: true,
              },
            },
          }),
        });

        const raw = await response.text();
        console.log("[ChatInterface] Session response:", {
          status: response.status,
          ok: response.ok,
          bodyPreview: raw.slice(0, 200),
        });

        let data: Record<string, unknown> = {};

        if (raw) {
          try {
            data = JSON.parse(raw) as Record<string, unknown>;
          } catch (parseError) {
            console.error(
              "Failed to parse create-session response",
              parseError
            );
          }
        }

        if (!response.ok) {
          const detail = extractErrorDetail(data, response.statusText);
          console.error("Create session request failed", {
            status: response.status,
            body: data,
          });
          throw new Error(detail);
        }

        const clientSecret = data?.client_secret as string | undefined;
        if (!clientSecret) {
          throw new Error("Missing client secret in response");
        }

        console.log("[ChatInterface] Session created successfully");
        console.log(
          "[ChatInterface] Client secret received:",
          clientSecret ? "YES" : "NO"
        );

        console.log(
          "[ChatInterface] isMountedRef.current:",
          isMountedRef.current
        );
        console.log("[ChatInterface] Setting isInitializingSession to false");
        setIsInitializingSession(false);
        console.log("[ChatInterface] State update called");

        console.log("[ChatInterface] Returning client secret");
        return clientSecret;
      } catch (error) {
        console.error("Failed to create ChatKit session", error);
        const detail =
          error instanceof Error
            ? error.message
            : "Unable to start ChatKit session.";
        if (isMountedRef.current) {
          setIsInitializingSession(false);
        }
        throw error instanceof Error ? error : new Error(detail);
      }
    },
    [isWorkflowConfigured, isMountedRef]
  );

  const chatkit = useChatKit({
    api: { getClientSecret },
    theme: {
      colorScheme: "light",
      color: {
        grayscale: {
          hue: 220,
          tint: 6,
          shade: -4,
        },
        accent: {
          primary: "#0f172a",
          level: 1,
        },
      },
      radius: "round",
    },
    startScreen: {
      greeting: t("مرحباً بك في SanadGPT", "Welcome to SanadGPT"),
      prompts: [
        {
          label: t("ما الذي يمكنك فعله؟", "What can you do?"),
          prompt: t("ما الذي يمكنك فعله؟", "What can you do?"),
          icon: "circle-question",
        },
      ],
    },
    composer: {
      placeholder: t("اكتب رسالتك هنا...", "Type your message here..."),
      attachments: {
        enabled: true,
      },
    },
    threadItemActions: {
      feedback: false,
    },
    onError: ({ error }: { error: unknown }) => {
      console.error("ChatKit error", error);
    },
    onResponseStart: () => {
      console.log("[ChatInterface] Response started");
    },
    onResponseEnd: () => {
      console.log("[ChatInterface] Response ended");
    },
  });

  // Force isInitializingSession to false when ChatKit control is available
  useEffect(() => {
    if (chatkit.control && isInitializingSession) {
      console.log(
        "[ChatInterface] ChatKit control available, setting isInitializingSession to false"
      );
      setIsInitializingSession(false);
    }
  }, [chatkit.control, isInitializingSession]);

  const blockingError = scriptStatus === "error" || !isWorkflowConfigured;

  if (isDev) {
    console.log("[ChatInterface] ChatKit state:", {
      hasControl: Boolean(chatkit.control),
      isInitializingSession,
      scriptStatus,
      isWorkflowConfigured,
      workflowId: WORKFLOW_ID,
      blockingError,
    });
  }

  if (!isWorkflowConfigured) {
    return (
      <div dir={direction} className="flex h-full flex-col bg-background">
        <div className="flex items-center justify-between border-b border-border/60 bg-background/80 p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {t("محادثة ذكية", "Smart Chat")}
                </h2>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-red-500 mb-4">
              <svg
                className="w-12 h-12 mx-auto"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {t("خطأ في التكوين", "Configuration Error")}
            </h3>
            <p className="text-muted-foreground">
              {t(
                "يرجى تعيين NEXT_PUBLIC_CHATKIT_WORKFLOW_ID في ملف .env.local",
                "Please set NEXT_PUBLIC_CHATKIT_WORKFLOW_ID in .env.local file"
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir={direction} className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 bg-background/80 p-4"></div>

      {/* ChatKit Container */}
      <div className="flex-1 overflow-hidden">
        {chatkit.control && (
          <ChatKit
            key={widgetInstanceKey}
            control={chatkit.control}
            className="block h-full w-full"
            style={{
              minHeight: "400px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
        )}
        {!chatkit.control && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">
                {t("جاري تحميل المحادثة...", "Loading chat...")}
              </p>
            </div>
          </div>
        )}
        {(blockingError || (isInitializingSession && !chatkit.control)) && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">
                {scriptStatus === "error"
                  ? t("خطأ في تحميل ChatKit", "Error loading ChatKit")
                  : !isWorkflowConfigured
                  ? t("خطأ في التكوين", "Configuration Error")
                  : t("جاري تحميل المحادثة...", "Loading chat...")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function extractErrorDetail(
  payload: Record<string, unknown> | undefined,
  fallback: string
): string {
  if (!payload) {
    return fallback;
  }

  const error = payload.error;
  if (typeof error === "string") {
    return error;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  const details = payload.details;
  if (typeof details === "string") {
    return details;
  }

  if (details && typeof details === "object" && "error" in details) {
    const nestedError = (details as { error?: unknown }).error;
    if (typeof nestedError === "string") {
      return nestedError;
    }
    if (
      nestedError &&
      typeof nestedError === "object" &&
      "message" in nestedError &&
      typeof (nestedError as { message?: unknown }).message === "string"
    ) {
      return (nestedError as { message: string }).message;
    }
  }

  if (typeof payload.message === "string") {
    return payload.message;
  }

  return fallback;
}
