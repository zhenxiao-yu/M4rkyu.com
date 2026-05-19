"use client";

import { useMemo, useState } from "react";

function stats(text: string) {
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lines = text === "" ? 0 : text.split(/\r?\n/).length;
  const sentences = (text.match(/[^.!?]+[.!?]+/g) || []).length;
  const paragraphs = text.trim() ? text.trim().split(/\n{2,}/).length : 0;
  // 200 wpm reading, ~5 chars/word average
  const readingMin = words / 200;
  return { chars, charsNoSpaces, words, lines, sentences, paragraphs, readingMin };
}

export function WordCounter() {
  const [text, setText] = useState(
    "Paste anything here. Watch the stats below tick — characters, words, lines, sentences, paragraphs, and estimated read time.",
  );

  const s = useMemo(() => stats(text), [text]);

  const cells: [string, string | number][] = [
    ["Words", s.words.toLocaleString()],
    ["Characters", s.chars.toLocaleString()],
    ["No spaces", s.charsNoSpaces.toLocaleString()],
    ["Lines", s.lines.toLocaleString()],
    ["Sentences", s.sentences.toLocaleString()],
    ["Paragraphs", s.paragraphs.toLocaleString()],
    ["Reading time", `${s.readingMin < 1 ? "<1" : Math.ceil(s.readingMin)} min`],
  ];

  return (
    <div className="grid gap-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        spellCheck={false}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm leading-6"
      />
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {cells.map(([label, value]) => (
          <li
            key={label}
            className="grid gap-1 rounded-md border border-border bg-card/40 p-3"
          >
            <span className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-muted-foreground">
              {label}
            </span>
            <span className="font-display text-2xl tabular-nums leading-none">
              {value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
