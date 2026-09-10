import { describe, it, expect } from "vitest";
import {
  parseRecurrenceRule,
  serializeRecurrenceRule,
  computeNextOccurrence,
} from "../src/lib/recurrence";

describe("Recurrence Rules Parser and Calculator", () => {
  it("parses standard RFC 5545 recurrence strings", () => {
    const rule = parseRecurrenceRule("FREQ=DAILY;INTERVAL=2");
    expect(rule).not.toBeNull();
    expect(rule?.freq).toBe("DAILY");
    expect(rule?.interval).toBe(2);
  });

  it("serializes recurrence rule back to string", () => {
    const serialized = serializeRecurrenceRule({
      freq: "WEEKLY",
      interval: 3,
    });
    expect(serialized).toBe("FREQ=WEEKLY;INTERVAL=3");
  });

  it("computes next daily occurrence", () => {
    const base = new Date("2026-05-01T10:00:00Z");
    const next = computeNextOccurrence(base, "FREQ=DAILY;INTERVAL=1");
    expect(next?.toISOString().split("T")[0]).toBe("2026-05-02");
  });

  it("computes next weekly occurrence", () => {
    const base = new Date("2026-05-01T10:00:00Z");
    const next = computeNextOccurrence(base, "FREQ=WEEKLY;INTERVAL=2");
    expect(next?.toISOString().split("T")[0]).toBe("2026-05-15");
  });

  it("respects UNTIL limit", () => {
    const base = new Date("2026-05-01T10:00:00Z");
    const next = computeNextOccurrence(base, "FREQ=DAILY;UNTIL=2026-05-01");
    expect(next).toBeNull();
  });
});
