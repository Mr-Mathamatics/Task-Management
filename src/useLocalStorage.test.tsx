import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useLocalStorage } from "./useLocalStorage";

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("useLocalStorage", () => {
  it("loads valid stored data", () => {
    localStorage.setItem("items", JSON.stringify(["saved"]));
    const { result } = renderHook(() => useLocalStorage("items", ["fallback"], isStringArray));
    expect(result.current[0]).toEqual(["saved"]);
  });

  it("uses fallback for invalid JSON or invalid shape", () => {
    localStorage.setItem("items", "{not-json");
    const malformed = renderHook(() => useLocalStorage("items", ["fallback"], isStringArray));
    expect(malformed.result.current[0]).toEqual(["fallback"]);
    malformed.unmount();

    localStorage.setItem("items", JSON.stringify({ unexpected: true }));
    const wrongShape = renderHook(() => useLocalStorage("items", ["fallback"], isStringArray));
    expect(wrongShape.result.current[0]).toEqual(["fallback"]);
  });

  it("persists updates and can reset to the fallback", () => {
    const { result } = renderHook(() => useLocalStorage("items", ["fallback"], isStringArray));
    act(() => result.current[1](["updated"]));
    expect(JSON.parse(localStorage.getItem("items") ?? "null")).toEqual(["updated"]);
    act(() => result.current[2]());
    expect(result.current[0]).toEqual(["fallback"]);
  });

  it("keeps the hook usable if storage writes throw", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("quota exceeded"); });
    const { result } = renderHook(() => useLocalStorage("items", ["fallback"], isStringArray));
    act(() => result.current[1](["in-memory"]));
    expect(result.current[0]).toEqual(["in-memory"]);
  });
});
