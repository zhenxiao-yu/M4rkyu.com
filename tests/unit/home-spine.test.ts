// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

import { scrollSpine } from "@/lib/home-spine";

function setScrollY(value: number) {
  Object.defineProperty(window, "scrollY", {
    configurable: true,
    writable: true,
    value,
  });
}

function setInnerHeight(value: number) {
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    writable: true,
    value,
  });
}

function homeSection(top: number) {
  const section = document.createElement("section");
  section.setAttribute("data-home-section", "section");
  section.getBoundingClientRect = () =>
    ({
      top,
      right: 0,
      bottom: top + 400,
      left: 0,
      width: 1000,
      height: 400,
      x: 0,
      y: top,
      toJSON: () => ({}),
    }) as DOMRect;
  return section;
}

describe("scrollSpine", () => {
  beforeEach(() => {
    document.body.replaceChildren();
    setScrollY(0);
    setInnerHeight(1000);
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
  });

  it("jumps to the next data-home-section target", () => {
    document.body.append(homeSection(0), homeSection(640), homeSection(1280));

    scrollSpine(1);

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 640,
      behavior: "smooth",
    });
  });

  it("ignores legacy data-snap sections", () => {
    const oldSection = document.createElement("section");
    oldSection.setAttribute("data-snap", "section");
    document.body.append(oldSection);

    scrollSpine(1);

    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});
