import { HardDrive, Clock, Plus, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function MobileBottomNav({ onUpload }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isPathActive = (path) => location.pathname === path;

  return (
    <div className="mobile-bottom-nav">
      <button
        className={`mobile-nav-item ${isPathActive('/drive') ? 'active' : ''}`}
        onClick={() => navigate('/drive')}
      >
        <HardDrive size={22} />
        <span>Drive</span>
      </button>

      <button
        className={`mobile-nav-item ${isPathActive('/drive/recent') ? 'active' : ''}`}
        onClick={() => navigate('/drive/recent')}
      >
        <Clock size={22} />
        <span>Recent</span>
      </button>

      <button
        className="mobile-nav-upload-pill"
        onClick={onUpload}
        aria-label="Upload file or folder"
      >
        <Plus size={24} />
      </button>

      <button
        className={`mobile-nav-item ${isPathActive('/profile') ? 'active' : ''}`}
        onClick={() => navigate('/profile')}
      >
        <User size={22} />
        <span>Profile</span>
      </button>
    </div>
  );
}
