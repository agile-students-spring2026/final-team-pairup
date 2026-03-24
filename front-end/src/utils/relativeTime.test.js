import { formatRelativeAgo } from './relativeTime';

test('formatRelativeAgo', () => {
  const now = 1_000_000;
  expect(formatRelativeAgo(now - 30_000, now)).toMatch(/30s ago/);
  expect(formatRelativeAgo(now - 5 * 60 * 1000, now)).toBe('5m ago');
  expect(formatRelativeAgo(now - 2 * 60 * 60 * 1000, now)).toBe('2h ago');
});
