import { describe, expect, it } from "vitest";

import { games } from "@/content/games";

describe("published game case studies", () => {
  it("shows real media and consequential implementation decisions", () => {
    for (const game of games) {
      expect(game.cover?.width, game.slug).toBeTypeOf("number");
      expect(game.cover?.height, game.slug).toBeTypeOf("number");
      expect(game.screenshots.length, game.slug).toBeGreaterThan(0);
      expect(game.decisions.length, game.slug).toBeGreaterThanOrEqual(2);
    }
  });
});
