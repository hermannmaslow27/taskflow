/**
 * Recurrence rules generator and parser (RFC 5545 simplified / full support)
 */

export type RecurrenceFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | "WEEKDAYS";

export interface RecurrenceRule {
  freq: RecurrenceFrequency;
  interval?: number; // e.g., every 2 weeks
  count?: number; // occurrences limit
  until?: Date; // end date
  byDay?: string[]; // e.g. ["MO", "WE", "FR"]
}

export function parseRecurrenceRule(ruleString: string | null | undefined): RecurrenceRule | null {
  if (!ruleString) return null;

  try {
    const parts = ruleString.split(";");
    const rule: Partial<RecurrenceRule> = { interval: 1 };

    for (const part of parts) {
      const [key, value] = part.split("=");
      if (!key || !value) continue;

      switch (key.toUpperCase()) {
        case "FREQ":
          rule.freq = value.toUpperCase() as RecurrenceFrequency;
          break;
        case "INTERVAL":
          rule.interval = parseInt(value, 10) || 1;
          break;
        case "COUNT":
          rule.count = parseInt(value, 10);
          break;
        case "UNTIL":
          rule.until = new Date(value);
          break;
        case "BYDAY":
          rule.byDay = value.split(",");
          break;
      }
    }

    if (!rule.freq) return null;
    return rule as RecurrenceRule;
  } catch {
    return null;
  }
}

export function serializeRecurrenceRule(rule: RecurrenceRule): string {
  const parts: string[] = [`FREQ=${rule.freq}`];
  if (rule.interval && rule.interval > 1) {
    parts.push(`INTERVAL=${rule.interval}`);
  }
  if (rule.count) {
    parts.push(`COUNT=${rule.count}`);
  }
  if (rule.until) {
    parts.push(`UNTIL=${rule.until.toISOString().split("T")[0]}`);
  }
  if (rule.byDay && rule.byDay.length > 0) {
    parts.push(`BYDAY=${rule.byDay.join(",")}`);
  }
  return parts.join(";");
}

export function computeNextOccurrence(
  currentDate: Date,
  ruleInput: string | RecurrenceRule
): Date | null {
  const rule = typeof ruleInput === "string" ? parseRecurrenceRule(ruleInput) : ruleInput;
  if (!rule) return null;

  const next = new Date(currentDate.getTime());
  const interval = rule.interval || 1;

  switch (rule.freq) {
    case "DAILY":
      next.setDate(next.getDate() + interval);
      break;
    case "WEEKDAYS":
      do {
        next.setDate(next.getDate() + 1);
      } while (next.getDay() === 0 || next.getDay() === 6);
      break;
    case "WEEKLY":
      next.setDate(next.getDate() + 7 * interval);
      break;
    case "MONTHLY":
      next.setMonth(next.getMonth() + interval);
      break;
    case "YEARLY":
      next.setFullYear(next.getFullYear() + interval);
      break;
    default:
      return null;
  }

  if (rule.until && next > rule.until) {
    return null;
  }

  return next;
}
