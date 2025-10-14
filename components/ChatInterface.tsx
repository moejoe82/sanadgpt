"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { 
  Send, 
  Paperclip, 
  X, 
  History, 
  Eye, 
  EyeOff, 
  FileText, 
  Trash2,
  Plus,
  MessageSquare,
  Bot,
  User,
  Sparkles,
  MoreVertical
} from "lucide-react";

import { useI18n, useLanguage } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  attachments?: File[];
};

type ChatSession = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  isIncognito: boolean;
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isIncognitoMode, setIsIncognitoMode] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const t = useI18n();
  const { direction } = useLanguage();

  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  // Load chat history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setChatHistory(parsed.map((session: ChatSession) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          messages: session.messages.map((msg: ChatMessage) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        })));
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }
  }, []);

  // Save chat history to localStorage
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  const appendMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const createNewSession = useCallback(() => {
    const newSessionId = crypto.randomUUID();
    setCurrentSessionId(newSessionId);
    setMessages([]);
    setAttachments([]);
    toast({
      title: t("جلسة جديدة", "New Session"),
      description: t("تم إنشاء جلسة محادثة جديدة", "New chat session created"),
    });
  }, [t]);

  const loadSession = useCallback((session: ChatSession) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages);
    setAttachments([]);
    setShowHistory(false);
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    setChatHistory(prev => prev.filter(session => session.id !== sessionId));
    if (currentSessionId === sessionId) {
      createNewSession();
    }
    toast({
      title: t("تم الحذف", "Deleted"),
      description: t("تم حذف الجلسة", "Session deleted"),
    });
  }, [currentSessionId, createNewSession, t]);

  const saveCurrentSession = useCallback(() => {
    if (messages.length === 0 || isIncognitoMode) return;
    
    const sessionTitle = messages[0]?.content.slice(0, 50) + (messages[0]?.content.length > 50 ? '...' : '') || t("محادثة جديدة", "New Chat");
    
    const session: ChatSession = {
      id: currentSessionId || crypto.randomUUID(),
      title: sessionTitle,
      messages,
      createdAt: new Date(),
      isIncognito: false
    };

    setChatHistory(prev => {
      const existingIndex = prev.findIndex(s => s.id === session.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = session;
        return updated;
      }
      return [session, ...prev];
    });
  }, [messages, isIncognitoMode, currentSessionId, t]);

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files).filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      
      if (file.size > maxSize) {
        toast({
          title: t("ملف كبير جداً", "File too large"),
          description: t("الحد الأقصى لحجم الملف هو 10 ميجابايت", "Maximum file size is 10MB"),
          variant: "destructive",
        });
        return false;
      }
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: t("نوع ملف غير مدعوم", "Unsupported file type"),
          description: t("يدعم النظام ملفات PDF و Word و Text فقط", "Only PDF, Word, and Text files are supported"),
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });

    setAttachments(prev => [...prev, ...newFiles]);
    
    if (newFiles.length > 0) {
      toast({
        title: t("تم رفع الملفات", "Files uploaded"),
        description: t(`تم رفع ${newFiles.length} ملف بنجاح`, `${newFiles.length} files uploaded successfully`),
      });
    }
  }, [t]);

  const removeAttachment = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }, []);

  async function send() {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput("");
    
    const userId = crypto.randomUUID();
    const userMessage: ChatMessage = {
      id: userId,
      role: "user",
      content: question,
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined
    };
    
    appendMessage(userMessage);
    setAttachments([]);
    setLoading(true);

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          attachments: userMessage.attachments?.map(file => ({
            name: file.name,
            type: file.type,
            size: file.size
          })),
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
        // Create assistant message only after we get the response
        const assistantId = crypto.randomUUID();
        const assistantMessage: ChatMessage = {
          id: assistantId,
          role: "assistant",
          content: data.content,
          timestamp: new Date()
        };
        appendMessage(assistantMessage);
      }
      
      // Save session after successful response (if not incognito)
      if (!isIncognitoMode) {
        saveCurrentSession();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Chat error:", errorMessage);
      
      // Create error message
      const assistantId = crypto.randomUUID();
      const errorMessageObj: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: `${t("حدث خطأ في الإجابة.", "An error occurred.")}: ${errorMessage}`,
        timestamp: new Date()
      };
      appendMessage(errorMessageObj);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div dir={direction} className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 bg-background/80 p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {t("محادثة ذكية", "Smart Chat")}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isIncognitoMode 
                  ? t("وضع التصفح الخفي", "Incognito Mode") 
                  : t("محادثة محفوظة", "Saved Chat")
                }
              </p>
            </div>
          </div>
          {isIncognitoMode && (
            <Badge variant="outline" className="text-xs">
              <EyeOff className="w-3 h-3 mr-1" />
              {t("خفي", "Incognito")}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsIncognitoMode(!isIncognitoMode)}
            className="text-xs"
          >
            {isIncognitoMode ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
            {isIncognitoMode ? t("إيقاف الخفي", "Exit Incognito") : t("وضع خفي", "Incognito")}
          </Button>
          
          <Dialog open={showHistory} onOpenChange={setShowHistory}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                <History className="w-4 h-4 mr-1" />
                {t("السجل", "History")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{t("سجل المحادثات", "Chat History")}</DialogTitle>
                <DialogDescription>
                  {t("اختر محادثة سابقة للمتابعة", "Select a previous conversation to continue")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {chatHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">{t("لا توجد محادثات سابقة", "No previous conversations")}</p>
                  </div>
                ) : (
                  chatHistory.map((session) => (
                    <Card key={session.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium truncate">{session.title}</h4>
                            <p className="text-xs text-muted-foreground">
                              {session.messages.length} {t("رسالة", "messages")} • {session.createdAt.toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => loadSession(session)}
                              className="p-1"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="p-1">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => deleteSession(session.id)}>
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  {t("حذف", "Delete")}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" size="sm" onClick={createNewSession} className="text-xs">
            <Plus className="w-4 h-4 mr-1" />
            {t("جديد", "New")}
          </Button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t("مرحباً بك في SanadGPT", "Welcome to SanadGPT")}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              {t("ابدأ المحادثة بطرح سؤال حول إجراءات التدقيق أو السياسات. يمكنك أيضاً رفع المستندات للمناقشة.", "Start a conversation by asking about audit procedures or policies. You can also upload documents for discussion.")}
            </p>
            <div className="flex gap-2 text-xs text-muted-foreground">
              <span className="px-2 py-1 bg-muted/50 rounded-full">PDF</span>
              <span className="px-2 py-1 bg-muted/50 rounded-full">Word</span>
              <span className="px-2 py-1 bg-muted/50 rounded-full">Text</span>
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.role === "assistant" && (
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            
            <div className={`max-w-[80%] ${message.role === "user" ? "order-first" : ""}`}>
              <div
                className={`rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                    : "bg-muted/50 text-foreground border border-border"
                }`}
              >
                <div className="whitespace-pre-wrap text-pretty text-sm leading-relaxed">
                  {message.content}
                </div>
                
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.attachments.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-white/10 rounded-lg">
                        <FileText className="w-4 h-4" />
                        <span className="text-xs truncate">{file.name}</span>
                        <span className="text-xs opacity-75">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1 px-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
            
            {message.role === "user" && (
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}
        
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-muted/50 text-foreground border border-border rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                <span className="text-sm text-muted-foreground ml-2">
                  {t("جاري التفكير...", "Thinking...")}
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border/60 bg-background/80 p-4">
        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 text-sm">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="truncate max-w-32">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAttachment(index)}
                  className="p-1 h-auto"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        <form
          className="flex gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            send();
          }}
        >
          <div className="flex-1 relative">
            <Textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  send();
                }
              }}
              placeholder={t("اكتب رسالتك هنا...", "Type your message here...")}
              className="resize-none pr-12 min-h-[44px] max-h-32"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 p-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        
        <p className="text-xs text-muted-foreground mt-2">
          {t("اضغط على إدخال للإرسال. استخدم Shift + إدخال لسطر جديد.", "Press Enter to send. Use Shift + Enter for a new line.")}
        </p>
      </div>
    </div>
  );
}
