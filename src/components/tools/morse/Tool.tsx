"use client";

import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const TABLE: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..",
  J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
  S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",
  0: "-----", 1: ".----", 2: "..---", 3: "...--", 4: "....-", 5: ".....", 6: "-....",
  7: "--...", 8: "---..", 9: "----.", ".": ".-.-.-", ",": "--..--", "?": "..--..",
  "'": ".----.", "!": "-.-.--", "/": "-..-.", "(": "-.--.", ")": "-.--.-", "&": ".-...",
  ":": "---...", ";": "-.-.-.", "=": "-...-", "+": ".-.-.", "-": "-....-", _: "..--.-",
  '"': ".-..-.", $: "...-..-", "@": ".--.-.",
};
const REVERSE = Object.fromEntries(Object.entries(TABLE).map(([k, v]) => [v, k])) as Record<string, string>;

function toMorse(text: string): string {
  return text
    .toUpperCase()
    .split("\n")
    .map((line) =>
      line
        .split(" ")
        .map((word) =>
          Array.from(word)
            .map((ch) => TABLE[ch] ?? "")
            .filter(Boolean)
            .join(" "),
        )
        .join(" / "),
    )
    .join("\n");
}

function fromMorse(text: string): string {
  return text
    .split("\n")
    .map((line) =>
      line
        .split(" / ")
        .map((word) =>
          word
            .split(" ")
            .map((sym) => REVERSE[sym] ?? "")
            .join(""),
        )
        .join(" "),
    )
    .join("\n");
}

export function Morse() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("hello world");

  const output = useMemo(() => (mode === "encode" ? toMorse(input) : fromMorse(input)), [mode, input]);

  function copy() {
    void navigator.clipboard.writeText(output).then(() => toast.success("Copied"));
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div role="tablist" className="inline-flex rounded-md border border-border bg-card/40 p-0.5">
          {(["encode", "decode"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={`rounded-sm px-3 py-1 font-mono text-xs uppercase tracking-[0.15em] ${mode === m ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              {m === "encode" ? "Text → Morse" : "Morse → Text"}
            </button>
          ))}
        </div>
        <Button type="button" size="sm" variant="outline" onClick={copy} className="ml-auto">
          <Copy className="size-3.5" aria-hidden="true" /> Copy
        </Button>
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={6}
        spellCheck={false}
        className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm"
      />
      <textarea
        readOnly
        value={output}
        rows={6}
        className="w-full rounded-md border border-border bg-card/40 px-3 py-2 font-mono text-sm"
      />
      <p className="text-[0.65rem] text-muted-foreground/70">
        Word separator in Morse is <code>/</code>; letter separator is a single space.
      </p>
    </div>
  );
}
