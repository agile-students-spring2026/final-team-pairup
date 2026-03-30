import { useEffect } from 'react';
import './AcceptCelebration.css';

/**
 * Full-screen overlay shown after a user accepts a match invite.
 * CSS-only animation — no external animation libraries.
 *
 * Props:
 *   partnerName {string} — display name of the accepted partner
 *   onDone      {function} — called after the animation completes (~2.2s)
 */
function AcceptCelebration({ partnerName, onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2200);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="celebration-overlay" role="status" aria-live="polite" aria-atomic="true">
      <div className="celebration-card">
        <div className="celebration-burst">
          {[...Array(8)].map((_, i) => (
            <span
              key={i}
              className={`celebration-dot celebration-dot--${i + 1}`}
              aria-hidden="true"
            />
          ))}
          <div className="celebration-check" aria-hidden="true">✓</div>
        </div>
        <p className="celebration-title">It&apos;s a match!</p>
        <p className="celebration-subtitle">
          You and <strong>{partnerName}</strong> are now prep partners.
        </p>
      </div>
    </div>
  );
}

export default AcceptCelebration;
