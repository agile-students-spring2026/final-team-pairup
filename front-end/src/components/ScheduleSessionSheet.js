import { useEffect, useMemo, useState } from 'react';
import { buildScheduleCalendarDays, splitThisWeekNextWeek } from '../utils/scheduleCalendar';
import './ScheduleSessionSheet.css';

const INTERVIEW_TYPES = [
  { id: 'mock_interview', label: 'Mock interview' },
  { id: 'behavioral', label: 'Behavioral' },
  { id: 'system_design', label: 'System design' },
  { id: 'leetcode_pair', label: 'LeetCode pair' },
];

const LEVELS = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

const MAX_SLOTS = 3;

function ScheduleSessionSheet({
  isOpen,
  onClose,
  availabilitySlots,
  referenceDate = new Date(),
  onSendProposal,
}) {
  const [step, setStep] = useState(1);
  const [interviewType, setInterviewType] = useState(null);
  const [level, setLevel] = useState(null);
  const [expandedDateKey, setExpandedDateKey] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState(() => []);
  const [meetingLink, setMeetingLink] = useState('');

  const calendarDays = useMemo(
    () => buildScheduleCalendarDays(referenceDate, availabilitySlots, 14),
    [referenceDate, availabilitySlots],
  );

  const { thisWeek, nextWeek } = useMemo(() => splitThisWeekNextWeek(calendarDays), [calendarDays]);

  const selectedCount = selectedSlots.length;
  const step3Valid = selectedCount >= 1 && selectedCount <= MAX_SLOTS;
  const step4Valid = meetingLink.trim().length > 0;

  const resetForm = () => {
    setStep(1);
    setInterviewType(null);
    setLevel(null);
    setExpandedDateKey(null);
    setSelectedSlots([]);
    setMeetingLink('');
  };

  const resetAndClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only reset when sheet opens
  }, [isOpen]);

  const toggleSlot = (slot) => {
    setSelectedSlots((prev) => {
      const exists = prev.find((s) => s.id === slot.id);
      if (exists) {
        return prev.filter((s) => s.id !== slot.id);
      }
      if (prev.length >= MAX_SLOTS) return prev;
      return [...prev, slot];
    });
  };

  const removeChip = (id) => {
    setSelectedSlots((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSend = () => {
    if (!interviewType || !level || !step3Valid || !step4Valid) return;
    const typeLabel = INTERVIEW_TYPES.find((t) => t.id === interviewType)?.label ?? interviewType;
    const levelLabel = LEVELS.find((l) => l.id === level)?.label ?? level;
    onSendProposal?.({
      interviewType: typeLabel,
      interviewTypeId: interviewType,
      level: levelLabel,
      levelId: level,
      slots: selectedSlots.map((s) => ({ id: s.id, label: s.label })),
      meetingLink: meetingLink.trim(),
    });
    resetAndClose();
  };

  if (!isOpen) return null;

  return (
    <div className="schedule-sheet__backdrop" role="presentation" onClick={resetAndClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-sheet-title"
        className="schedule-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="schedule-sheet__head">
          <div className="schedule-sheet__progress" aria-hidden="true">
            {[1, 2, 3, 4].map((s) => (
              <span
                key={s}
                className={`schedule-sheet__seg${s <= step ? ' schedule-sheet__seg--on' : ''}`}
              />
            ))}
          </div>
          <div className="schedule-sheet__head-row">
            <h2 id="schedule-sheet-title" className="schedule-sheet__title">
              Schedule a session
            </h2>
            <button type="button" className="schedule-sheet__close" onClick={resetAndClose} aria-label="Close">
              ×
            </button>
          </div>
        </header>

        {step === 1 && (
          <div className="schedule-sheet__body">
            <p className="schedule-sheet__lead">What kind of session?</p>
            <div className="schedule-sheet__options" role="radiogroup" aria-label="Interview type">
              {INTERVIEW_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={interviewType === t.id}
                  className={`schedule-sheet__opt${interviewType === t.id ? ' schedule-sheet__opt--on' : ''}`}
                  onClick={() => setInterviewType(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="schedule-sheet__primary"
              disabled={!interviewType}
              onClick={() => setStep(2)}
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="schedule-sheet__body">
            <p className="schedule-sheet__lead">Overall level for this session</p>
            <div className="schedule-sheet__options" role="radiogroup" aria-label="Session level">
              {LEVELS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  role="radio"
                  aria-checked={level === l.id}
                  className={`schedule-sheet__opt${level === l.id ? ' schedule-sheet__opt--on' : ''}`}
                  onClick={() => setLevel(l.id)}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <div className="schedule-sheet__nav2">
              <button type="button" className="schedule-sheet__secondary" onClick={() => setStep(1)}>
                Back
              </button>
              <button type="button" className="schedule-sheet__primary" disabled={!level} onClick={() => setStep(3)}>
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="schedule-sheet__body schedule-sheet__body--scroll">
            <p className="schedule-sheet__lead schedule-sheet__lead--strong">Propose up to 3 time slots</p>
            <p className="schedule-sheet__sub">
              Tap a day to see time slots. Select up to 3 options for your partner to choose from.
            </p>
            <p className="schedule-sheet__counter" aria-live="polite">
              {selectedCount}/{MAX_SLOTS} slots selected (min 1)
            </p>

            {selectedCount > 0 && (
              <div className="schedule-sheet__chips" aria-label="Selected time slots">
                {selectedSlots.map((s) => (
                  <span key={s.id} className="schedule-sheet__chip">
                    {s.label}
                    <button
                      type="button"
                      className="schedule-sheet__chip-x"
                      aria-label={`Remove ${s.label}`}
                      onClick={() => removeChip(s.id)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <section className="schedule-sheet__week" aria-label="This week">
              <h3 className="schedule-sheet__week-label">This week</h3>
              {thisWeek.map((day) => (
                <DayRow
                  key={day.dateKey}
                  day={day}
                  expanded={expandedDateKey === day.dateKey}
                  onToggleExpand={() =>
                    setExpandedDateKey((k) => (k === day.dateKey ? null : day.dateKey))
                  }
                  selectedSlots={selectedSlots}
                  onToggleSlot={toggleSlot}
                  maxSlots={MAX_SLOTS}
                />
              ))}
            </section>

            <section className="schedule-sheet__week" aria-label="Next week">
              <h3 className="schedule-sheet__week-label">Next week</h3>
              {nextWeek.map((day) => (
                <DayRow
                  key={day.dateKey}
                  day={day}
                  expanded={expandedDateKey === day.dateKey}
                  onToggleExpand={() =>
                    setExpandedDateKey((k) => (k === day.dateKey ? null : day.dateKey))
                  }
                  selectedSlots={selectedSlots}
                  onToggleSlot={toggleSlot}
                  maxSlots={MAX_SLOTS}
                />
              ))}
            </section>

            <div className="schedule-sheet__nav2">
              <button type="button" className="schedule-sheet__secondary" onClick={() => setStep(2)}>
                Back
              </button>
              <button
                type="button"
                className="schedule-sheet__primary"
                disabled={!step3Valid}
                onClick={() => setStep(4)}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="schedule-sheet__body">
            <p className="schedule-sheet__lead schedule-sheet__lead--strong">Add a meeting link</p>
            <p className="schedule-sheet__sub">Google Meet or Zoom — your partner needs this to join.</p>
            <label className="schedule-sheet__link-label" htmlFor="schedule-meeting-link">
              Meeting link <span className="schedule-sheet__req">*</span>
            </label>
            <input
              id="schedule-meeting-link"
              className="schedule-sheet__link-input"
              type="url"
              inputMode="url"
              autoComplete="url"
              placeholder="https://meet.google.com/… or https://zoom.us/j/…"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
            />
            <div className="schedule-sheet__nav2">
              <button type="button" className="schedule-sheet__secondary" onClick={() => setStep(3)}>
                Back
              </button>
              <button
                type="button"
                className="schedule-sheet__primary schedule-sheet__primary--send"
                disabled={!step4Valid}
                onClick={handleSend}
              >
                Send proposal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DayRow({ day, expanded, onToggleExpand, selectedSlots, onToggleSlot, maxSlots }) {
  const selectedIds = new Set(selectedSlots.map((s) => s.id));

  return (
    <div className={`schedule-sheet__day-wrap${day.disabled ? ' schedule-sheet__day-wrap--disabled' : ''}`}>
      <button
        type="button"
        className="schedule-sheet__day-row"
        disabled={day.disabled}
        onClick={() => !day.disabled && onToggleExpand()}
        aria-expanded={expanded}
      >
        <span className="schedule-sheet__day-heading">{day.heading}</span>
        <span className="schedule-sheet__day-meta">
          {day.disabled ? 'No availability' : `${day.slotCount} slot${day.slotCount === 1 ? '' : 's'}`}
        </span>
      </button>
      {expanded && !day.disabled && (
        <div className="schedule-sheet__hours" role="group" aria-label={`Times for ${day.heading}`}>
          {day.hourSlots.map((slot) => {
            const isOn = selectedIds.has(slot.id);
            const atMax = selectedSlots.length >= maxSlots && !isOn;
            return (
              <button
                key={slot.id}
                type="button"
                className={`schedule-sheet__hour${isOn ? ' schedule-sheet__hour--on' : ''}`}
                disabled={atMax}
                aria-pressed={isOn}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSlot(slot);
                }}
              >
                {slot.label.split(' · ')[1] ?? slot.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ScheduleSessionSheet;
