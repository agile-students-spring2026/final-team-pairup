/** Demo partners — replace with API data. `lastActivityAt` in epoch ms. */

export const PARTNERS_MOCK_NOW = 1_711_000_000_000; // fixed anchor for tests

export const partnersMock = [
  {
    id: 'partner-jordan',
    name: 'Jordan Kim',
    initials: 'JK',
    backgroundLabel: 'Bootcamp',
    practiceTags: ['Coding'],
    lastActivityAt: PARTNERS_MOCK_NOW - 10 * 60 * 1000,
    lastMessagePreview:
      'Hey, want to try Dynamic Programming this weekend? This is extra text to verify one-line truncation works correctly in the UI.',
    upcomingSession: null,
  },
  {
    id: 'partner-alex',
    name: 'Alex Chen',
    initials: 'AC',
    backgroundLabel: 'CS grad',
    practiceTags: ['Coding', 'Concepts'],
    lastActivityAt: PARTNERS_MOCK_NOW - 60 * 60 * 1000,
    lastMessagePreview: 'Sent you 3 time options for our next session!',
    upcomingSession: {
      dateLabel: 'Sat, Mar 22 · 2:00 PM',
      sessionType: 'Mock interview',
    },
  },
];
