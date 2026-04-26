import { useMemo } from 'react';
import { formatRelativeAgo } from '../utils/relativeTime';
import BottomNav from './button/BottomNav';
import './PartnersList.css';

function PartnersList({ partners, onOpenPartner, onGoToMatches, nowMs = Date.now() }) {
  const sorted = useMemo(
    () => [...partners].sort((a, b) => b.lastActivityAt - a.lastActivityAt),
    [partners],
  );

  const count = sorted.length;

  if (count === 0) {
    return (
      <div className="partners-list partners-list--empty">
        <header className="partners-list__header">
          <h1 className="partners-list__title">Partners</h1>
        </header>
        <div className="partners-list__empty-inner">
          <h2 className="partners-list__empty-title">No active partnerships yet</h2>
          <p className="partners-list__empty-copy">
            Accept a match to start a prep partnership — you&apos;ll manage every ongoing relationship
            from here.
          </p>
          {typeof onGoToMatches === 'function' && (
            <button type="button" className="partners-list__empty-cta" onClick={onGoToMatches}>
              Go to Matches
            </button>
          )}
        </div>
        <BottomNav active="partner" />
      </div>
    );
  }

  return (
    <div className="partners-list">
      <header className="partners-list__header">
        <h1 className="partners-list__title">Partners</h1>
        <p className="partners-list__sub">
          {count} active prep partnership{count === 1 ? '' : 's'}
        </p>
      </header>

      <ul className="partners-list__ul">
        {sorted.map((p) => (
          <li key={p.id} className="partners-list__li">
            <button
              type="button"
              className="partners-list__card"
              onClick={() => onOpenPartner(p.id)}
              aria-label={`Open partner space with ${p.name}`}
            >
              <div className="partners-list__row">
                <span className="partners-list__avatar" aria-hidden="true">
                  {p.initials}
                </span>
                <div className="partners-list__body">
                  <div className="partners-list__headline">
                    <div className="partners-list__name-block">
                      <span className="partners-list__name">{p.name}</span>
                      <span className="partners-list__badge">{p.backgroundLabel}</span>
                    </div>
                    <time
                      className="partners-list__time"
                      dateTime={new Date(p.lastActivityAt).toISOString()}
                    >
                      {formatRelativeAgo(p.lastActivityAt, nowMs)}
                    </time>
                  </div>
                  <div className="partners-list__tags">
                    {p.practiceTags.map((tag) => (
                      <span key={tag} className="partners-list__tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                  {p.upcomingSession && (
                    <div className="partners-list__session-pill">
                      <span className="partners-list__session-date">{p.upcomingSession.dateLabel}</span>
                      <span className="partners-list__session-sep" aria-hidden="true">
                        ·
                      </span>
                      <span className="partners-list__session-type">{p.upcomingSession.sessionType}</span>
                    </div>
                  )}
                  <p className="partners-list__preview">{p.lastMessagePreview}</p>
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>
      <BottomNav active="partner" />
    </div>
  );
}

export default PartnersList;
