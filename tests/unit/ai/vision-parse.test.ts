import { describe, it, expect } from "vitest";
import { parseVisionResponse } from "@/lib/ai/vision";

describe("parseVisionResponse", () => {
  it("parses a clean JSON object", () => {
    const out = parseVisionResponse('{"alt":"A dog on a beach","caption":"Golden hour","tags":["dog","beach"]}');
    expect(out).toEqual({ alt: "A dog on a beach", caption: "Golden hour", tags: ["dog", "beach"] });
  });

  it("tolerates code fences and surrounding prose", () => {
    const raw = "Sure!\n```json\n{ \"alt\": \"Street\", \"caption\": \"\", \"tags\": [\"Street\",\"BW\"] }\n```";
    const out = parseVisionResponse(raw);
    expect(out?.alt).toBe("Street");
    expect(out?.tags).toEqual(["street", "bw"]); // lowercased
  });

  it("returns null for unparseable or empty content", () => {
    expect(parseVisionResponse("no json here")).toBeNull();
    expect(parseVisionResponse('{"alt":"","caption":"","tags":[]}')).toBeNull();
  });

  it("clamps overlong fields and drops non-string tags", () => {
    const out = parseVisionResponse(
      JSON.stringify({ alt: "x".repeat(400), caption: "c", tags: ["ok", 5, "two"] }),
    );
    expect(out?.alt.length).toBe(240);
    expect(out?.tags).toEqual(["ok", "two"]);
  });
});
