import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { formatRelativeAgo } from '../utils/relativeTime';
import { getPartnerSpaceDemo } from '../services/mockApi';
import { DEFAULT_SCHEDULE_AVAILABILITY_SLOTS } from '../utils/scheduleCalendar';
import ScheduleSessionSheet from './ScheduleSessionSheet';
import './PartnerSpaceScreen.css';


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

function feedbackDoneStorageKey(partnerId, sessionLabel) {
  return `pairup-feedback-done-${partnerId}-${sessionLabel}`;
}

function PartnerSpaceScreen({
  partner,
  onBack,
  onDisconnect,
  availabilitySlots = DEFAULT_SCHEDULE_AVAILABILITY_SLOTS,
  nowMs = Date.now(),
}) {
  const demo = useMemo(() => getPartnerSpaceDemo(partner.id), [partner.id]);
  const dialogTitleId = useId();
  const referenceDate = useMemo(() => new Date(nowMs), [nowMs]);

  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [localProposalSent, setLocalProposalSent] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  const feedbackKey = demo.postSessionFeedback
    ? feedbackDoneStorageKey(partner.id, demo.postSessionFeedback.sessionLabel)
    : null;
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
    const key = storageFirstVisitKey(partner.id);
    const isFirstVisit = !sessionStorage.getItem(key);

    const base = demo.messages.map((m) => ({
      id: m.id,
      kind: m.author === 'me' ? 'me' : 'them',
      body: m.body,
      at: m.at,
    }));

    if (isFirstVisit) {
      sessionStorage.setItem(key, '1');
      const intro = {
        id: `sys-intro-${partner.id}`,
        kind: 'system',
        body: buildSystemIntro(partner, demo.introTimeline),
        at: Date.now(),
      };
      setMessages([intro, ...base]);
      setDraft(demo.icebreaker);
    } else {
      setMessages(base);
      setDraft('');
    }

    setHydrated(true);
  }, [partner, demo]);

  useEffect(() => {
    if (!hydrated) return;
    const el = endRef.current;
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, hydrated, feedbackDone, fbStep]);

  const showFeedback = demo.postSessionFeedback && !feedbackDone;

  const showOutgoingBanner = demo.outgoingProposalWaiting || localProposalSent;

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: `local-${Date.now()}`, kind: 'me', body: text, at: nowMs },
    ]);
    setDraft('');
  };

  const firstName = partner.name.split(' ')[0] ?? partner.name;

  return (
    <>
      <div className="partner-space app-shell">
        <div className="partner-space__card app-shell__card app-shell__card--fill">
      <header className="partner-space__top">
        <button type="button" className="partner-space__back" onClick={onBack} aria-label="Back to partners">
          ‹
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

      {demo.incomingProposal && (
        <section className="partner-space__proposal-in" aria-label="Incoming session proposal">
          <p className="partner-space__proposal-in-kicker">Session proposal</p>
          <p className="partner-space__proposal-in-title">
            {demo.incomingProposal.proposerName} proposed a session
          </p>
          <p className="partner-space__proposal-in-meta">
            {demo.incomingProposal.sessionType} · {demo.incomingProposal.level}
          </p>
          <div className="partner-space__proposal-slots">
            {demo.incomingProposal.slots.map((s) => (
              <button
                key={s.id}
                type="button"
                className="partner-space__proposal-slot"
                onClick={() => {
                  /* Wire to API */
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
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

      {showFeedback && demo.postSessionFeedback && (
        <div className="partner-space__feedback" role="region" aria-label="Session feedback">
          <div className="partner-space__feedback-head">
            <p className="partner-space__feedback-kicker">Session feedback</p>
            <p className="partner-space__feedback-meta-right">{demo.postSessionFeedback.sessionLabel}</p>
          </div>

          {fbStep === 1 && !q1AckVisible && (
            <>
              <p className="partner-space__feedback-q">
                Did {demo.postSessionFeedback.partnerFirstName} show up to the session?
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
        onSendProposal={(payload) => {
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
        }}
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
