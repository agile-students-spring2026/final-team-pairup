import { useNavigate } from 'react-router-dom';
import './BottomNav.css';

function BottomNav({ active = 'discover' }) {
  const navigate = useNavigate();

  const items = [
    { key: 'discover', label: 'Discover', path: '/discover', icon: '◉' },
    { key: 'matches', label: 'Matches', path: '/matches', icon: '▢' },
    { key: 'partner', label: 'Partner', path: '/partners', icon: '◎' },
    { key: 'profile', label: 'Profile', path: '/profile/me', icon: '○' },
  ];

  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <button
          key={item.key}
          className={`bottom-nav__item ${active === item.key ? 'bottom-nav__item--active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <div className="bottom-nav__icon">{item.icon}</div>
          <div className="bottom-nav__label">{item.label}</div>
        </button>
      ))}
    </nav>
  );
}

export default BottomNav;