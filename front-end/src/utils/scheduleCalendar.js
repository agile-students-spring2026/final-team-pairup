/** @typedef {{ id: string, label: string, startMs: number }} HourSlotOption */

const DOW_IDS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

const BAND_HOURS = {
  am: [8, 9, 10, 11],
  pm: [12, 13, 14, 15, 16],
  evening: [17, 18, 19, 20, 21],
};

function parseSlotKey(key) {
  const i = key.lastIndexOf('-');
  return { day: key.slice(0, i), band: key.slice(i + 1) };
}

function formatDayHeading(date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function formatHourRange(date, startHour) {
  const start = new Date(date);
  start.setHours(startHour, 0, 0, 0);
  const end = new Date(start);
  end.setHours(startHour + 1, 0, 0, 0);
  const opts = { hour: 'numeric', minute: '2-digit' };
  return `${new Intl.DateTimeFormat('en-US', opts).format(start)} – ${new Intl.DateTimeFormat('en-US', opts).format(end)}`;
}

function localDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Build calendar days for the next `numDays` days from `referenceDate` (local midnight boundary per day).
 * `availabilitySlots` uses band keys like mon-am, tue-evening (same as onboarding).
 * @param {Date} referenceDate
 * @param {string[]} availabilitySlots
 * @param {number} [numDays=14]
 */
export function buildScheduleCalendarDays(referenceDate, availabilitySlots, numDays = 14) {
  const set = new Set(availabilitySlots);
  const byDayBand = new Map();
  for (const key of availabilitySlots) {
    const { day, band } = parseSlotKey(key);
    if (!byDayBand.has(day)) byDayBand.set(day, new Set());
    byDayBand.get(day).add(band);
  }

  const start = new Date(referenceDate);
  start.setHours(12, 0, 0, 0);

  const days = [];
  for (let i = 0; i < numDays; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const dow = DOW_IDS[d.getDay()];
    const bands = byDayBand.get(dow);
    /** @type {HourSlotOption[]} */
    const hourSlots = [];

    if (bands) {
      for (const band of bands) {
        const hours = BAND_HOURS[band];
        if (!hours) continue;
        const keyPrefix = `${dow}-${band}`;
        if (!set.has(keyPrefix)) continue;
        const dk = localDateKey(d);
        for (const h of hours) {
          const id = `${dk}T${String(h).padStart(2, '0')}:00:00`;
          hourSlots.push({
            id,
            startMs: new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, 0, 0, 0).getTime(),
            label: `${formatDayHeading(d)} · ${formatHourRange(d, h)}`,
          });
        }
      }
    }

    hourSlots.sort((a, b) => a.startMs - b.startMs);

    days.push({
      date: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
      dateKey: localDateKey(d),
      heading: formatDayHeading(d),
      disabled: hourSlots.length === 0,
      slotCount: hourSlots.length,
      hourSlots,
    });
  }

  return days;
}

export function splitThisWeekNextWeek(days) {
  return {
    thisWeek: days.slice(0, 7),
    nextWeek: days.slice(7, 14),
  };
}

/** Default bands for scheduling demo when onboarding slots are not wired yet. */
export const DEFAULT_SCHEDULE_AVAILABILITY_SLOTS = [
  'mon-am',
  'mon-pm',
  'tue-am',
  'tue-pm',
  'wed-am',
  'wed-pm',
  'thu-am',
  'thu-pm',
  'fri-am',
  'fri-pm',
  'sat-am',
  'sun-am',
];
