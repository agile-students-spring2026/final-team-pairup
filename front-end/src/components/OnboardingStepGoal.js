import { useMemo, useState } from 'react';
import './OnboardingStepGoal.css';

const ROLES = [
  { id: 'sde', title: 'Software Engineer', subtitle: 'SDE' },
  { id: 'pm', title: 'Product Manager', subtitle: 'PM' },
];

const PRACTICE_BY_ROLE = {
  sde: [
    'Algorithms & data structures',
    'System design',
    'Behavioral',
    'Object-oriented design',
  ],
  pm: [
    'Product sense',
    'Execution & metrics',
    'Behavioral',
    'Strategy & roadmap',
  ],
};

const COMPANY_TIERS = [
  { id: 'faang', label: 'FAANG' },
  { id: 'mid', label: 'Mid-size tech' },
  { id: 'startup', label: 'Startup' },
  { id: 'any', label: 'Any' },
];

const TIMELINES = [
  { id: 'lt1m', label: '< 1 month' },
  { id: '1to3', label: '1–3 months' },
  { id: '3to6', label: '3–6 months' },
  { id: 'practice', label: 'Just practicing' },
];

function OnboardingStepGoal({ onNext, initialValues }) {
  const [displayName, setDisplayName] = useState(() => initialValues?.displayName ?? '');
  const [role, setRole] = useState(() => initialValues?.role ?? null);
  const [practiceFocus, setPracticeFocus] = useState(
    () => new Set(initialValues?.practiceFocus ?? []),
  );
  const [companyTier, setCompanyTier] = useState(() => initialValues?.companyTier ?? null);
  const [timeline, setTimeline] = useState(() => initialValues?.timeline ?? null);

  const practiceOptions = role ? PRACTICE_BY_ROLE[role] : [];

  const togglePractice = (label) => {
    setPracticeFocus((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const selectRole = (id) => {
    setRole(id);
    setPracticeFocus(new Set());
  };

  const selectCompanyTier = (id) => {
    setCompanyTier((prev) => (prev === id ? null : id));
  };

  const isComplete = useMemo(() => {
    const nameOk = displayName.trim().length > 0;
    const roleOk = role != null;
    const focusOk = roleOk && practiceFocus.size > 0;
    const tierOk = companyTier != null;
    const timeOk = timeline != null;
    return nameOk && roleOk && focusOk && tierOk && timeOk;
  }, [displayName, role, practiceFocus, companyTier, timeline]);

  const handleNext = () => {
    if (!isComplete) return;
    onNext?.({
      displayName: displayName.trim(),
      role,
      practiceFocus: [...practiceFocus],
      companyTier,
      timeline,
    });
  };

  return (
    <div className="onboarding-goal">
      <div className="onboarding-goal__card">
        <header className="onboarding-goal__progress" aria-label="Onboarding progress">
          <div className="onboarding-goal__progress-bar" role="presentation">
            <span className="onboarding-goal__progress-segment onboarding-goal__progress-segment--active" />
            <span className="onboarding-goal__progress-segment" />
            <span className="onboarding-goal__progress-segment" />
          </div>
          <span className="onboarding-goal__progress-label">Step 1 of 3</span>
        </header>

        <h1 className="onboarding-goal__title">What are you preparing for?</h1>
        <p className="onboarding-goal__subtitle">
          This helps us find partners with the same focus
        </p>

        <form
          className="onboarding-goal__form"
          onSubmit={(e) => {
            e.preventDefault();
            handleNext();
          }}
        >
          <div className="onboarding-goal__field">
            <label className="onboarding-goal__label" htmlFor="display-name">
              Display name <span className="onboarding-goal__required" aria-hidden="true">*</span>
            </label>
            <p className="onboarding-goal__hint" id="display-name-hint">
              Your real name — helps partners recognize you
            </p>
            <input
              id="display-name"
              className="onboarding-goal__input"
              type="text"
              autoComplete="name"
              placeholder="Your real name — helps partners recognize you"
              aria-describedby="display-name-hint"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <fieldset className="onboarding-goal__field onboarding-goal__fieldset">
            <legend className="onboarding-goal__label">
              Target role <span className="onboarding-goal__required" aria-hidden="true">*</span>
            </legend>
            <p className="onboarding-goal__hint">
              So we match you with people practicing the same interview format
            </p>
            <div className="onboarding-goal__role-grid" role="radiogroup" aria-label="Target role">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  role="radio"
                  aria-checked={role === r.id}
                  className={`onboarding-goal__role-card${role === r.id ? ' onboarding-goal__role-card--selected' : ''}`}
                  onClick={() => selectRole(r.id)}
                >
                  <span className="onboarding-goal__role-title">{r.title}</span>
                  <span className="onboarding-goal__role-sub">{r.subtitle}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {role && (
            <fieldset className="onboarding-goal__field onboarding-goal__fieldset">
              <legend className="onboarding-goal__label">
                Practice focus <span className="onboarding-goal__required" aria-hidden="true">*</span>
              </legend>
              <p className="onboarding-goal__hint">Select all areas you want to work on</p>
              <div className="onboarding-goal__chips">
                {practiceOptions.map((label) => (
                  <button
                    key={label}
                    type="button"
                    className={`onboarding-goal__chip${practiceFocus.has(label) ? ' onboarding-goal__chip--selected' : ''}`}
                    aria-pressed={practiceFocus.has(label)}
                    onClick={() => togglePractice(label)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <fieldset className="onboarding-goal__field onboarding-goal__fieldset">
            <legend className="onboarding-goal__label">
              Target company tier <span className="onboarding-goal__required" aria-hidden="true">*</span>
            </legend>
            <p className="onboarding-goal__hint">Helps us prioritize partners with similar ambitions</p>
            <div className="onboarding-goal__chips onboarding-goal__chips--tier">
              {COMPANY_TIERS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`onboarding-goal__chip${companyTier === t.id ? ' onboarding-goal__chip--selected' : ''}`}
                  aria-pressed={companyTier === t.id}
                  onClick={() => selectCompanyTier(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="onboarding-goal__field onboarding-goal__fieldset">
            <legend className="onboarding-goal__label">
              Timeline <span className="onboarding-goal__required" aria-hidden="true">*</span>
            </legend>
            <p className="onboarding-goal__hint">We&apos;ll surface people with the same urgency</p>
            <div className="onboarding-goal__chips onboarding-goal__chips--timeline">
              {TIMELINES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`onboarding-goal__chip${timeline === t.id ? ' onboarding-goal__chip--selected' : ''}`}
                  aria-pressed={timeline === t.id}
                  onClick={() => setTimeline(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </fieldset>

          <button
            type="submit"
            className="onboarding-goal__next"
            disabled={!isComplete}
          >
            Next
          </button>
        </form>
      </div>
    </div>
  );
}

export default OnboardingStepGoal;
