import { useNavigate } from 'react-router-dom';
import './BottomNav.css';

function NavIcon({ type }) {
  if (type === 'discover') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3.5" className="bottom-nav__icon-fill" />
      </svg>
    );
  }

  if (type === 'matches') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="9.2" cy="12" r="4.4" />
        <circle cx="14.8" cy="12" r="4.4" />
        <path d="M11.3 9.6L12.7 9.6" />
        <path d="M11.3 12L12.7 12" />
        <path d="M11.3 14.4L12.7 14.4" />
      </svg>
    );
  }

  if (type === 'partner') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="9" cy="9" r="3" />
        <circle cx="15.5" cy="10" r="2.5" />
        <path d="M4.5 18C5 15.7 6.8 14.5 9 14.5C11.2 14.5 13 15.7 13.5 18" />
        <path d="M12.8 18C13.2 16.2 14.6 15.2 16.2 15.2C17.8 15.2 19.1 16.1 19.5 17.8" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8.3" r="3.2" />
      <path d="M5.5 18.5C6.3 15.7 8.6 14.3 12 14.3C15.4 14.3 17.7 15.7 18.5 18.5" />
    </svg>
  );
}

function BottomNav({ active = 'discover' }) {
  const navigate = useNavigate();

  const items = [
    { key: 'discover', label: 'Discover', path: '/discover' },
    { key: 'matches', label: 'Matches', path: '/matches' },
    { key: 'partner', label: 'Partners', path: '/partners' },
    { key: 'profile', label: 'Profile', path: '/profile/me' },
  ];

  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <button
          key={item.key}
          className={`bottom-nav__item ${active === item.key ? 'bottom-nav__item--active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <div className="bottom-nav__icon">
            <NavIcon type={item.key} />
          </div>
          <div className="bottom-nav__label">{item.label}</div>
        </button>
      ))}
    </nav>
  );
}

export default BottomNav;