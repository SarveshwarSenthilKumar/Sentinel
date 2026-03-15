"use client";

import { useEffect, useRef } from "react";

import type { ChatMessage } from "@/lib/types";

type CopilotChatPanelProps = {
  panelId?: string;
  eyebrow: string;
  title: string;
  helperText: string;
  messages: ChatMessage[];
  suggestions: string[];
  input: string;
  isPending: boolean;
  pendingLabel: string;
  placeholder: string;
  onInputChange: (value: string) => void;
  onSuggestionClick: (prompt: string) => void;
  onSubmit: () => void | Promise<void>;
};

export function CopilotChatPanel({
  panelId,
  eyebrow,
  title,
  helperText,
  messages,
  suggestions,
  input,
  isPending,
  pendingLabel,
  placeholder,
  onInputChange,
  onSuggestionClick,
  onSubmit,
}: CopilotChatPanelProps) {
  const footerRef = useRef<HTMLDivElement | null>(null);
  const transcriptRef = useRef<HTMLDivElement | null>(null);

  function ensureComposerInView() {
    const footer = footerRef.current;
    if (!footer) {
      return;
    }

    const rect = footer.getBoundingClientRect();
    const absoluteTop = window.scrollY + rect.top;
    const targetTop = Math.max(absoluteTop - window.innerHeight + rect.height + 32, 0);

    window.scrollTo({
      top: targetTop,
      behavior: "smooth",
    });
  }

  useEffect(() => {
    const container = transcriptRef.current;
    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: isPending ? "auto" : "smooth",
    });
  }, [isPending, messages]);

  return (
    <div
      id={panelId}
      className="flex min-h-[34rem] max-h-[min(82vh,48rem)] scroll-mt-6 flex-col overflow-hidden rounded-[28px] border border-line/80 bg-panel/95 shadow-frame"
    >
      <div className="border-b border-line/60 px-6 pb-6 pt-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-[#0B1324] text-[11px] font-semibold uppercase tracking-[0.22em] text-paper shadow-[0_16px_30px_rgba(11,19,36,0.16)] dark:bg-slate-100 dark:text-slate-900">
              SA
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.24em] text-muted">{eyebrow}</p>
              <h2 className="mt-1 font-serif text-[2rem] leading-none text-ink sm:text-[2.25rem]">
                {title}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
                Ask follow-up questions and keep the investigation grounded in the evidence already on the page.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 self-start rounded-full border border-line/60 bg-canvas/35 px-4 py-2 text-xs uppercase tracking-[0.2em] text-muted">
            <span className="h-2.5 w-2.5 rounded-full bg-safe" />
            Live conversation
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="px-6 pt-5">
          <div className="flex items-center gap-3 rounded-full border border-line/50 bg-canvas/35 px-4 py-2 text-xs uppercase tracking-[0.22em] text-muted">
            <span className="h-2.5 w-2.5 rounded-full bg-safe" />
            Conversation feed
          </div>
        </div>

        <div
          ref={transcriptRef}
          className="mx-6 mb-0 mt-4 flex-1 overflow-y-auto rounded-[24px] border border-line/60 bg-canvas/45 px-5 py-5"
        >
          <div className="space-y-5">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
              >
                <div className="max-w-[82%] space-y-2">
                  <div
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em] ${
                      message.role === "assistant"
                        ? "border border-line/50 bg-panel/90 text-muted"
                        : "bg-[#DCE6F2] text-ink dark:bg-slate-200 dark:text-slate-900"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        message.role === "assistant" ? "bg-safe" : "bg-[#0B1324] dark:bg-slate-900"
                      }`}
                    />
                    {message.role === "assistant" ? "Sentinel Assistant" : "Analyst"}
                  </div>
                  <div
                    className={`rounded-[22px] border px-4 py-3 text-sm leading-7 shadow-[0_16px_30px_rgba(15,23,42,0.08)] ${
                      message.role === "assistant"
                        ? "border-line/60 bg-panel/96 text-ink dark:bg-slate-800/88 dark:text-slate-100"
                        : "border-[#CFD8E6] bg-[#E8EDF3] text-ink dark:border-slate-300 dark:bg-slate-200 dark:text-slate-900"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              </div>
            ))}

            {isPending ? (
              <div className="flex justify-start">
                <div className="max-w-[82%] space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-line/50 bg-panel/90 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted">
                    <span className="h-2 w-2 rounded-full bg-safe" />
                    Sentinel Assistant
                  </div>
                  <div className="rounded-[22px] border border-line/60 bg-panel/96 px-4 py-3 text-sm text-muted shadow-[0_16px_30px_rgba(15,23,42,0.08)] dark:bg-slate-800/88 dark:text-slate-300">
                    {pendingLabel}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div
          ref={footerRef}
          className="border-t border-line/60 bg-transparent px-6 pb-6 pt-5"
        >
          <div className="rounded-[24px] border border-line/60 bg-canvas/35 p-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-muted">
                Suggested questions
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {suggestions.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => {
                      ensureComposerInView();
                      onSuggestionClick(prompt);
                    }}
                    disabled={isPending}
                    className="rounded-full border border-line/80 bg-panel/88 px-4 py-2 text-sm text-ink transition hover:bg-paper/70 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-slate-900/55"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <form
              className="mt-4 rounded-[20px] border border-line/70 bg-panel/92 p-3"
              onSubmit={(event) => {
                event.preventDefault();
                ensureComposerInView();
                void onSubmit();
              }}
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0B1324] text-[11px] font-semibold uppercase tracking-[0.18em] text-paper dark:bg-slate-100 dark:text-slate-900">
                  SA
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">Message Sentinel</p>
                  <p className="text-sm text-muted">{helperText}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <textarea
                  value={input}
                  onChange={(event) => onInputChange(event.target.value)}
                  onFocus={ensureComposerInView}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      ensureComposerInView();
                      void onSubmit();
                    }
                  }}
                  rows={2}
                  placeholder={placeholder}
                  className="min-h-[7rem] flex-1 resize-none rounded-[18px] border border-line/70 bg-white px-4 py-3 text-[15px] leading-7 text-ink outline-none transition placeholder:text-muted focus:border-slate-400 focus:ring-2 focus:ring-slate-200/70 dark:border-slate-300/70 dark:bg-slate-100 dark:text-slate-900 dark:placeholder:text-slate-500 dark:focus:border-slate-400 dark:focus:ring-slate-200/70"
                />
                <button
                  type="submit"
                  disabled={isPending || !input.trim()}
                  className="inline-flex h-12 min-w-[8.5rem] items-center justify-center rounded-[14px] bg-[#0B1324] px-5 text-sm font-medium text-paper shadow-[0_12px_24px_rgba(11,19,36,0.14)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#111C33] hover:shadow-[0_16px_28px_rgba(11,19,36,0.18)] disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none disabled:opacity-55 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
