import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { formatRelativeAgo } from '../utils/relativeTime';
import { DEFAULT_SCHEDULE_AVAILABILITY_SLOTS } from '../utils/scheduleCalendar';
import ScheduleSessionSheet from './ScheduleSessionSheet';
import './PartnerSpaceScreen.css';

function devUserId() {
  return (
    (typeof localStorage !== 'undefined' && localStorage.getItem('userId')) ||
    'current-user'
  );
}

function withDevUserQuery(url) {
  const uid = devUserId();
  return `${url}${url.includes('?') ? '&' : '?'}userId=${encodeURIComponent(uid)}`;
}

function storageFirstVisitKey(partnerId) {
  return `pairup-partner-space-first-${partnerId}`;
}

function buildSystemIntro(partner, timelineLabel) {
  const focus = partner.practiceTags?.length
    ? partner.practiceTags.join(' and ')
    : 'shared topics';
  return `You’re now prepping partners! You both focus on ${focus} and are targeting ${timelineLabel}.`;
}

function buildProposalSystemMessage(payload, partnerFirstName) {
  return `Proposal sent: ${payload.interviewType} (${payload.level}). ${partnerFirstName} will pick one of ${payload.slots.length} time option(s). Meeting link is included for your partner.`;
}

function PartnerSpaceScreen({
  partner,
  onBack,
  onDisconnect,
  availabilitySlots = DEFAULT_SCHEDULE_AVAILABILITY_SLOTS,
  nowMs = Date.now(),
}) {
  const dialogTitleId = useId();
  const referenceDate = useMemo(() => new Date(nowMs), [nowMs]);
  const introTimeline = partner.timeline || 'your prep timeline';
  const icebreakerDraft = `Hey ${partner.name.split(' ')[0] || 'there'}! Want to prep together this week?`;

  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [localProposalSent, setLocalProposalSent] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [chatSessionId, setChatSessionId] = useState(null);
  const [chatStatus, setChatStatus] = useState('unknown');
  const [chatLoadingError, setChatLoadingError] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [incomingProposal, setIncomingProposal] = useState(null);
  const [proposalLoadingError, setProposalLoadingError] = useState('');
  const [proposalError, setProposalError] = useState('');
  const [isSendingProposal, setIsSendingProposal] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirmedSlot, setConfirmedSlot] = useState(null);

  useEffect(() => {
    async function fetchProposals() {
      try {
        setProposalLoadingError('');

        const res = await fetch(withDevUserQuery('/api/proposals'));
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to load proposals');
        }

        const matchedProposal = data.proposals.find(
          (proposal) =>
            proposal.toUserId === partner.id || proposal.fromUserId === partner.id
        );

        setIncomingProposal(matchedProposal || null);
      } catch (err) {
        console.error(err);
        setProposalLoadingError(err.message || 'Failed to load proposals');
      }
    }

    fetchProposals();
  }, [partner.id]);
  const feedbackKey = null;
  const [feedbackDone, setFeedbackDone] = useState(false);
  const [fbStep, setFbStep] = useState(1);
  const [q1AckVisible, setQ1AckVisible] = useState(false);
  const [q2Stars, setQ2Stars] = useState(null);
  const [q2Comment, setQ2Comment] = useState('');
  const [q3Suggestion, setQ3Suggestion] = useState('');
  const q1NoTimerRef = useRef(null);

  const endRef = useRef(null);

  const finishFeedbackFlow = () => {
    if (feedbackKey) {
      sessionStorage.setItem(feedbackKey, '1');
    }
    setFeedbackDone(true);
  };

  useEffect(() => {
    return () => {
      if (q1NoTimerRef.current) clearTimeout(q1NoTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!feedbackKey) {
      setFeedbackDone(false);
      return;
    }
    setFeedbackDone(sessionStorage.getItem(feedbackKey) === '1');
  }, [feedbackKey]);

  useEffect(() => {
    setFbStep(1);
    setQ1AckVisible(false);
    setQ2Stars(null);
    setQ2Comment('');
    setQ3Suggestion('');
  }, [partner.id]);

  useEffect(() => {
    async function loadChatFromApi() {
      try {
        setChatLoadingError('');
        setChatSessionId(null);
        const key = storageFirstVisitKey(partner.id);
        const isFirstVisit = !sessionStorage.getItem(key);
        const seedMessages = [];

        if (isFirstVisit) {
          sessionStorage.setItem(key, '1');
          seedMessages.push({
            id: `sys-intro-${partner.id}`,
            kind: 'system',
            body: buildSystemIntro(partner, introTimeline),
            at: Date.now(),
          });
          setDraft(icebreakerDraft);
        } else {
          setDraft('');
        }

        const statusRes = await fetch(withDevUserQuery(`/api/chat/partner-status/${partner.id}`));
        const statusData = await statusRes.json();
        if (!statusRes.ok) {
          throw new Error(statusData.error || 'Failed to load partner chat status');
        }
        setChatStatus(statusData.status);

        if (statusData.status !== 'partnered') {
          setMessages(seedMessages);
          setHydrated(true);
          return;
        }

        const sessionsRes = await fetch(withDevUserQuery('/api/chat/sessions?limit=100'));
        const sessionsData = await sessionsRes.json();
        if (!sessionsRes.ok) {
          throw new Error(sessionsData.error || 'Failed to load chat sessions');
        }

        const existingSession = (sessionsData.sessions || []).find(
          (session) => session.otherUserId === partner.id
        );

        if (!existingSession) {
          setMessages(seedMessages);
          setHydrated(true);
          return;
        }

        setChatSessionId(existingSession.id);

        const messagesRes = await fetch(
          withDevUserQuery(`/api/chat/sessions/${existingSession.id}/messages?limit=100`)
        );
        const messagesData = await messagesRes.json();
        if (!messagesRes.ok) {
          throw new Error(messagesData.error || 'Failed to load chat messages');
        }

        const uid = devUserId();
        const mapped = (messagesData.messages || []).map((message) => ({
          id: message.id,
          kind: message.senderId === uid ? 'me' : 'them',
          body: message.text,
          at: new Date(message.createdAt).getTime(),
        }));

        setMessages([...seedMessages, ...mapped]);
      } catch (err) {
        console.error(err);
        setChatLoadingError(err.message || 'Failed to load chat');
        setMessages([]);
      } finally {
        setHydrated(true);
      }
    }

    setHydrated(false);
    loadChatFromApi();
  }, [partner, introTimeline, icebreakerDraft]);

  useEffect(() => {
    if (!hydrated) return;
    const el = endRef.current;
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, hydrated, feedbackDone, fbStep]);

  const showFeedback = false;

  const showOutgoingBanner = localProposalSent;

  const send = async () => {
    const text = draft.trim();
    if (!text) return;

    if (chatStatus !== 'partnered') {
      setChatLoadingError('You can only chat with partnered users.');
      return;
    }

    try {
      setIsSendingMessage(true);
      setChatLoadingError('');

      let sessionId = chatSessionId;
      if (!sessionId) {
        const createRes = await fetch(withDevUserQuery('/api/chat/sessions'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ otherUserId: partner.id }),
        });
        const createData = await createRes.json();
        if (!createRes.ok) {
          throw new Error(createData.error || 'Failed to create chat session');
        }
        sessionId = createData.session.id;
        setChatSessionId(sessionId);
      }

      const messageRes = await fetch(
        withDevUserQuery(`/api/chat/sessions/${sessionId}/messages`),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        }
      );
      const messageData = await messageRes.json();
      if (!messageRes.ok) {
        throw new Error(messageData.error || 'Failed to send message');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: messageData.message.id,
          kind: 'me',
          body: messageData.message.text,
          at: new Date(messageData.message.createdAt).getTime(),
        },
      ]);
      setDraft('');
    } catch (err) {
      console.error(err);
      setChatLoadingError(err.message || 'Failed to send message');
    } finally {
      setIsSendingMessage(false);
    }
  };

  async function handleSendProposal(payload) {
    try {
      setIsSendingProposal(true);
      setProposalError('');

      const requestBody = {
        requestId: 'req-1',
        fromUserId: devUserId(),
        toUserId: partner.id,
        sessionType: payload.interviewType,
        level: payload.level,
        meetingLink: payload.meetingLink,
        timeOptions: payload.slots,
      };

      const res = await fetch(withDevUserQuery('/api/proposals'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create proposal');
      }

      console.log('Proposal created:', data);

      setLocalProposalSent(true);
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-proposal-${Date.now()}`,
          kind: 'system',
          body: buildProposalSystemMessage(payload, firstName),
          at: Date.now(),
        },
      ]);
    } catch (err) {
      console.error(err);
      setProposalError(err.message || 'Something went wrong');
    } finally {
      setIsSendingProposal(false);
    }
  }

  async function handleSelectSlot(slotId) {
    try {
      setIsUpdating(true);
      setSelectedSlotId(slotId);

      const res = await fetch(withDevUserQuery(`/api/proposals/${incomingProposal.id}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'accepted',
          selectedSlotId: slotId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to accept proposal');
      }

      console.log('Proposal accepted:', data);
      setIncomingProposal(data.proposal);
      
      const chosenSlot = data.proposal.timeOptions.find((slot) => slot.id === slotId);
      setConfirmedSlot(chosenSlot);
    } catch (err) {
      console.error(err);
      setProposalLoadingError(err.message || 'Failed to accept proposal');
      setSelectedSlotId(null);
    } finally {
      setIsUpdating(false);
    }
  }

  const firstName = partner.name.split(' ')[0] ?? partner.name;

  return (
    <>
      <div className="partner-space app-shell">
        <div className="partner-space__card app-shell__card app-shell__card--fill">
      <header className="partner-space__top">
        <button type="button" className="partner-space__back" onClick={onBack} aria-label="Back to partners">
          <svg className="partner-space__back-icon" aria-hidden="true" viewBox="0 0 24 24" focusable="false">
            <path d="M15 6L9 12L15 18" />
          </svg>
        </button>
        <button
          type="button"
          className="partner-space__identity"
          onClick={() => setDisconnectOpen(true)}
          aria-label={`Manage or disconnect partnership with ${partner.name}`}
        >
          <span className="partner-space__avatar" aria-hidden="true">
            {partner.initials}
          </span>
          <span className="partner-space__identity-text">
            <span className="partner-space__name">{partner.name}</span>
            <span className="partner-space__manage-hint">Tap to manage</span>
          </span>
        </button>
      </header>

      {partner.upcomingSession && (
        <div className="partner-space__upcoming-pill" role="status">
          <span className="partner-space__upcoming-label">Upcoming</span>
          <span className="partner-space__upcoming-sep" aria-hidden="true">
            ·
          </span>
          <span>{partner.upcomingSession.dateLabel}</span>
          <span className="partner-space__upcoming-sep" aria-hidden="true">
            ·
          </span>
          <span>{partner.upcomingSession.sessionType}</span>
        </div>
      )}

      {proposalLoadingError && (
        <p style={{ color: 'red', padding: '8px 20px' }}>
          {proposalLoadingError}
        </p>
      )}
      {chatLoadingError && (
        <p style={{ color: 'red', padding: '8px 20px' }}>
          {chatLoadingError}
        </p>
      )}

      {incomingProposal && (
        <section className="partner-space__proposal-in" aria-label="Incoming session proposal">
          <p className="partner-space__proposal-in-kicker">Session proposal</p>
          <p className="partner-space__proposal-in-title">
            {partner.name} proposed a session
          </p>
          <p className="partner-space__proposal-in-meta">
            {incomingProposal.sessionType} · {incomingProposal.level}
          </p>
          <div className="partner-space__proposal-slots">
            {incomingProposal.timeOptions.map((slot) => {
              const isSelected = selectedSlotId === slot.id;

              return (
                <button
                  key={slot.id}
                  className="partner-space__proposal-slot"
                  onClick={() => handleSelectSlot(slot.id)}
                  disabled={isUpdating || selectedSlotId}
                  style={{
                    background: isSelected ? '#d1fae5' : '',
                    border: isSelected ? '2px solid green' : '',
                  }}
                >
                  {isSelected ? `✔ ${slot.label}` : slot.label}
                </button>
              );
            })}
          </div>
          {selectedSlotId && (
            <p style={{ color: 'green', padding: '10px 0' }}>
              Session confirmed!
            </p>
          )}
        </section>
      )}

      {showOutgoingBanner && (
        <div className="partner-space__banner" role="status">
          <span className="partner-space__banner-dot" aria-hidden="true" />
          Waiting for {firstName} to pick a time from your proposal.
        </div>
      )}

      <div className="partner-space__thread" role="log" aria-label="Chat messages">
        {hydrated &&
          messages.map((m) => {
            if (m.kind === 'system') {
              return (
                <div key={m.id} className="partner-space__system-wrap">
                  <div className="partner-space__system">{m.body}</div>
                </div>
              );
            }
            if (m.kind === 'them') {
              return (
                <div key={m.id} className="partner-space__row partner-space__row--them">
                  <span className="partner-space__bubble-avatar" aria-hidden="true">
                    {partner.initials}
                  </span>
                  <div className="partner-space__col">
                    <div className="partner-space__bubble partner-space__bubble--them">{m.body}</div>
                    <time className="partner-space__ts" dateTime={new Date(m.at).toISOString()}>
                      {formatRelativeAgo(m.at, nowMs)}
                    </time>
                  </div>
                </div>
              );
            }
            return (
              <div key={m.id} className="partner-space__row partner-space__row--me">
                <div className="partner-space__col partner-space__col--me">
                  <div className="partner-space__bubble partner-space__bubble--me">{m.body}</div>
                  <time className="partner-space__ts partner-space__ts--me" dateTime={new Date(m.at).toISOString()}>
                    {formatRelativeAgo(m.at, nowMs)}
                  </time>
                </div>
              </div>
            );
          })}
        <div ref={endRef} />
      </div>

      {showFeedback && (
        <div className="partner-space__feedback" role="region" aria-label="Session feedback">
          <div className="partner-space__feedback-head">
            <p className="partner-space__feedback-kicker">Session feedback</p>
            <p className="partner-space__feedback-meta-right">Recent session</p>
          </div>

          {fbStep === 1 && !q1AckVisible && (
            <>
              <p className="partner-space__feedback-q">
                Did {firstName} show up to the session?
              </p>
              <div className="partner-space__feedback-actions">
                <button
                  type="button"
                  className="partner-space__fb-yes"
                  onClick={() => setFbStep(2)}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className="partner-space__fb-no"
                  onClick={() => {
                    if (q1NoTimerRef.current) clearTimeout(q1NoTimerRef.current);
                    setQ1AckVisible(true);
                    q1NoTimerRef.current = setTimeout(() => {
                      setQ1AckVisible(false);
                      setFbStep(2);
                      q1NoTimerRef.current = null;
                    }, 2000);
                  }}
                >
                  No
                </button>
              </div>
            </>
          )}

          {fbStep === 1 && q1AckVisible && (
            <p className="partner-space__fb-ack" role="status">
              Thanks — we’ve noted this for partner stats.
            </p>
          )}

          {fbStep === 2 && (
            <div className="partner-space__fb-q2">
              <p className="partner-space__feedback-q">How was the session? (required)</p>
              <div className="partner-space__stars" role="radiogroup" aria-label="Session rating 1 to 3">
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={q2Stars === n}
                    className={`partner-space__star${q2Stars === n ? ' partner-space__star--on' : ''}`}
                    onClick={() => setQ2Stars(n)}
                  >
                    {n}★
                  </button>
                ))}
              </div>
              <label className="partner-space__fb-label" htmlFor="fb-q2-comment">
                Comment <span className="partner-space__fb-optional">(optional)</span>
              </label>
              <textarea
                id="fb-q2-comment"
                className="partner-space__fb-textarea"
                rows={2}
                placeholder="Anything you want to remember about this session…"
                value={q2Comment}
                onChange={(e) => setQ2Comment(e.target.value)}
              />
              <button
                type="button"
                className="partner-space__fb-next"
                disabled={q2Stars == null}
                onClick={() => setFbStep(3)}
              >
                Next
              </button>
            </div>
          )}

          {fbStep === 3 && (
            <div className="partner-space__fb-q3">
              <p className="partner-space__feedback-q">Suggest an improvement for PairUp</p>
              <p className="partner-space__fb-team-only">Visible only to the PairUp team — not your partner.</p>
              <textarea
                className="partner-space__fb-textarea"
                rows={2}
                placeholder="Optional feedback about the app…"
                value={q3Suggestion}
                onChange={(e) => setQ3Suggestion(e.target.value)}
              />
              <div className="partner-space__fb-q3-actions">
                <button type="button" className="partner-space__fb-skip" onClick={finishFeedbackFlow}>
                  Skip
                </button>
                <button type="button" className="partner-space__fb-submit" onClick={finishFeedbackFlow}>
                  Submit
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {proposalError && (
        <p style={{ color: 'red', padding: '8px 20px' }}>
          {proposalError}
        </p>
      )}
      <div className="partner-space__composer">
        <button type="button" className="partner-space__schedule" onClick={() => setScheduleOpen(true)}>
          <span className="partner-space__schedule-icon" aria-hidden="true">
            +
          </span>
          Schedule a session
        </button>
        <div className="partner-space__input-row">
          <label htmlFor="partner-space-msg" className="visually-hidden">
            Message
          </label>
          <input
            id="partner-space-msg"
            className="partner-space__input"
            type="text"
            placeholder="Message…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <button type="button" className="partner-space__send" aria-label="Send message" onClick={send}>
            <span aria-hidden="true">➤</span>
          </button>
        </div>
      </div>
        </div>
      </div>

      <ScheduleSessionSheet
        isOpen={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        availabilitySlots={availabilitySlots}
        referenceDate={referenceDate}
        onSendProposal={handleSendProposal}
      />

      {disconnectOpen && (
        <div
          className="partner-space__modal-backdrop"
          role="presentation"
          onClick={() => setDisconnectOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            className="partner-space__modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id={dialogTitleId} className="partner-space__modal-title">
              Disconnect from {partner.name}?
            </h2>
            <p className="partner-space__modal-copy">
              You’ll stop sharing this prep space. You can’t undo this from the app.
            </p>
            <div className="partner-space__modal-actions">
              <button type="button" className="partner-space__modal-cancel" onClick={() => setDisconnectOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="partner-space__modal-danger"
                onClick={() => {
                  setDisconnectOpen(false);
                  onDisconnect?.();
                }}
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PartnerSpaceScreen;
