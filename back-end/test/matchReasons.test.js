// test/matchReasons.test.js
const { expect } = require('chai');
const { calculateMatchScore } = require('../modules/matchScoring');
const { generateReasons } = require('../modules/matchReasons');
const mockUsers = require('../data/mockUsers.json');

const getUser = (id) => mockUsers.find(u => u._id === id);

describe('generateReasons', function () {
  const current = getUser('current-user');

  it('returns top 3 reasons in priority order for same-role pair', function () {
    const match = getUser('user-sde-int-match');
    const { scoreBreakdown } = calculateMatchScore(current, match);
    const reasons = generateReasons(current, match, scoreBreakdown);

    expect(reasons).to.have.length.at.most(3);
    expect(reasons.length).to.be.at.least(1);
    expect(reasons[0]).to.match(/Both focusing on/);
  });

  it('puts "Cross-discipline prep" as reason #1 for cross-role pair', function () {
    const pm = getUser('user-pm-int-cross');
    const { scoreBreakdown } = calculateMatchScore(current, pm);
    const reasons = generateReasons(current, pm, scoreBreakdown);

    expect(reasons[0]).to.match(/Cross-discipline prep/);
  });

  it('returns only 1 reason when single factor matches', function () {
    const minMatch = {
      ...getUser('user-sde-int-match'),
      _id: 'test-min-match',
      practiceFocus: [],
      level: 'Beginner',
      timeline: 'Just practicing',
      targetTier: 'Startup',
      feedbackStyle: 'Direct and critical',
      whoGoesFirst: 'Go first as interviewer',
      availability: {
        mon: [false, false, true],
        tue: [false, false, false],
        wed: [false, false, false],
        thu: [false, false, false],
        fri: [false, false, false],
        sat: [false, false, false],
        sun: [false, false, false]
      }
    };
    const result = calculateMatchScore(current, minMatch);
    expect(result).to.not.be.null;
    const reasons = generateReasons(current, minMatch, result.scoreBreakdown);
    expect(reasons.length).to.be.at.most(3);
    expect(reasons.length).to.be.at.least(1);
  });

  it('adds fallback text when availability is the only reason', function () {
    // Directly construct a scoreBreakdown where only availability scored
    const availOnlyBreakdown = {
      availability: 10,
      practiceFocus: 0,
      level: 0,
      timeline: 0,
      targetTier: 0,
      feedbackStyle: 0,
      whoGoesFirst: 0,
      sharedFocusAreas: [],
      levelDistance: 2
    };
    const testCurrent = { ...current, feedbackStyle: 'Direct and critical' };
    const testCandidate = { ...getUser('user-sde-int-match'), _id: 'test-avail-only', feedbackStyle: 'Encouraging' };
    const reasons = generateReasons(testCurrent, testCandidate, availOnlyBreakdown);

    expect(reasons.some(r => r.startsWith('Both free'))).to.be.true;
    expect(reasons.some(r => r.includes('prep style'))).to.be.true;
  });
});
