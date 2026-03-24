import { useMemo, useState } from 'react';
import './OnboardingStepAvailability.css';

const DAYS = [
  { id: 'mon', label: 'Mon' },
  { id: 'tue', label: 'Tue' },
  { id: 'wed', label: 'Wed' },
  { id: 'thu', label: 'Thu' },
  { id: 'fri', label: 'Fri' },
  { id: 'sat', label: 'Sat' },
  { id: 'sun', label: 'Sun' },
];

/** Stored payload uses band keys only: am | pm | evening */
const BANDS = [
  { id: 'am', short: 'AM' },
  { id: 'pm', short: 'PM' },
  { id: 'evening', short: 'Eve' },
];

const TZ_KEYS = ['ET', 'CT', 'MT', 'PT'];

const ET_BAND_HOURS = {
  am: [8, 12],
  pm: [12, 17],
  evening: [17, 22],
};

const TZ_OFFSET_FROM_ET = { ET: 0, CT: -1, MT: -2, PT: -3 };

function normalizeHour(h) {
  return ((h % 24) + 24) % 24;
}

/** Map 0–23 to short 12h-style labels used in headers (8–12, 12–5, 5–10). */
function toClockLabel(h) {
  const x = normalizeHour(h);
  if (x === 0) return '12';
  if (x <= 12) return String(x);
  return String(x - 12);
}

function bandHeaderLabel(bandId, tz) {
  const off = TZ_OFFSET_FROM_ET[tz];
  const [a, b] = ET_BAND_HOURS[bandId].map((h) => h + off);
  const band = BANDS.find((x) => x.id === bandId);
  return `${band.short} (${toClockLabel(a)}–${toClockLabel(b)} ${tz})`;
}

const IANA_TO_US = {
  'America/New_York': 'ET',
  'America/Detroit': 'ET',
  'America/Toronto': 'ET',
  'America/Chicago': 'CT',
  'America/Winnipeg': 'CT',
  'America/Denver': 'MT',
  'America/Phoenix': 'MT',
  'America/Los_Angeles': 'PT',
  'America/Vancouver': 'PT',
};

function detectUsTzBucket() {
  try {
    const iana = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return IANA_TO_US[iana] ?? 'ET';
  } catch {
    return 'ET';
  }
}

function getDetectedIana() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
  } catch {
    return '';
  }
}

const WHO_FIRST = [
  { id: 'interviewee_first', label: 'Go first as interviewee' },
  { id: 'interviewer_first', label: 'Go first as interviewer' },
  { id: 'no_preference', label: 'No preference' },
];

const FEEDBACK_STYLE = [
  {
    id: 'structured_notes',
    label: 'Structured written notes',
    hint: 'Summaries your match can revisit after the session',
  },
  {
    id: 'verbal_live',
    label: 'Live verbal feedback',
    hint: 'Real-time discussion during the mock',
  },
  {
    id: 'mixed',
    label: 'Mix of both',
    hint: 'Quick verbal takeaways plus a short write-up',
  },
];

function slotKey(dayId, bandId) {
  return `${dayId}-${bandId}`;
}

function OnboardingStepAvailability({ initialValues, onBack, onComplete }) {
  const detectedIana = useMemo(() => getDetectedIana(), []);
  const detectedBucket = useMemo(() => detectUsTzBucket(), []);

  const [viewTz, setViewTz] = useState(() => initialValues?.viewTz ?? detectedBucket);
  const [selected, setSelected] = useState(() => new Set(initialValues?.availabilitySlots ?? []));
  const [whoGoesFirst, setWhoGoesFirst] = useState(() => initialValues?.whoGoesFirst ?? null);
  const [feedbackStyle, setFeedbackStyle] = useState(() => initialValues?.feedbackStyle ?? null);

  const count = selected.size;
  const isComplete =
    count >= 3 && whoGoesFirst != null && feedbackStyle != null;

  const toggleCell = (key) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleBack = () => {
    onBack?.({
      viewTz,
      availabilitySlots: [...selected],
      whoGoesFirst,
      feedbackStyle,
    });
  };

  const handleSubmit = () => {
    if (!isComplete) return;
    onComplete?.({
      availabilitySlots: [...selected].sort(),
      whoGoesFirst,
      feedbackStyle,
    });
  };

  return (
    <div className="onboarding-avail">
      <div className="onboarding-avail__card">
        <header className="onboarding-avail__header">
          <button
            type="button"
            className="onboarding-avail__back"
            onClick={handleBack}
            aria-label="Back to previous step"
          >
            <span aria-hidden="true">‹</span>
          </button>
          <div className="onboarding-avail__progress-wrap">
            <div className="onboarding-avail__progress-bar" role="presentation">
              <span className="onboarding-avail__progress-segment onboarding-avail__progress-segment--active" />
              <span className="onboarding-avail__progress-segment onboarding-avail__progress-segment--active" />
              <span className="onboarding-avail__progress-segment onboarding-avail__progress-segment--active" />
            </div>
            <span className="onboarding-avail__progress-label">Step 3 of 3</span>
          </div>
        </header>

        <h1 className="onboarding-avail__title">When are you free?</h1>
        <p className="onboarding-avail__subtitle">
          We&apos;ll show your availability to potential partners.
        </p>

        <form
          className="onboarding-avail__form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <fieldset className="onboarding-avail__field onboarding-avail__fieldset">
            <legend className="onboarding-avail__legend-row">
              <span className="onboarding-avail__label">
                Weekly availability <span className="onboarding-avail__required" aria-hidden="true">*</span>
              </span>
              <span className="onboarding-avail__counter" aria-live="polite">
                {count} selected (min 3)
              </span>
            </legend>
            <p className="onboarding-avail__hint">Select at least 3 time slots.</p>

            <p className="onboarding-avail__detected">
              <span className="onboarding-avail__detected-icon" aria-hidden="true" />
              Detected: <span className="onboarding-avail__detected-id">{detectedIana || 'Unknown'}</span>
            </p>

            <div className="onboarding-avail__tz-row">
              <span className="onboarding-avail__tz-label">Timezone:</span>
              <div className="onboarding-avail__tz-toggle" role="group" aria-label="Timezone for grid labels">
                {TZ_KEYS.map((tz) => (
                  <button
                    key={tz}
                    type="button"
                    className={`onboarding-avail__tz-btn${viewTz === tz ? ' onboarding-avail__tz-btn--active' : ''}`}
                    aria-pressed={viewTz === tz}
                    onClick={() => setViewTz(tz)}
                  >
                    {tz}
                  </button>
                ))}
              </div>
              <span className="onboarding-avail__tz-yours">
                {viewTz === detectedBucket ? '(your timezone)' : ''}
              </span>
            </div>

            <div className="onboarding-avail__grid-wrap">
              <table className="onboarding-avail__grid" role="grid" aria-label="Weekly availability">
                <thead>
                  <tr>
                    <th className="onboarding-avail__corner" />
                    {BANDS.map((b) => (
                      <th key={b.id} scope="col" className="onboarding-avail__col-head">
                        {bandHeaderLabel(b.id, viewTz)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((day) => (
                    <tr key={day.id}>
                      <th scope="row" className="onboarding-avail__row-head">
                        {day.label}
                      </th>
                      {BANDS.map((band) => {
                        const key = slotKey(day.id, band.id);
                        const isOn = selected.has(key);
                        return (
                          <td key={band.id} className="onboarding-avail__cell">
                            <button
                              type="button"
                              role="checkbox"
                              aria-checked={isOn}
                              className={`onboarding-avail__slot${isOn ? ' onboarding-avail__slot--on' : ''}`}
                              onClick={() => toggleCell(key)}
                              aria-label={`${day.label} ${band.short}, ${isOn ? 'selected' : 'not selected'}`}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </fieldset>

          <div className="onboarding-avail__matches">
            <p className="onboarding-avail__matches-kicker">Shown to your matches</p>

            <fieldset className="onboarding-avail__field onboarding-avail__fieldset">
              <legend className="onboarding-avail__label">
                Who goes first <span className="onboarding-avail__required" aria-hidden="true">*</span>
              </legend>
              <p className="onboarding-avail__hint">Your preferred interview order.</p>
              <div className="onboarding-avail__pill-row" role="radiogroup" aria-label="Who goes first">
                {WHO_FIRST.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={whoGoesFirst === o.id}
                    className={`onboarding-avail__pill${whoGoesFirst === o.id ? ' onboarding-avail__pill--selected' : ''}`}
                    onClick={() => setWhoGoesFirst(o.id)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="onboarding-avail__field onboarding-avail__fieldset">
              <legend className="onboarding-avail__label">
                Feedback style <span className="onboarding-avail__required" aria-hidden="true">*</span>
              </legend>
              <p className="onboarding-avail__hint">How you prefer to give and receive feedback (shown on your profile).</p>
              <div className="onboarding-avail__pill-col" role="radiogroup" aria-label="Feedback style">
                {FEEDBACK_STYLE.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={feedbackStyle === o.id}
                    className={`onboarding-avail__pill onboarding-avail__pill--block${feedbackStyle === o.id ? ' onboarding-avail__pill--selected' : ''}`}
                    onClick={() => setFeedbackStyle(o.id)}
                  >
                    <span className="onboarding-avail__pill-title">{o.label}</span>
                    <span className="onboarding-avail__pill-sub">{o.hint}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <button
            type="submit"
            className="onboarding-avail__submit"
            disabled={!isComplete}
          >
            Find my matches
          </button>
        </form>
      </div>
    </div>
  );
}

export default OnboardingStepAvailability;
