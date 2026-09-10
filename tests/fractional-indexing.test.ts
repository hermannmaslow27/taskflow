import { describe, it, expect } from "vitest";
import { calculatePosition, getPositionAtIndex } from "../src/lib/fractional-indexing";

describe("Fractional Indexing", () => {
  it("computes position when list is empty", () => {
    const pos = calculatePosition(null, null);
    expect(pos).toBe(1000);
  });

  it("computes position before first item", () => {
    const pos = calculatePosition(null, 1000);
    expect(pos).toBe(500);
  });

  it("computes position after last item", () => {
    const pos = calculatePosition(1000, null);
    expect(pos).toBe(2000);
  });

  it("computes exact midpoint between two items", () => {
    const pos = calculatePosition(1000, 2000);
    expect(pos).toBe(1500);
  });

  it("calculates correct target index position from array", () => {
    const items = [
      { id: "1", position: 1000 },
      { id: "2", position: 2000 },
      { id: "3", position: 3000 },
    ];

    // insert at index 0
    expect(getPositionAtIndex(items, 0)).toBe(500);

    // insert between 0 and 1 (index 1)
    expect(getPositionAtIndex(items, 1)).toBe(1500);

    // insert at end (index 3)
    expect(getPositionAtIndex(items, 3)).toBe(4000);
  });
});
