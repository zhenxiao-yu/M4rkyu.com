"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useLocale, useTranslations } from "next-intl";
import { Streamdown } from "streamdown";
import {
  ArrowUpRight,
  Check,
  Copy,
  CornerDownLeft,
  Mic,
  RefreshCw,
  Square,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useDictation } from "@/lib/browser/use-dictation";
import { trackAsk } from "@/lib/analytics/events";
import { cn } from "@/lib/utils";

const ENDPOINT = "/api/ask";

// Render the model's Markdown links as terminal "chips". Internal (locale-less)
// paths go through next-intl's <Link> so they pick up the active locale and
// view-transition; external links open in a new tab.
function MarkdownLink({ href = "", children }: ComponentProps<"a">) {
  const isExternal = /^https?:\/\//.test(href);
  const className =
    "mx-0.5 inline-flex items-center gap-1 rounded-sm border border-ring/40 bg-ring/5 px-1.5 py-px align-baseline text-[0.9em] font-medium text-foreground no-underline transition-colors hover:border-ring hover:bg-ring/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
        <ArrowUpRight className="size-3 opacity-70" aria-hidden="true" />
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      <span aria-hidden="true" className="text-ring">
        ▸
      </span>
      {children}
    </Link>
  );
}

const markdownComponents = {
  a: MarkdownLink,
  strong: (props: ComponentProps<"strong">) => (
    <strong className="font-semibold text-ring" {...props} />
  ),
  p: (props: ComponentProps<"p">) => (
    <p className="my-1.5 leading-relaxed first:mt-0 last:mb-0" {...props} />
  ),
  ul: (props: ComponentProps<"ul">) => (
    <ul className="my-1.5 space-y-1" {...props} />
  ),
  li: ({ children, ...rest }: ComponentProps<"li">) => (
    <li className="flex gap-2" {...rest}>
      <span aria-hidden="true" className="select-none text-ring">
        ›
      </span>
      <span className="min-w-0">{children}</span>
    </li>
  ),
  code: (props: ComponentProps<"code">) => (
    <code
      className="rounded-sm bg-foreground/10 px-1 py-px font-mono text-[0.85em]"
      {...props}
    />
  ),
};

function messageText(parts: { type: string; text?: string }[]): string {
  return parts
    .filter((p) => p.type === "text")
    .map((p) => p.text ?? "")
    .join("");
}

const actionButton =
  "inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function AskConsole() {
  const t = useTranslations("AskConsole");
  const locale = useLocale();
  const { messages, sendMessage, status, error, stop, regenerate } = useChat({
    transport: new DefaultChatTransport({ api: ENDPOINT }),
  });
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const dictation = useDictation({
    lang: locale === "zh" ? "zh-CN" : "en-US",
    onTranscript: setInput,
  });

  const busy = status === "submitted" || status === "streaming";
  const suggestions = t.raw("suggestions") as string[];
  const lastId = messages.at(-1)?.id;

  // Keep the latest output in view as it streams.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  function submit(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    if (dictation.listening) dictation.stop();
    void sendMessage({ text: q });
    trackAsk();
    setInput("");
  }

  async function copy(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1500);
    } catch {
      /* clipboard blocked — no-op */
    }
  }

  return (
    <div
      className={cn(
        "glass-surface relative isolate mx-auto w-full max-w-3xl overflow-hidden rounded-lg",
        "border border-ring/30 shadow-[0_0_0_1px_var(--ring)]/5",
      )}
    >
      {/* Scanline overlay — purely decorative terminal texture. */}
      <div
        aria-hidden="true"
        className="scanline-layer pointer-events-none absolute inset-0 z-0 opacity-60"
      />

      {/* Title bar */}
      <div className="relative z-10 flex items-center justify-between border-b border-ring/25 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-ring shadow-[0_0_8px_var(--ring)]" />
          <span className="font-pixel text-base tracking-wide text-foreground/90">
            M4RKYU.SYS
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          {t("statusLabel")}
        </span>
      </div>

      {/* Transcript */}
      <div
        ref={scrollRef}
        aria-live="polite"
        className="relative z-10 max-h-[42vh] min-h-[14rem] overflow-y-auto px-4 py-4 font-mono text-sm"
      >
        {messages.length === 0 && status === "ready" && (
          <div className="space-y-3">
            <p className="text-foreground/80">{t("greeting")}</p>
            <ul className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => submit(s)}
                    className="rounded-sm border border-ring/40 px-2.5 py-1 text-xs text-foreground/75 transition-colors hover:border-ring hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <ul className="space-y-4">
          {messages.map((m) => {
            const text = messageText(m.parts);
            const isLastAssistant = m.role === "assistant" && m.id === lastId;
            return (
              <li key={m.id}>
                {m.role === "user" ? (
                  <p className="flex gap-2 text-foreground/70">
                    <span aria-hidden="true" className="select-none text-ring">
                      ›
                    </span>
                    <span className="min-w-0 break-words">{text}</span>
                  </p>
                ) : (
                  <div className="text-foreground/90">
                    <Streamdown
                      parseIncompleteMarkdown
                      components={markdownComponents}
                      className="break-words"
                    >
                      {text}
                    </Streamdown>
                    {/* Message actions — copy always, regenerate on the last
                     * answer once the stream is idle. */}
                    {text && !busy && (
                      <div className="mt-2 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => copy(m.id, text)}
                          className={actionButton}
                        >
                          {copiedId === m.id ? (
                            <Check className="size-3" aria-hidden="true" />
                          ) : (
                            <Copy className="size-3" aria-hidden="true" />
                          )}
                          {copiedId === m.id ? t("copied") : t("copy")}
                        </button>
                        {isLastAssistant && (
                          <button
                            type="button"
                            onClick={() => void regenerate()}
                            className={actionButton}
                          >
                            <RefreshCw className="size-3" aria-hidden="true" />
                            {t("regenerate")}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {status === "submitted" && (
          <p className="mt-3 flex items-center gap-2 text-muted-foreground">
            <span className="inline-block size-3 animate-pulse bg-ring motion-reduce:animate-none" />
            {t("thinking")}
          </p>
        )}

        {status === "error" && (
          <p className="mt-3 text-[color:var(--ring)]">
            {error?.message === "unavailable"
              ? t("errorUnavailable")
              : t("errorGeneric")}
          </p>
        )}
      </div>

      {/* Prompt line */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
        className="relative z-10 flex items-center gap-2 border-t border-ring/25 px-4 py-2.5"
      >
        <span aria-hidden="true" className="font-pixel text-lg text-ring">
          ▸
        </span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={500}
          enterKeyHint="send"
          aria-label={t("inputLabel")}
          placeholder={dictation.listening ? t("listening") : t("placeholder")}
          className="min-w-0 flex-1 bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
        />

        {dictation.supported && (
          <button
            type="button"
            onClick={() => (dictation.listening ? dictation.stop() : dictation.start())}
            aria-pressed={dictation.listening}
            aria-label={dictation.listening ? t("micStop") : t("micStart")}
            className={cn(
              "flex items-center rounded-sm border px-2 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              dictation.listening
                ? "border-ring text-ring animate-pulse motion-reduce:animate-none"
                : "border-ring/40 text-foreground/70 hover:border-ring",
            )}
          >
            <Mic className="size-3.5" aria-hidden="true" />
          </button>
        )}

        {busy ? (
          <button
            type="button"
            onClick={() => stop()}
            className="flex items-center gap-1 rounded-sm border border-ring/40 px-2 py-1 text-xs text-foreground/80 transition-colors hover:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Square className="size-3" aria-hidden="true" />
            {t("stop")}
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="flex items-center gap-1 rounded-sm border border-ring/40 px-2 py-1 text-xs text-foreground/80 transition-colors hover:border-ring disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <CornerDownLeft className="size-3" aria-hidden="true" />
            {t("send")}
          </button>
        )}
      </form>
    </div>
  );
}
