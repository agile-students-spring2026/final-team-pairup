// test/matchScoring.test.js
const { expect } = require('chai');
const { calculateMatchScore } = require('../modules/matchScoring');
const mockUsers = require('../data/mockUsers.json');

const getUser = (id) => mockUsers.find(u => u._id === id);

describe('calculateMatchScore', function () {
  const current = getUser('current-user');

  it('returns 100 for a perfect same-role match', function () {
    const result = calculateMatchScore(current, getUser('user-sde-int-match'));
    expect(result).to.not.be.null;
    expect(result.matchPercent).to.equal(100);
    expect(result.isCrossRole).to.be.false;
  });

  it('returns null for self-match', function () {
    const result = calculateMatchScore(current, current);
    expect(result).to.be.null;
  });

  it('returns null when 0 shared availability cells', function () {
    const result = calculateMatchScore(current, getUser('user-sde-int-zero-avail'));
    expect(result).to.be.null;
  });

  it('scores availability at 10 for 1 shared cell', function () {
    const oneCell = {
      ...getUser('user-sde-int-match'),
      _id: 'test-one-cell',
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
    const result = calculateMatchScore(current, oneCell);
    expect(result).to.not.be.null;
    expect(result.scoreBreakdown.availability).to.equal(10);
    expect(result.sharedCells).to.equal(1);
  });

  it('caps availability at 35 for >4 shared cells', function () {
    const result = calculateMatchScore(current, getUser('user-sde-int-match'));
    expect(result.scoreBreakdown.availability).to.equal(35);
    expect(result.sharedCells).to.be.above(4);
  });

  it('gives cross-role same level half credit (10, not 20)', function () {
    const result = calculateMatchScore(current, getUser('user-pm-int-cross'));
    expect(result).to.not.be.null;
    expect(result.isCrossRole).to.be.true;
    expect(result.scoreBreakdown.level).to.equal(10);
  });

  it('limits cross-role practice overlap to 1 (Behavioral only)', function () {
    const result = calculateMatchScore(current, getUser('user-pm-int-cross'));
    expect(result.scoreBreakdown.practiceFocus).to.equal(10);
    expect(result.scoreBreakdown.sharedFocusAreas).to.deep.equal(['Behavioral']);
  });

  it('scores 0 for two-apart level (not negative)', function () {
    // Current is Intermediate(1). Need a candidate at distance 2.
    // Synthesize an Advanced(2) "current" vs Beginner(0) candidate.
    const advCurrent = { ...current, _id: 'test-adv', level: 'Advanced' };
    const begCandidate = { ...getUser('user-sde-beg-far') };
    const result = calculateMatchScore(advCurrent, begCandidate);
    expect(result).to.not.be.null;
    expect(result.scoreBreakdown.levelDistance).to.equal(2);
    expect(result.scoreBreakdown.level).to.equal(0);
  });

  it('handles zero practice focus overlap correctly', function () {
    const noOverlap = {
      ...getUser('user-sde-int-match'),
      _id: 'test-no-focus',
      practiceFocus: []
    };
    const result = calculateMatchScore(current, noOverlap);
    expect(result).to.not.be.null;
    expect(result.scoreBreakdown.practiceFocus).to.equal(0);
  });

  it('applies diminishing returns: 3 focus overlaps = 20 (not 30)', function () {
    const result = calculateMatchScore(current, getUser('user-sde-int-match'));
    expect(result.scoreBreakdown.sharedFocusAreas).to.have.lengthOf(3);
    expect(result.scoreBreakdown.practiceFocus).to.equal(20);
  });

  it('scores one-apart level at 8 (same role)', function () {
    const result = calculateMatchScore(current, getUser('user-sde-adv-close'));
    expect(result).to.not.be.null;
    expect(result.scoreBreakdown.level).to.equal(8);
    expect(result.scoreBreakdown.levelDistance).to.equal(1);
  });
});
