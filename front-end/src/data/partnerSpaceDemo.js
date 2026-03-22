import { PARTNERS_MOCK_NOW } from './partnersMock';

const DAY = 24 * 60 * 60 * 1000;

/** Demo-only: session proposal / chat / feedback flags per partner. Replace with API. */
export function getPartnerSpaceDemo(partnerId) {
  if (partnerId === 'partner-jordan') {
    return {
      introTimeline: 'Just practicing',
      icebreaker:
        'Hey Jordan — want to run a mock this weekend? I can do Sat afternoon or Sun morning if any of those slots work.',
      outgoingProposalWaiting: true,
      incomingProposal: null,
      postSessionFeedback: {
        sessionLabel: 'Sat Mar 15 · Coding — Arrays',
        partnerFirstName: 'Jordan',
      },
      messages: [
        {
          id: 'h1',
          author: 'them',
          body: 'Want to try Dynamic Programming together sometime this week?',
          at: PARTNERS_MOCK_NOW - 3 * DAY,
        },
        {
          id: 'h2',
          author: 'me',
          body: 'Yes! I just sent over a few time options — pick whatever works.',
          at: PARTNERS_MOCK_NOW - 2 * DAY,
        },
        {
          id: 'h3',
          author: 'them',
          body: 'Hey, want to try Dynamic Programming this weekend?',
          at: PARTNERS_MOCK_NOW - 10 * 60 * 1000,
        },
      ],
    };
  }

  if (partnerId === 'partner-alex') {
    return {
      introTimeline: '1–3 months',
      icebreaker:
        "Hi Alex — thanks for the match! I'm flexible next week if you want to propose a couple slots.",
      outgoingProposalWaiting: false,
      incomingProposal: {
        proposerName: 'Alex Chen',
        sessionType: 'Mock interview',
        level: 'Intermediate',
        slots: [
          { id: 'slot-a', label: 'Sat · 10:00 AM PT' },
          { id: 'slot-b', label: 'Sun · 2:00 PM PT' },
          { id: 'slot-c', label: 'Mon · 6:00 PM PT' },
        ],
      },
      postSessionFeedback: null,
      messages: [
        {
          id: 'a1',
          author: 'them',
          body: 'Sent you 3 time options for our next session!',
          at: PARTNERS_MOCK_NOW - 60 * 60 * 1000,
        },
      ],
    };
  }

  return {
    introTimeline: 'Just practicing',
    icebreaker: `Hi — excited to prep together. Let me know what times work for you.`,
    outgoingProposalWaiting: false,
    incomingProposal: null,
    postSessionFeedback: null,
    messages: [],
  };
}
