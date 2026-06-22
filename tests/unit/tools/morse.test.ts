import { describe, expect, it } from "vitest";

import { morseToText, runMorse, textToMorse } from "@/lib/tools/morse";

describe("textToMorse", () => {
  it("encodes a single word with letters space-separated", () => {
    expect(textToMorse("SOS")).toBe("... --- ...");
  });

  it("is case-insensitive", () => {
    expect(textToMorse("sos")).toBe(textToMorse("SOS"));
    expect(textToMorse("Hello")).toBe(textToMorse("HELLO"));
  });

  it("separates words with ' / '", () => {
    expect(textToMorse("HI YOU")).toBe(".... .. / -.-- --- ..-");
  });

  it("collapses extra spaces between words", () => {
    expect(textToMorse("HI   YOU")).toBe(textToMorse("HI YOU"));
    expect(textToMorse("  HI  ")).toBe(".... ..");
  });

  it("maps unknown characters to the '?' placeholder string", () => {
    // "€" is not in the table → the literal "?" placeholder, not its morse.
    expect(textToMorse("A€")).toBe(".- ?");
    // A real "?" character *is* in the table, so it encodes normally.
    expect(textToMorse("?")).toBe("..--..");
  });

  it("preserves newlines as separate lines", () => {
    expect(textToMorse("E\nT")).toBe(".\n-");
  });

  it("returns empty string for empty input", () => {
    expect(textToMorse("")).toBe("");
  });
});

describe("morseToText", () => {
  it("decodes SOS", () => {
    expect(morseToText("... --- ...")).toBe("SOS");
  });

  it("decodes ' / ' word separators to spaces", () => {
    expect(morseToText(".... .. / -.-- --- ..-")).toBe("HI YOU");
  });

  it("tolerates extra spaces and unpadded slashes", () => {
    expect(morseToText("....   ..  /-.-- --- ..-")).toBe("HI YOU");
    expect(morseToText("  ... --- ...  ")).toBe("SOS");
  });

  it("maps unknown sequences to '?'", () => {
    expect(morseToText("........")).toBe("?");
    expect(morseToText("... ........ ...")).toBe("S?S");
  });

  it("returns empty string for empty input", () => {
    expect(morseToText("")).toBe("");
  });
});

describe("round trip", () => {
  it("SOS survives encode → decode", () => {
    expect(morseToText(textToMorse("SOS"))).toBe("SOS");
  });

  it("a multi-word phrase survives encode → decode (uppercased)", () => {
    const phrase = "HELLO WORLD";
    expect(morseToText(textToMorse(phrase))).toBe(phrase);
  });
});

describe("runMorse", () => {
  it("treats empty input as a valid empty state, never an error", () => {
    expect(runMorse("", "encode")).toEqual({ output: "", empty: true });
    expect(runMorse("", "decode")).toEqual({ output: "", empty: true });
  });

  it("encodes and decodes through the dispatcher", () => {
    expect(runMorse("SOS", "encode")).toEqual({
      output: "... --- ...",
      empty: false,
    });
    expect(runMorse("... --- ...", "decode")).toEqual({
      output: "SOS",
      empty: false,
    });
  });
});
