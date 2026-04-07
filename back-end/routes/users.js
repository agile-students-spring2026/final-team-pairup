const express = require('express');
const { body, validationResult } = require('express-validator');
const { randomUUID } = require('crypto');
const mockUsers = require('../data/mockUsers.json');

const router = express.Router();

const ROLE_OPTIONS = ['SDE', 'PM'];
const PRACTICE_BY_ROLE = {
  SDE: ['Coding', 'System Design', 'Behavioral'],
  PM: ['Product Sense', 'Analytical', 'Behavioral'],
};
const TARGET_TIER_OPTIONS = ['FAANG', 'Mid-size tech', 'Startup', 'Any'];
const TIMELINE_OPTIONS = ['< 1 month', '1-3 months', '3-6 months', 'Just practicing'];
const LEVEL_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'];
const BACKGROUND_OPTIONS = ['CS undergrad', 'CS grad', 'Non-CS', 'Bootcamp', 'Self-taught'];
const WHO_GOES_FIRST_OPTIONS = [
  'Go first as interviewee',
  'Go first as interviewer',
  'No preference',
];
const FEEDBACK_STYLE_OPTIONS = ['Direct and critical', 'Balanced', 'Encouraging'];

const AVAILABILITY_DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const PATCHABLE_FIELDS = [
  'displayName',
  'role',
  'practiceFocus',
  'targetTier',
  'timeline',
  'level',
  'weakestArea',
  'background',
  'school',
  'bio',
  'linkedinUrl',
  'availability',
  'whoGoesFirst',
  'feedbackStyle',
  'timezone',
];
const PUBLIC_STRIP_FIELDS = new Set([
  'email',
  'passwordHash',
  'notifications',
  'activePartnerships',
  'totalPartnerships',
  'pendingReceivedInvites',
  'inviteResponseRate',
]);
const OWN_STRIP_FIELDS = new Set(['passwordHash']);

function countAvailabilityCells(availability) {
  return AVAILABILITY_DAYS.reduce((count, day) => {
    const slots = availability?.[day];
    if (!Array.isArray(slots)) return count;
    return count + slots.filter(Boolean).length;
  }, 0);
}

function isValidAvailability(availability) {
  if (!availability || typeof availability !== 'object' || Array.isArray(availability)) {
    return false;
  }

  for (const day of AVAILABILITY_DAYS) {
    const slots = availability[day];
    if (!Array.isArray(slots) || slots.length !== 3) {
      return false;
    }
    if (!slots.every((slot) => typeof slot === 'boolean')) {
      return false;
    }
  }

  return countAvailabilityCells(availability) >= 3;
}

function stripFields(user, stripSet) {
  const clone = JSON.parse(JSON.stringify(user));
  for (const key of stripSet) {
    delete clone[key];
  }
  return clone;
}

function toPublicUser(user) {
  return stripFields(user, PUBLIC_STRIP_FIELDS);
}

function toOwnUser(user) {
  return stripFields(user, OWN_STRIP_FIELDS);
}

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'user';
}

function assertAllowedKeys(payload, partial) {
  const allowedKeys = partial ? PATCHABLE_FIELDS : [...PATCHABLE_FIELDS, 'email', 'passwordHash'];
  const unknownKeys = Object.keys(payload).filter((key) => !allowedKeys.includes(key));
  if (unknownKeys.length > 0) {
    throw new Error(`Unknown field(s): ${unknownKeys.join(', ')}`);
  }
}

function assertEnum(value, options, label) {
  if (!options.includes(value)) {
    throw new Error(`${label} must be one of: ${options.join(', ')}`);
  }
}

function validateUserShape(payload, { partial = false, existingUser = null } = {}) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Request body must be a JSON object.');
  }

  assertAllowedKeys(payload, partial);

  const merged = partial && existingUser ? { ...existingUser, ...payload } : { ...payload };

  const requiredFields = [
    'displayName',
    'role',
    'practiceFocus',
    'targetTier',
    'timeline',
    'level',
    'background',
    'availability',
    'whoGoesFirst',
    'feedbackStyle',
  ];

  if (!partial) {
    for (const field of requiredFields) {
      if (merged[field] === undefined) {
        throw new Error(`${field} is required.`);
      }
    }
  }

  if (!partial || payload.displayName !== undefined) {
    if (typeof merged.displayName !== 'string' || merged.displayName.trim().length < 1 || merged.displayName.trim().length > 50) {
      throw new Error('displayName must be 1-50 characters.');
    }
  }

  if (!partial || payload.role !== undefined) {
    assertEnum(merged.role, ROLE_OPTIONS, 'role');
  }

  if (!partial || payload.practiceFocus !== undefined || payload.role !== undefined) {
    if (!Array.isArray(merged.practiceFocus) || merged.practiceFocus.length < 1) {
      throw new Error('practiceFocus must be a non-empty array.');
    }

    const validPractice = PRACTICE_BY_ROLE[merged.role] || [];
    const invalidFocus = merged.practiceFocus.filter((item) => !validPractice.includes(item));
    if (invalidFocus.length > 0) {
      throw new Error(`practiceFocus contains invalid values for ${merged.role}: ${invalidFocus.join(', ')}`);
    }
  }

  if (!partial || payload.targetTier !== undefined) {
    assertEnum(merged.targetTier, TARGET_TIER_OPTIONS, 'targetTier');
  }

  if (!partial || payload.timeline !== undefined) {
    assertEnum(merged.timeline, TIMELINE_OPTIONS, 'timeline');
  }

  if (!partial || payload.level !== undefined) {
    assertEnum(merged.level, LEVEL_OPTIONS, 'level');
  }

  if (!partial || payload.background !== undefined) {
    assertEnum(merged.background, BACKGROUND_OPTIONS, 'background');
  }

  if (!partial || payload.whoGoesFirst !== undefined) {
    assertEnum(merged.whoGoesFirst, WHO_GOES_FIRST_OPTIONS, 'whoGoesFirst');
  }

  if (!partial || payload.feedbackStyle !== undefined) {
    assertEnum(merged.feedbackStyle, FEEDBACK_STYLE_OPTIONS, 'feedbackStyle');
  }

  if (!partial || payload.bio !== undefined) {
    if (merged.bio !== null && merged.bio !== undefined) {
      if (typeof merged.bio !== 'string' || merged.bio.length > 150) {
        throw new Error('bio must be 150 characters or fewer.');
      }
    }
  }

  if (!partial || payload.linkedinUrl !== undefined) {
    if (merged.linkedinUrl !== null && merged.linkedinUrl !== undefined && merged.linkedinUrl !== '') {
      try {
        new URL(merged.linkedinUrl);
      } catch (_error) {
        throw new Error('linkedinUrl must be a valid URL.');
      }
    }
  }

  if (!partial || payload.weakestArea !== undefined || payload.practiceFocus !== undefined || payload.role !== undefined) {
    if (merged.weakestArea !== null && merged.weakestArea !== undefined && merged.weakestArea !== '') {
      if (!merged.practiceFocus.includes(merged.weakestArea)) {
        throw new Error('weakestArea must be one of the selected practiceFocus values.');
      }
    }
  }

  if (!partial || payload.availability !== undefined) {
    if (!isValidAvailability(merged.availability)) {
      throw new Error('availability must include all 7 days, 3 boolean slots per day, and at least 3 selected cells.');
    }
  }

  if (!partial || payload.email !== undefined) {
    if (merged.email !== undefined && merged.email !== null && merged.email !== '') {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(merged.email)) {
        throw new Error('email must be a valid email address.');
      }
    }
  }

  return merged;
}

function validationErrors(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }

  return res.status(400).json({
    error: 'Validation failed',
    details: result.array().map((item) => item.msg),
  });
}

function createStoredUser(body) {
  const now = new Date().toISOString();
  const safeDisplayName = body.displayName.trim();

  const generatedEmail =
    body.email && body.email.trim()
      ? body.email.trim().toLowerCase()
      : `${slugify(safeDisplayName)}.${Date.now()}@example.com`;

  return {
    _id: randomUUID(),
    email: generatedEmail,
    passwordHash: body.passwordHash || '$2b$10$placeholderhashedpassword',
    displayName: safeDisplayName,
    role: body.role,
    practiceFocus: body.practiceFocus,
    targetTier: body.targetTier,
    timeline: body.timeline,
    level: body.level,
    weakestArea: body.weakestArea ?? null,
    background: body.background,
    school: body.school || 'NYU Tandon',
    bio: body.bio ?? null,
    linkedinUrl: body.linkedinUrl || null,
    availability: body.availability,
    whoGoesFirst: body.whoGoesFirst,
    feedbackStyle: body.feedbackStyle,
    timezone: body.timezone || 'America/New_York',
    sessionsCompleted: 0,
    showUpRate: 1.0,
    activePartnerships: 0,
    totalPartnerships: 0,
    pendingReceivedInvites: 0,
    inviteResponseRate: 1.0,
    notifications: {
      inviteReceived: true,
      matchConfirmed: true,
      sessionReminder: true,
    },
    createdAt: now,
    updatedAt: now,
  };
}

const createValidators = [
  body().custom((value) => {
    validateUserShape(value, { partial: false });
    return true;
  }),
  validationErrors,
];

const patchValidators = [
  body().custom((value, { req }) => {
    validateUserShape(value, { partial: true, existingUser: req.user });
    return true;
  }),
  validationErrors,
];

router.get('/users/me', (req, res) => {
  return res.status(200).json({ user: toOwnUser(req.user) });
});

router.get('/users/:id', (req, res) => {
  const user = mockUsers.find((candidate) => candidate._id === req.params.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.status(200).json({ user: toPublicUser(user) });
});

router.post('/users', createValidators, (req, res) => {
  const normalizedEmail = req.body.email?.trim().toLowerCase();

  if (normalizedEmail && mockUsers.some((user) => user.email.toLowerCase() === normalizedEmail)) {
    return res.status(400).json({ error: 'Validation failed', details: ['email must be unique.'] });
  }

  const user = createStoredUser(req.body);
  mockUsers.push(user);

  return res.status(201).json({ user: toOwnUser(user) });
});

router.patch('/users/me', patchValidators, (req, res) => {
  const userIndex = mockUsers.findIndex((candidate) => candidate._id === req.user._id);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const existingUser = mockUsers[userIndex];
  const updatedUser = {
    ...existingUser,
    ...req.body,
    displayName: req.body.displayName !== undefined ? req.body.displayName.trim() : existingUser.displayName,
    linkedinUrl: req.body.linkedinUrl === '' ? null : (req.body.linkedinUrl ?? existingUser.linkedinUrl),
    bio: req.body.bio === '' ? null : (req.body.bio ?? existingUser.bio),
    weakestArea: req.body.weakestArea === '' ? null : (req.body.weakestArea ?? existingUser.weakestArea),
    updatedAt: new Date().toISOString(),
  };

  mockUsers[userIndex] = updatedUser;
  req.user = updatedUser;

  return res.status(200).json({ user: toOwnUser(updatedUser) });
});

module.exports = router;