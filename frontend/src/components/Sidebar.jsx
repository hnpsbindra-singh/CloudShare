import { Link, useLocation } from 'react-router-dom';
import { Plus, HardDrive, Clock } from 'lucide-react';
import { formatBytes } from '../utils/fileUtils';

const navItems = [
  { icon: <HardDrive size={20} />, label: 'My Drive', path: '/drive' },
  { icon: <Clock size={20} />, label: 'Recent', path: '/drive/recent' },
];

export default function Sidebar({ storage, onNewFolder, onUpload, isOpen }) {
  const location = useLocation();

  const used = storage?.storageUsed || 0;
  const limit = storage?.storageLimit || 1073741824;
  const pct = Math.min((used / limit) * 100, 100);

  const docsPct = pct * 0.45;
  const imgsPct = pct * 0.30;
  const zipsPct = pct * 0.15;
  const otherPct = Math.max(0, pct - (docsPct + imgsPct + zipsPct));

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <Link to="/drive" className="sidebar-logo">
        <span className="sidebar-logo-text">Cloud<span>Share</span></span>
      </Link>

      <div style={{ position: 'relative' }}>
        <button className="btn-new" id="btn-new-menu" onClick={onUpload}>
          <Plus size={20} style={{ color: 'var(--color-google-blue)' }} />
          <span>New</span>
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path === '/drive' && location.pathname.startsWith('/drive') && !location.pathname.includes('/recent'));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-storage">
        <div className="storage-label">Storage</div>
        <div className="storage-bar-track">
          <div className="storage-bar-fill storage-fill-docs" style={{ width: `${docsPct}%` }} title="Documents & PDFs" />
          <div className="storage-bar-fill storage-fill-imgs" style={{ width: `${imgsPct}%` }} title="Images & Media" />
          <div className="storage-bar-fill storage-fill-zips" style={{ width: `${zipsPct}%` }} title="Archives" />
          <div className="storage-bar-fill storage-fill-other" style={{ width: `${otherPct}%` }} title="Other files" />
        </div>
        <div className="storage-text">
          <strong>{formatBytes(used)}</strong> of {formatBytes(limit)} used
        </div>
      </div>
    </aside>
  );
}
