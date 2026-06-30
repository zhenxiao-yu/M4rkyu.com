// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useAutosaveField } from "@/components/admin/autosave/use-autosave-field";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("useAutosaveField", () => {
  it("debounces to a single save and reaches 'saved'", async () => {
    const save = vi.fn(async () => ({ ok: true }));
    const { result } = renderHook(() =>
      useAutosaveField({ initialValue: "a", save, delay: 800 }),
    );
    act(() => result.current.setValue("ab"));
    act(() => result.current.setValue("abc"));
    expect(save).not.toHaveBeenCalled();
    await act(async () => {
      vi.advanceTimersByTime(800);
    });
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith("abc");
    expect(result.current.status).toBe("saved");
  });

  it("sets 'error' when the save fails", async () => {
    const save = vi.fn(async () => ({ ok: false, error: "x" }));
    const { result } = renderHook(() =>
      useAutosaveField({ initialValue: "a", save, delay: 10 }),
    );
    act(() => result.current.setValue("b"));
    await act(async () => {
      vi.advanceTimersByTime(10);
    });
    expect(result.current.status).toBe("error");
  });

  it("skips the save when flushed value equals the last saved", () => {
    const save = vi.fn(async () => ({ ok: true }));
    const { result } = renderHook(() =>
      useAutosaveField({ initialValue: "a", save }),
    );
    act(() => result.current.flush());
    expect(save).not.toHaveBeenCalled();
  });
});
