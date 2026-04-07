// modules/availabilityHelper.js
// Pure helper — no Express dependency

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const BAND_NAMES = ['mornings', 'afternoons', 'evenings'];

/**
 * Count cells where both users are available.
 * @param {Object} userAvail - availability object with day keys → [bool, bool, bool]
 * @param {Object} candidateAvail - same shape
 * @returns {Number} 0-21
 */
function countSharedCells(userAvail, candidateAvail) {
  let count = 0;
  for (const day of DAYS) {
    for (let band = 0; band < 3; band++) {
      if (userAvail[day][band] && candidateAvail[day][band]) {
        count++;
      }
    }
  }
  return count;
}

/**
 * Natural language summary of shared availability, ~50 chars max.
 * Groups consecutive days with same shared bands.
 * Collapses Mon-Fri → "weekday", Sat-Sun → "weekend".
 *
 * @param {Object} userAvail
 * @param {Object} candidateAvail
 * @returns {String}
 */
function summarizeSharedAvailability(userAvail, candidateAvail) {
  // Build shared map: { dayIndex → Set of band indices }
  const sharedByDay = [];
  for (let d = 0; d < DAYS.length; d++) {
    const bands = new Set();
    for (let b = 0; b < 3; b++) {
      if (userAvail[DAYS[d]][b] && candidateAvail[DAYS[d]][b]) {
        bands.add(b);
      }
    }
    sharedByDay.push(bands);
  }

  // Group consecutive days with identical band sets
  const groups = [];
  let i = 0;
  while (i < 7) {
    if (sharedByDay[i].size === 0) { i++; continue; }
    const bandKey = [...sharedByDay[i]].sort().join(',');
    const startIdx = i;
    while (i < 7 && [...sharedByDay[i]].sort().join(',') === bandKey) {
      i++;
    }
    groups.push({
      dayIndices: Array.from({ length: i - startIdx }, (_, k) => startIdx + k),
      bands: [...sharedByDay[startIdx]]
    });
  }

  if (groups.length === 0) return '';

  // Format each group
  const parts = groups.map(({ dayIndices, bands }) => {
    const dayStr = formatDayRange(dayIndices);
    const bandStr = bands.map(b => BAND_NAMES[b]).join(' and ');
    return `${dayStr} ${bandStr}`;
  });

  const result = parts.join(', ');
  if (result.length <= 50) return result;
  return parts[0] + (parts.length > 1 ? ' and more' : '');
}

/**
 * Format day indices into a readable string.
 * Mon-Fri → "weekday", Sat-Sun → "weekend", otherwise list day names.
 */
function formatDayRange(dayIndices) {
  // Check for weekday (0-4) and weekend (5-6)
  const isWeekday = dayIndices.length === 5 &&
    dayIndices.every((d, i) => d === i);
  if (isWeekday) return 'weekday';

  const isWeekend = dayIndices.length === 2 &&
    dayIndices[0] === 5 && dayIndices[1] === 6;
  if (isWeekend) return 'weekend';

  const names = dayIndices.map(d => DAY_LABELS[d]);
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return names.slice(0, -1).join(', ') + ', and ' + names[names.length - 1];
}

module.exports = { countSharedCells, summarizeSharedAvailability };
