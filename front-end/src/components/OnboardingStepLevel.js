import { useEffect, useMemo, useRef, useState } from 'react';
import './OnboardingStepLevel.css';

const BIO_MAX = 150;

const LEVELS = [
  {
    id: 'beginner',
    title: 'Beginner',
    description: 'Primarily Easy problems / just getting started',
  },
  {
    id: 'intermediate',
    title: 'Intermediate',
    description: 'Medium problems as main focus / a few mocks done',
  },
  {
    id: 'advanced',
    title: 'Advanced',
    description: 'Hard + OA-level / want to keep sharp',
  },
];

const BACKGROUNDS = [
  { id: 'cs_undergrad', label: 'CS undergrad' },
  { id: 'cs_grad', label: 'CS grad' },
  { id: 'non_cs', label: 'Non-CS' },
  { id: 'bootcamp', label: 'Bootcamp' },
  { id: 'self_taught', label: 'Self-taught' },
];

function OnboardingStepLevel({ stepOneData, initialValues, onBack, onNext }) {
  const practiceFocus = stepOneData?.practiceFocus ?? [];

  const [level, setLevel] = useState(() => initialValues?.level ?? null);
  const [weakestArea, setWeakestArea] = useState(() => {
    const w = initialValues?.weakestArea;
    if (w && practiceFocus.includes(w)) return w;
    return null;
  });
  const [background, setBackground] = useState(() => initialValues?.background ?? null);
  const [bio, setBio] = useState(() => initialValues?.bio ?? '');
  const [linkedInUrl, setLinkedInUrl] = useState(() => initialValues?.linkedInUrl ?? '');

  const focusSignature = useMemo(
    () => [stepOneData?.role, ...(stepOneData?.practiceFocus ?? [])].join('\0'),
    [stepOneData?.role, stepOneData?.practiceFocus],
  );

  const prevFocusSig = useRef(null);
  useEffect(() => {
    if (prevFocusSig.current === null) {
      prevFocusSig.current = focusSignature;
      return;
    }
    if (prevFocusSig.current !== focusSignature) {
      prevFocusSig.current = focusSignature;
      setWeakestArea(null);
    }
  }, [focusSignature]);

  const selectWeakest = (label) => {
    setWeakestArea((prev) => (prev === label ? null : label));
  };

  const selectBackground = (id) => {
    setBackground((prev) => (prev === id ? null : id));
  };

  const onBioChange = (e) => {
    const next = e.target.value.slice(0, BIO_MAX);
    setBio(next);
  };

  const isComplete = level != null && background != null;

  const handleNext = () => {
    if (!isComplete) return;
    onNext?.({
      level,
      weakestArea,
      background,
      bio: bio.trim() || undefined,
      linkedInUrl: linkedInUrl.trim() || undefined,
    });
  };

  const handleBack = () => {
    onBack?.({
      level,
      weakestArea,
      background,
      bio,
      linkedInUrl,
    });
  };

  const weakestOptions = practiceFocus.slice().sort();

  return (
    <div className="onboarding-level">
      <div className="onboarding-level__card">
        <header className="onboarding-level__header">
          <button
            type="button"
            className="onboarding-level__back"
            onClick={handleBack}
            aria-label="Back to previous step"
          >
            <svg className="onboarding-level__back-icon" aria-hidden="true" viewBox="0 0 24 24" focusable="false">
              <path d="M15 6L9 12L15 18" />
            </svg>
          </button>
          <div className="onboarding-level__progress-wrap">
            <div className="onboarding-level__progress-bar" role="presentation">
              <span className="onboarding-level__progress-segment onboarding-level__progress-segment--active" />
              <span className="onboarding-level__progress-segment onboarding-level__progress-segment--active" />
              <span className="onboarding-level__progress-segment" />
            </div>
            <span className="onboarding-level__progress-label">Step 2 of 3</span>
          </div>
        </header>

        <h1 className="onboarding-level__title">Tell us about yourself</h1>
        <p className="onboarding-level__subtitle">
          Helps us match you with someone at the right level
        </p>

        <form
          className="onboarding-level__form"
          onSubmit={(e) => {
            e.preventDefault();
            handleNext();
          }}
        >
          <fieldset className="onboarding-level__field onboarding-level__fieldset">
            <legend className="onboarding-level__label">
              Overall level <span className="onboarding-level__required" aria-hidden="true">*</span>
            </legend>
            <p className="onboarding-level__hint">So your partner knows what to expect</p>
            <div className="onboarding-level__level-list" role="radiogroup" aria-label="Overall level">
              {LEVELS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={level === opt.id}
                  className={`onboarding-level__level-card${level === opt.id ? ' onboarding-level__level-card--selected' : ''}`}
                  onClick={() => setLevel(opt.id)}
                >
                  <span
                    className={`onboarding-level__level-radio${level === opt.id ? ' onboarding-level__level-radio--on' : ''}`}
                    aria-hidden="true"
                  />
                  <span className="onboarding-level__level-text">
                    <span className="onboarding-level__level-title">{opt.title}</span>
                    <span className="onboarding-level__level-desc">{opt.description}</span>
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          {weakestOptions.length > 0 && (
            <fieldset className="onboarding-level__field onboarding-level__fieldset">
              <legend className="onboarding-level__label">Weakest area</legend>
              <p className="onboarding-level__hint">
                Optional — where you want extra support; chips match only the practice areas you chose in
                step 1. Clears if you change role or practice focus in step 1.
              </p>
              <div className="onboarding-level__chips">
                {weakestOptions.map((label) => (
                  <button
                    key={label}
                    type="button"
                    className={`onboarding-level__chip${weakestArea === label ? ' onboarding-level__chip--selected' : ''}`}
                    aria-pressed={weakestArea === label}
                    onClick={() => selectWeakest(label)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <fieldset className="onboarding-level__field onboarding-level__fieldset">
            <legend className="onboarding-level__label">
              Background <span className="onboarding-level__required" aria-hidden="true">*</span>
            </legend>
            <p className="onboarding-level__hint">Context helps partners set expectations</p>
            <div className="onboarding-level__chips onboarding-level__chips--bg">
              {BACKGROUNDS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  className={`onboarding-level__chip${background === b.id ? ' onboarding-level__chip--selected' : ''}`}
                  aria-pressed={background === b.id}
                  onClick={() => selectBackground(b.id)}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="onboarding-level__field">
            <label className="onboarding-level__label" htmlFor="onboarding-bio">
              Bio
            </label>
            <p className="onboarding-level__hint" id="onboarding-bio-hint">
              Shown as-is to your potential partners (optional)
            </p>
            <div className="onboarding-level__textarea-wrap">
              <textarea
                id="onboarding-bio"
                className="onboarding-level__textarea"
                rows={4}
                maxLength={BIO_MAX}
                placeholder="A quick intro — e.g. 'Ex-intern at AWS, grinding LeetCode daily'"
                aria-describedby="onboarding-bio-hint onboarding-bio-count"
                value={bio}
                onChange={onBioChange}
              />
              <span id="onboarding-bio-count" className="onboarding-level__counter" aria-live="polite">
                {bio.length}/{BIO_MAX}
              </span>
            </div>
          </div>

          <div className="onboarding-level__field">
            <label className="onboarding-level__label" htmlFor="onboarding-linkedin">
              LinkedIn URL
            </label>
            <p className="onboarding-level__hint" id="onboarding-linkedin-hint">
              Shown on your profile so partners can verify experience (optional)
            </p>
            <input
              id="onboarding-linkedin"
              className="onboarding-level__input"
              type="url"
              inputMode="url"
              autoComplete="url"
              placeholder="https://www.linkedin.com/in/…"
              aria-describedby="onboarding-linkedin-hint"
              value={linkedInUrl}
              onChange={(e) => setLinkedInUrl(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="onboarding-level__next"
            disabled={!isComplete}
          >
            Next
          </button>
        </form>
      </div>
    </div>
  );
}

export default OnboardingStepLevel;
