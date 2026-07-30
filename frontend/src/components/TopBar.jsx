import { useState, useRef, useEffect } from 'react';
import { Search, LogOut, User, Menu, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function TopBar({ onSearch, searchValue, onMenuClick }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const menuRef = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const pwaHandler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', pwaHandler);
    return () => window.removeEventListener('beforeinstallprompt', pwaHandler);
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const initial = (user?.name || user?.username || 'U')[0].toUpperCase();

  const handleLogout = (e) => {
    if (e) e.stopPropagation();
    setMenuOpen(false);
    logout();
  };

  return (
    <header className="topbar">
      {onMenuClick && (
        <button
          className="btn-icon mobile-menu-toggle"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>
      )}

      <div className="search-bar">
        <span className="search-icon">
          <Search size={20} />
        </span>
        <input
          type="search"
          className="search-input"
          placeholder="Search in Drive"
          value={searchValue}
          onChange={(e) => onSearch(e.target.value)}
          id="drive-search"
          aria-label="Search files and folders"
        />
      </div>

      <div className="topbar-right">
        {deferredPrompt && (
          <button
            className="btn btn-secondary btn-sm pwa-install-btn hide-on-mobile"
            onClick={handleInstallPWA}
            title="Install CloudShare PWA App"
          >
            <Download size={16} />
            <span>Install App</span>
          </button>
        )}

        <div className="relative" ref={menuRef}>
          <button
            className="avatar-btn"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Account menu"
            aria-haspopup="true"
            aria-expanded={menuOpen}
            id="avatar-btn"
          >
            {initial}
          </button>

          {menuOpen && (
            <div className="profile-dropdown">
              <Link
                to="/profile"
                className="profile-dropdown-header"
                onClick={() => setMenuOpen(false)}
                style={{ textDecoration: 'none', display: 'flex' }}
                title="Click to view profile"
              >
                <div className="profile-avatar-lg">{initial}</div>
                <div>
                  <div className="profile-info-name">{user?.name || 'User'}</div>
                  <div className="profile-info-email">{user?.username || ''}</div>
                </div>
              </Link>

              <Link
                to="/profile"
                className="profile-menu-item"
                onClick={() => setMenuOpen(false)}
                id="menu-profile"
                style={{ textDecoration: 'none' }}
              >
                <User size={16} />
                <span>Manage Profile</span>
              </Link>

              <button
                className="profile-menu-item danger"
                onClick={handleLogout}
                id="menu-logout"
              >
                <LogOut size={16} />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
