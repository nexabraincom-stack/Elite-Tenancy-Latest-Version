/**
 * Elite Tenancy — Viewing availability & timezone helpers
 *
 * Business-hours config for the public viewing-booking flow, plus a
 * dependency-free Europe/London wall-clock <-> UTC converter.
 *
 * UK clocks move between GMT and BST, so a fixed UTC offset is wrong: 09:00
 * London time is 08:00 UTC in July but 09:00 UTC in January. Everything here
 * derives the real offset from Intl at the instant in question rather than
 * hardcoding a date range, so it stays correct across DST rule changes.
 */

export const VIEWING_TIMEZONE = "Europe/London";
export const BUSINESS_START_HOUR = 9;
export const BUSINESS_END_HOUR = 18;
export const CLOSED_WEEKDAYS = [0]; // Sunday (0=Sun..6=Sat)
export const SLOT_DURATION_MINUTES = 30;
export const MIN_NOTICE_HOURS = 4;
export const MAX_BOOKING_DAYS_AHEAD = 21;
// The partial unique index on (listing_id, scheduled_at) enforces this at the
// DB level — this constant documents the same rule, it does not enforce it.
export const VIEWING_SLOT_CAPACITY = 1;

/**
 * UTC offset (minutes, positive = ahead of UTC) that Europe/London is
 * observing at the given UTC instant — 0 during GMT, 60 during BST.
 */
function londonOffsetMinutesAt(utcInstant: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: VIEWING_TIMEZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(utcInstant).reduce<Record<string, string>>((acc, p) => {
    if (p.type !== "literal") acc[p.type] = p.value;
    return acc;
  }, {});
  const asIfUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return Math.round((asIfUtc - utcInstant.getTime()) / 60_000);
}

/**
 * Converts a London wall-clock time ("YYYY-MM-DD", hour, minute) to the
 * correct UTC instant. Two-pass correction: guess the instant as if London
 * were UTC, read the real offset there, correct, then re-check the offset at
 * the corrected instant in case that first correction crossed a DST boundary.
 */
export function londonWallTimeToUtc(dateStr: string, hour: number, minute: number): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  const guess = new Date(Date.UTC(y, m - 1, d, hour, minute, 0));
  const offset1 = londonOffsetMinutesAt(guess);
  const corrected = new Date(guess.getTime() - offset1 * 60_000);
  const offset2 = londonOffsetMinutesAt(corrected);
  return new Date(guess.getTime() - offset2 * 60_000);
}

/** London calendar date ("YYYY-MM-DD") and weekday (0=Sun..6=Sat) for a UTC instant. */
export function londonDateParts(utcInstant: Date): { dateStr: string; weekday: number } {
  const dateStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: VIEWING_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(utcInstant); // en-CA formats as YYYY-MM-DD
  const weekdayLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: VIEWING_TIMEZONE,
    weekday: "short",
  }).format(utcInstant);
  const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return { dateStr, weekday: weekdayMap[weekdayLabel] };
}

/** All business-hour slot start times (UTC instants) for a given London calendar date. */
export function generateSlotGrid(dateStr: string): Date[] {
  const probe = londonWallTimeToUtc(dateStr, 12, 0); // midday probe, never ambiguous around a DST change
  const { weekday } = londonDateParts(probe);
  if (CLOSED_WEEKDAYS.includes(weekday)) return [];

  const slots: Date[] = [];
  const totalMinutes = (BUSINESS_END_HOUR - BUSINESS_START_HOUR) * 60;
  for (let mins = 0; mins < totalMinutes; mins += SLOT_DURATION_MINUTES) {
    const hour = BUSINESS_START_HOUR + Math.floor(mins / 60);
    const minute = mins % 60;
    slots.push(londonWallTimeToUtc(dateStr, hour, minute));
  }
  return slots;
}

/**
 * Re-derives the slot grid for the calendar date implied by `candidateUtc`
 * and confirms it's a real slot start — a booking request must never trust a
 * client-supplied timestamp as authoritative on its own.
 */
export function isValidSlotStart(candidateUtc: Date): boolean {
  const { dateStr } = londonDateParts(candidateUtc);
  return generateSlotGrid(dateStr).some((s) => s.getTime() === candidateUtc.getTime());
}

export function isWithinMinNotice(candidateUtc: Date, now: Date = new Date()): boolean {
  return candidateUtc.getTime() - now.getTime() >= MIN_NOTICE_HOURS * 60 * 60 * 1000;
}

export function isWithinBookingHorizon(candidateUtc: Date, now: Date = new Date()): boolean {
  return candidateUtc.getTime() - now.getTime() <= MAX_BOOKING_DAYS_AHEAD * 24 * 60 * 60 * 1000;
}

/** Pure calendar-date arithmetic on "YYYY-MM-DD" — no timezone involved, so no DST ambiguity. */
export function addDaysToDateStr(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

/**
 * UTC instant range [start, end) covering one London calendar day. Each bound
 * is derived independently via `londonWallTimeToUtc`, so a day with a DST
 * transition (23h or 25h long) is still bounded correctly.
 */
export function londonDayBoundsUtc(dateStr: string): { start: Date; end: Date } {
  const start = londonWallTimeToUtc(dateStr, 0, 0);
  const end = londonWallTimeToUtc(addDaysToDateStr(dateStr, 1), 0, 0);
  return { start, end };
}

/** "Wed 22 Jul, 2:30pm" — used in emails/WhatsApp so displayed text and the underlying UTC instant never visually disagree. */
export function formatLondonDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: VIEWING_TIMEZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}
