import { buildScheduleCalendarDays } from './scheduleCalendar';

test('buildScheduleCalendarDays: day with matching band has slots; empty availability disables all', () => {
  const ref = new Date(2025, 2, 19, 12, 0, 0, 0);
  const withWed = buildScheduleCalendarDays(ref, ['wed-am'], 14);
  const wed = withWed.find((x) => x.dateKey === '2025-03-19');
  expect(wed).toBeDefined();
  expect(wed.disabled).toBe(false);
  expect(wed.hourSlots.length).toBeGreaterThan(0);

  const none = buildScheduleCalendarDays(ref, [], 14);
  expect(none.every((d) => d.disabled)).toBe(true);
});
