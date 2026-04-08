const { expect } = require('chai');
const {
  canonicalParticipantIds,
  arePartnered,
  findSessionForPair,
  getRelationshipStatus,
} = require('../modules/chatPartnership');

describe('chatPartnership', () => {
  it('canonicalParticipantIds sorts consistently', () => {
    expect(canonicalParticipantIds('b', 'a')).to.deep.equal(['a', 'b']);
  });

  it('arePartnered is true only for accepted requests in either direction', () => {
    const requests = [
      { fromUserId: 'u1', toUserId: 'u2', status: 'pending' },
      { fromUserId: 'a', toUserId: 'b', status: 'accepted' },
    ];
    expect(arePartnered('u1', 'u2', requests)).to.equal(false);
    expect(arePartnered('a', 'b', requests)).to.equal(true);
    expect(arePartnered('b', 'a', requests)).to.equal(true);
  });

  it('findSessionForPair finds by unordered pair', () => {
    const sessions = [
      { id: 's1', participantIds: ['x', 'y'] },
    ];
    expect(findSessionForPair(sessions, 'y', 'x').id).to.equal('s1');
  });

  it('getRelationshipStatus returns invited, received, partnered, none', () => {
    const requests = [
      { fromUserId: 'a', toUserId: 'b', status: 'pending' },
    ];
    expect(getRelationshipStatus('a', 'b', requests)).to.equal('invited');
    expect(getRelationshipStatus('b', 'a', requests)).to.equal('received');
    const accepted = [{ fromUserId: 'a', toUserId: 'b', status: 'accepted' }];
    expect(getRelationshipStatus('a', 'b', accepted)).to.equal('partnered');
    expect(getRelationshipStatus('a', 'z', requests)).to.equal('none');
  });
});
