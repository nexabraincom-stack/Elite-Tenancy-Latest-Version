/**
 * Shared Europe/London time formatting for the viewing-booking flow — every
 * page that shows a viewing time should use this, so they never disagree.
 */

const VIEWING_TIMEZONE = "Europe/London";

/** "Wed 22 Jul, 2:30pm" */
export function formatLondonDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: VIEWING_TIMEZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

/** "2:30pm" */
export function formatLondonTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: VIEWING_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

/**
 * "YYYY-MM-DD" for the London calendar date a genuine UTC instant falls on
 * (e.g. "what day is it in London right now"). Do NOT use this for a date
 * picker's selection — react-day-picker's `Date` represents a calendar day
 * using the BROWSER's local system timezone, not a UTC instant, so running
 * it through an Intl Europe/London conversion can shift it a day in either
 * direction depending on the visitor's system clock. Use `dateToYMD` for that.
 */
export function toLondonDateStr(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: VIEWING_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * "YYYY-MM-DD" read directly off a Date's local calendar components — for
 * turning a date-picker selection into the string sent to the backend. The
 * picker already shows the user their own local calendar; this preserves
 * whatever day they clicked instead of reinterpreting it through a timezone.
 */
export function dateToYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
