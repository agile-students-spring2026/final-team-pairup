export const mockUsers = [
  {
    id: 1,
    name: "Alex Chen",
    initials: "AC",
    background: "CS grad",
    linkedin: "https://linkedin.com/in/alexchen",
    matchPercentage: 92,

    completedSessions: 7,
    showUpRate: 100,

    goal: {
      role: "SDE",
      practiceFocus: ["Coding", "Concepts"],
      targetTier: "FAANG",
      timeline: "1–3 months",
    },

    level: {
      current: "Intermediate",
      pipCount: 2,
      pipTotal: 3,
      description: "Medium problems as main focus / a few mocks done",
      weakestArea: "Concepts",
    },

    about:
      "Ex-intern at AWS, grinding LeetCode daily. Love system design problems.",

    availability: {
      timezoneOptions: ["ET", "PT", "CT", "MT"],
      selectedTimezone: "ET",
      viewerTimezoneLabel: "(your timezone)",
      slots: {
        Mon: { AM: true, PM: false, Eve: true },
        Tue: { AM: false, PM: true, Eve: true },
        Wed: { AM: false, PM: false, Eve: true },
        Thu: { AM: true, PM: true, Eve: false },
        Fri: { AM: false, PM: true, Eve: false },
      },
    },

    sessionPreferences: {
      format: "1:1 mock interview",
      sessionLength: "45 min",
      cadence: "1–2 times/week",
      notes: "Prefers structured feedback and timed practice.",
    },

    invited: false,
  },
  {
    id: 2,
    name: "Priya Nair",
    initials: "PN",
    background: "CS undergrad",
    linkedin: "",
    matchPercentage: 85,

    completedSessions: 0,
    showUpRate: null,

    goal: {
      role: "SDE",
      practiceFocus: ["Coding", "Behavioral"],
      targetTier: "Mid-size tech",
      timeline: "3–6 months",
    },

    level: {
      current: "Beginner",
      pipCount: 1,
      pipTotal: 3,
      description: "Starting interview prep, building consistency",
      weakestArea: "",
    },

    about:
      "New to interview prep and looking for accountability + consistent weekly practice.",

    availability: {
      timezoneOptions: ["ET", "PT", "CT", "MT"],
      selectedTimezone: "ET",
      viewerTimezoneLabel: "(your timezone)",
      slots: {
        Mon: { AM: false, PM: true, Eve: true },
        Tue: { AM: false, PM: false, Eve: true },
        Wed: { AM: true, PM: false, Eve: false },
        Thu: { AM: false, PM: true, Eve: false },
        Fri: { AM: true, PM: false, Eve: false },
      },
    },

    sessionPreferences: {
      format: "Peer practice",
      sessionLength: "30 min",
      cadence: "1 time/week",
      notes: "Would like lighter-pressure practice and encouragement.",
    },

    invited: false,
  },
];