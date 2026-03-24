/**
 * Mock data for the Matches feature (Received + Invited & Waiting tabs).
 * Timestamps are relative to Date.now() so expiry countdowns always look
 * realistic in the demo without needing a live backend.
 */

const NOW = Date.now();
const h = (n) => n * 60 * 60 * 1000;

export const receivedInvitesMock = [
  {
    id: 'recv-1',
    senderName: 'Jamie Lee',
    senderInitials: 'JL',
    role: 'SDE',
    tier: 'New Grad',
    background: 'CS Undergrad',
    practiceFocus: ['DSA', 'System Design'],
    bio: 'NYU Tandon CS senior targeting FAANG SWE offers for summer 2026. Strong in algorithms, want to sharpen system design.',
    matchScore: 94,
    availabilityOverlap: ['Weekday evenings', 'Weekend mornings'],
    avatarSeed: 'jamie42',
    sentAt: NOW - h(2),
    expiresAt: NOW + h(46),
  },
  {
    id: 'recv-2',
    senderName: 'Priya Sharma',
    senderInitials: 'PS',
    role: 'PM',
    tier: 'Internship',
    background: 'Business + CS',
    practiceFocus: ['Product Sense', 'Analytical'],
    bio: 'Double major in Business and CS. Looking for a structured PM mock interview partner for summer internship prep.',
    matchScore: 81,
    availabilityOverlap: ['Weekend afternoons'],
    avatarSeed: 'priya17',
    sentAt: NOW - h(18),
    expiresAt: NOW + h(30),
  },
];

export const sentInvitesMock = [
  {
    id: 'sent-1',
    recipientName: 'Morgan Liu',
    recipientInitials: 'ML',
    role: 'SDE',
    tier: 'Intern',
    background: 'CS Undergrad',
    practiceFocus: ['DSA', 'Behavioral'],
    matchScore: 88,
    avatarSeed: 'morgan55',
    sentAt: NOW - h(26),
    expiresAt: NOW + h(22),
  },
  {
    id: 'sent-2',
    recipientName: 'Chris Park',
    recipientInitials: 'CP',
    role: 'SDE',
    tier: 'New Grad',
    background: 'Bootcamp',
    practiceFocus: ['DSA'],
    matchScore: 76,
    avatarSeed: 'chris88',
    sentAt: NOW - h(42),
    expiresAt: NOW + h(6),
  },
];

/** Shown inline on WaitingTab to encourage more invites when slots are open. */
export const matchRecommendationsMock = [
  {
    id: 'rec-1',
    name: 'Taylor Nguyen',
    initials: 'TN',
    role: 'SDE',
    tier: 'New Grad',
    background: 'CS Grad',
    matchScore: 91,
    avatarSeed: 'taylor33',
  },
  {
    id: 'rec-2',
    name: 'Sam Rivera',
    initials: 'SR',
    role: 'SDE',
    tier: 'Intern',
    background: 'CS Undergrad',
    matchScore: 85,
    avatarSeed: 'sam21',
  },
];
