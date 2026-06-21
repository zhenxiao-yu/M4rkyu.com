"use client";

import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Minimal 5-row block font — A-Z + 0-9. Each glyph is 5 chars wide.
// Compact by design; missing characters render as blank space.
const FONT: Record<string, string[]> = {
  A: [" ### ", "#   #", "#####", "#   #", "#   #"],
  B: ["#### ", "#   #", "#### ", "#   #", "#### "],
  C: [" ####", "#    ", "#    ", "#    ", " ####"],
  D: ["#### ", "#   #", "#   #", "#   #", "#### "],
  E: ["#####", "#    ", "###  ", "#    ", "#####"],
  F: ["#####", "#    ", "###  ", "#    ", "#    "],
  G: [" ####", "#    ", "#  ##", "#   #", " ####"],
  H: ["#   #", "#   #", "#####", "#   #", "#   #"],
  I: [" ### ", "  #  ", "  #  ", "  #  ", " ### "],
  J: ["  ###", "    #", "    #", "#   #", " ### "],
  K: ["#   #", "#  # ", "###  ", "#  # ", "#   #"],
  L: ["#    ", "#    ", "#    ", "#    ", "#####"],
  M: ["#   #", "## ##", "# # #", "#   #", "#   #"],
  N: ["#   #", "##  #", "# # #", "#  ##", "#   #"],
  O: [" ### ", "#   #", "#   #", "#   #", " ### "],
  P: ["#### ", "#   #", "#### ", "#    ", "#    "],
  Q: [" ### ", "#   #", "#   #", "#  # ", " ## #"],
  R: ["#### ", "#   #", "#### ", "#  # ", "#   #"],
  S: [" ####", "#    ", " ### ", "    #", "#### "],
  T: ["#####", "  #  ", "  #  ", "  #  ", "  #  "],
  U: ["#   #", "#   #", "#   #", "#   #", " ### "],
  V: ["#   #", "#   #", "#   #", " # # ", "  #  "],
  W: ["#   #", "#   #", "# # #", "## ##", "#   #"],
  X: ["#   #", " # # ", "  #  ", " # # ", "#   #"],
  Y: ["#   #", " # # ", "  #  ", "  #  ", "  #  "],
  Z: ["#####", "   # ", "  #  ", " #   ", "#####"],
  "0": [" ### ", "#   #", "#   #", "#   #", " ### "],
  "1": ["  #  ", " ##  ", "  #  ", "  #  ", " ### "],
  "2": [" ### ", "#   #", "   # ", "  #  ", "#####"],
  "3": [" ### ", "#   #", "  ## ", "#   #", " ### "],
  "4": ["#   #", "#   #", "#####", "    #", "    #"],
  "5": ["#####", "#    ", "#### ", "    #", "#### "],
  "6": [" ### ", "#    ", "#### ", "#   #", " ### "],
  "7": ["#####", "    #", "   # ", "  #  ", " #   "],
  "8": [" ### ", "#   #", " ### ", "#   #", " ### "],
  "9": [" ### ", "#   #", " ####", "    #", " ### "],
  " ": ["     ", "     ", "     ", "     ", "     "],
};

const BLANK_ROW = ["     ", "     ", "     ", "     ", "     "];

function render(text: string, fill: string): string {
  const glyphs = Array.from(text.toUpperCase()).map((ch) => FONT[ch] ?? BLANK_ROW);
  const rows: string[] = [];
  for (let r = 0; r < 5; r++) {
    rows.push(glyphs.map((g) => g[r]).join("  "));
  }
  return rows.join("\n").replace(/#/g, fill);
}

export function AsciiArt() {
  const [text, setText] = useState("M4rkyu");
  const [fill, setFill] = useState("█");

  const output = useMemo(() => render(text, fill), [text, fill]);

  function copy() {
    void navigator.clipboard.writeText(output).then(() => toast.success("Copied"));
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Text"
          spellCheck={false}
          maxLength={16}
          aria-label="Text to render"
          className="font-mono"
        />
        <Input
          value={fill}
          onChange={(e) => setFill(e.target.value.slice(-1) || "#")}
          aria-label="Fill character"
          className="text-center font-mono"
          maxLength={1}
        />
      </div>
      <pre className="overflow-auto rounded-md border border-border bg-card/40 p-4 font-mono text-[0.6rem] leading-[0.85] text-foreground sm:text-xs sm:leading-[0.95]">
{output}
      </pre>
      <Button type="button" size="sm" variant="outline" onClick={copy} className="w-fit">
        <Copy className="size-3.5" aria-hidden="true" /> Copy ASCII
      </Button>
    </div>
  );
}
