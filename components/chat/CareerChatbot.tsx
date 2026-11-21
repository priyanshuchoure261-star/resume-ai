"use client";

import { useEffect, useRef, useState } from "react";

/* ============================================================
   TYPES
   ============================================================ */

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type CareerChatbotProps = {
  company?: string;
  role?: string;
  jobType?: string;
  jobDescription?: string;
  resumeText?: string;
  jobAnalysis?: Record<string, unknown> | null;
};

/* ============================================================
   MARKDOWN RENDERER (bold + bullets)
   ============================================================ */

function renderMarkdown(text: string) {
  const lines = text.split("\n");
  return lines.map((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={index} className="h-2" />;

    const isBullet = /^[-*]\s+/.test(trimmed);
    const value = isBullet ? trimmed.replace(/^[-*]\s+/, "") : line;
    const parts = value.split(/(\*\*[^*]+\*\*)/g);
    const formatted = parts.map((part, partIndex) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={partIndex} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      ) : (
        <span key={partIndex}>{part}</span>
      )
    );

    return isBullet ? (
      <div key={index} className="flex gap-2 py-0.5">
        <span className="text-violet-300">•</span>
        <span>{formatted}</span>
      </div>
    ) : (
      <p key={index} className="leading-6">{formatted}</p>
    );
  });
}

/* ============================================================
   SUGGESTION CHIPS
   ============================================================ */

const SUGGESTION_CHIPS = [
  "What skills am I missing for this role?",
  "How can I improve my resume summary?",
  "What projects should I build to stand out?",
  "How do I prepare for the interview?",
];

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function CareerChatbot({
  company: initialCompany,
  role: initialRole,
  jobType: initialJobType,
  jobDescription: initialJobDescription,
  resumeText: initialResumeText,
  jobAnalysis: initialJobAnalysis,
}: CareerChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [retryText, setRetryText] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [context, setContext] = useState({
    company: initialCompany || "",
    role: initialRole || "",
    jobType: initialJobType || "",
    jobDescription: initialJobDescription || "",
    resumeText: initialResumeText || "",
    jobAnalysis: initialJobAnalysis || null,
  });

  // Load extra context from sessionStorage
  useEffect(() => {
    try {
      const savedProfile =
        sessionStorage.getItem("resumeAI_profile") ||
        sessionStorage.getItem("resumeAIData") ||
        sessionStorage.getItem("resumeProfile");
      const savedAnalysis =
        sessionStorage.getItem("resumeAI_analysis") ||
        sessionStorage.getItem("RESUME_AI_ANALYSIS");

      const profile = savedProfile ? JSON.parse(savedProfile) : {};
      const analysis = savedAnalysis ? JSON.parse(savedAnalysis) : null;

      setContext((prev) => ({
        company:
          initialCompany ||
          prev.company ||
          profile.targetCompany ||
          profile.selectedCompany ||
          profile.company ||
          "",
        role:
          initialRole ||
          prev.role ||
          profile.targetPosition ||
          profile.position ||
          "",
        jobType:
          initialJobType || prev.jobType || profile.targetMode || "",
        jobDescription:
          initialJobDescription ||
          prev.jobDescription ||
          profile.jobDescription ||
          "",
        resumeText:
          initialResumeText ||
          prev.resumeText ||
          profile.resumeText ||
          "",
        jobAnalysis:
          initialJobAnalysis || prev.jobAnalysis || analysis,
      }));
    } catch {
      // Ignore malformed session data; chat remains usable.
    }
  }, [
    initialCompany,
    initialRole,
    initialJobType,
    initialJobDescription,
    initialResumeText,
    initialJobAnalysis,
  ]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const welcomeMessage = context.company
    ? `Hi! I'm your AI career assistant. I can see you're targeting **${context.company}${context.role ? ` — ${context.role}` : ""}**. Ask me anything about your resume, skill gaps, or interview prep!`
    : `Hi! I'm your AI career assistant. Ask me anything about your resume, skill gaps, interview prep, or career advice!`;

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setError("");
    setRetryText("");
    setInput("");

    const userMsg: ChatMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/resume-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: messages,
          context,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Server error: ${response.status}`
        );
      }

      const data = await response.json();
      const reply = data.reply || data.message || "Sorry, I couldn't generate a response.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply },
      ]);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      setRetryText(trimmed);
      // Remove the user message on error so user can retry
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function clearChat() {
    setMessages([]);
    setError("");
    setRetryText("");
  }

  const showChips = messages.length < 2;

  return (
    <>
      {/* Floating trigger button */}
      <button
        className="no-print"
        onClick={() => setIsOpen((o) => !o)}
        style={{
          position: "fixed",
          bottom: 28,
          right: 28,
          zIndex: 1000,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(124,58,237,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: 24,
        }}
        aria-label="Open career chatbot"
      >
        {isOpen ? "✕" : "💬"}
        {/* Pulse dot */}
        {!isOpen && (
          <span
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#22c55e",
              border: "2px solid white",
            }}
          />
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div
          className="no-print"
          style={{
            position: "fixed",
            bottom: 96,
            right: 28,
            zIndex: 999,
            width: 420,
            maxWidth: "calc(100vw - 40px)",
            height: 580,
            display: "flex",
            flexDirection: "column",
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
            background: "rgba(15,12,30,0.97)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(124,58,237,0.3)",
            color: "#e2d9f3",
            fontSize: 14,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 18px",
              background: "linear-gradient(135deg, #4c1d95, #312e81)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                }}
              >
                🤖
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "white" }}>
                  AI Career Assistant
                </div>
                <div style={{ fontSize: 11, color: "#c4b5fd" }}>
                  {context.company
                    ? `Targeting ${context.company}`
                    : "Ready to help"}
                </div>
              </div>
            </div>
            <button
              onClick={clearChat}
              title="Clear chat"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "none",
                color: "#c4b5fd",
                cursor: "pointer",
                borderRadius: 8,
                padding: "4px 10px",
                fontSize: 16,
              }}
            >
              ↺
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {/* Welcome */}
            <div
              style={{
                background: "rgba(109,40,217,0.2)",
                borderRadius: 12,
                padding: "12px 14px",
                borderLeft: "3px solid #7c3aed",
                fontSize: 13,
                lineHeight: 1.6,
                color: "#ddd6fe",
              }}
            >
              {renderMarkdown(welcomeMessage)}
            </div>

            {/* Suggestion chips */}
            {showChips && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {SUGGESTION_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => sendMessage(chip)}
                    style={{
                      background: "rgba(109,40,217,0.15)",
                      border: "1px solid rgba(124,58,237,0.3)",
                      borderRadius: 20,
                      padding: "5px 12px",
                      fontSize: 12,
                      color: "#c4b5fd",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Chat messages */}
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent:
                    msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "85%",
                    borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    padding: "10px 14px",
                    background:
                      msg.role === "user"
                        ? "linear-gradient(135deg, #6d28d9, #4338ca)"
                        : "rgba(255,255,255,0.07)",
                    color: msg.role === "user" ? "white" : "#e2d9f3",
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}
                >
                  {msg.role === "assistant"
                    ? renderMarkdown(msg.content)
                    : msg.content}
                </div>
              </div>
            ))}

            {/* Thinking indicator */}
            {isLoading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    borderRadius: "16px 16px 16px 4px",
                    padding: "12px 16px",
                    display: "flex",
                    gap: 5,
                    alignItems: "center",
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "#7c3aed",
                        display: "inline-block",
                        animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div
                style={{
                  background: "rgba(220,38,38,0.15)",
                  border: "1px solid rgba(220,38,38,0.3)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: 12,
                  color: "#fca5a5",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>⚠ {error}</span>
                {retryText && (
                  <button
                    onClick={() => sendMessage(retryText)}
                    style={{
                      background: "rgba(220,38,38,0.3)",
                      border: "none",
                      color: "#fca5a5",
                      cursor: "pointer",
                      borderRadius: 6,
                      padding: "3px 10px",
                      fontSize: 12,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Retry
                  </button>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div
            style={{
              padding: "12px 14px",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              gap: 8,
              flexShrink: 0,
              background: "rgba(0,0,0,0.2)",
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your resume, skills, interview…"
              disabled={isLoading}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(124,58,237,0.3)",
                borderRadius: 12,
                padding: "10px 14px",
                color: "white",
                fontSize: 13,
                outline: "none",
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={isLoading || !input.trim()}
              style={{
                background:
                  isLoading || !input.trim()
                    ? "rgba(109,40,217,0.3)"
                    : "linear-gradient(135deg, #7c3aed, #4f46e5)",
                border: "none",
                borderRadius: 12,
                padding: "10px 14px",
                color: "white",
                cursor:
                  isLoading || !input.trim() ? "not-allowed" : "pointer",
                fontSize: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="Send"
            >
              ➤
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
}
