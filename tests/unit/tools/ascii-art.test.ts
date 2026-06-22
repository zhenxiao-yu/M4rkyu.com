import { describe, expect, it } from "vitest";

import {
  ASCII_ART_MAX_LENGTH,
  ASCII_ART_ROWS,
  isSupportedChar,
  renderAsciiArt,
  runAsciiArt,
} from "@/lib/tools/ascii-art";

describe("renderAsciiArt", () => {
  it("treats empty / whitespace-only input as empty, never an error", () => {
    expect(renderAsciiArt("")).toBe("");
    expect(runAsciiArt("")).toEqual({ art: "", empty: true, truncated: false });
    expect(runAsciiArt("   ").empty).toBe(true);
  });

  it("renders a known short string deterministically", () => {
    // "HI" with the default block fill is stable across runs.
    expect(renderAsciiArt("HI", { fill: "#" })).toBe(
      [
        "#   #   ### ",
        "#   #    #  ",
        "#####    #  ",
        "#   #    #  ",
        "#   #   ### ",
      ].join("\n"),
    );
  });

  it("folds case before lookup (lowercase renders the same as upper)", () => {
    expect(renderAsciiArt("hi", { fill: "#" })).toBe(
      renderAsciiArt("HI", { fill: "#" }),
    );
  });

  it("always emits exactly the font's row count for non-empty input", () => {
    expect(renderAsciiArt("AB").split("\n")).toHaveLength(ASCII_ART_ROWS);
  });

  it("paints the fill glyph in place of the font's # cells", () => {
    const art = renderAsciiArt("I", { fill: "*" });
    expect(art).not.toContain("#");
    expect(art).toContain("*");
  });

  it("uses only the first glyph of a multi-char fill so layout can't drift", () => {
    expect(renderAsciiArt("I", { fill: "@!" })).toBe(
      renderAsciiArt("I", { fill: "@" }),
    );
  });

  it("renders unsupported characters as blank space instead of crashing", () => {
    expect(isSupportedChar("é")).toBe(false);
    expect(isSupportedChar("A")).toBe(true);
    // A glyph the font lacks contributes only spaces — no throw, no #.
    const art = renderAsciiArt("é", { fill: "#" });
    expect(art).toBe(["     ", "     ", "     ", "     ", "     "].join("\n"));
  });

  it("caps very long input to maxLength to avoid freezing the UI", () => {
    const long = "A".repeat(ASCII_ART_MAX_LENGTH + 25);
    const result = runAsciiArt(long);
    expect(result.truncated).toBe(true);
    // First row width = chars * 5 glyph cells + (chars - 1) * 2 separator cells.
    const chars = ASCII_ART_MAX_LENGTH;
    expect(result.art.split("\n")[0]).toHaveLength(chars * 5 + (chars - 1) * 2);
  });

  it("does not flag short input as truncated", () => {
    expect(runAsciiArt("HELLO").truncated).toBe(false);
  });

  it("honors a custom maxLength", () => {
    const result = runAsciiArt("ABCDE", { maxLength: 2 });
    expect(result.truncated).toBe(true);
    expect(result.art.split("\n")[0]).toHaveLength(2 * 5 + 1 * 2);
  });
});
