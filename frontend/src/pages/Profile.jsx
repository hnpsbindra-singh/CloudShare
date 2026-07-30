import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userAPI } from '../api';
import { User, Mail, Phone, HardDrive, Save, ChevronRight } from 'lucide-react';
import { formatBytes } from '../utils/fileUtils';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phoneNumber: '' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [storage, setStorage] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      setFetching(true);
      try {
        const [profileRes, storageRes] = await Promise.all([
          userAPI.getProfile(),
          userAPI.getStorageUsage(),
        ]);
        const p = profileRes.data;
        setForm({
          name: p?.name || user?.name || '',
          phoneNumber: p?.phoneNumber || user?.phoneNumber || user?.mobile || '',
        });
        setStorage(storageRes.data);
      } catch {
        toast.error('Failed to load profile data');
      } finally {
        setFetching(false);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name cannot be empty'); return; }

    const cleanPhone = form.phoneNumber.replace(/[\s-]/g, '');
    if (!/^[0-9]{10}$/.test(cleanPhone)) {
      toast.error('Mobile number must be exactly 10 digits (e.g. 9876543210)');
      return;
    }

    setLoading(true);
    try {
      await userAPI.updateProfile({ name: form.name.trim(), phoneNumber: cleanPhone });
      await refreshUser();
      toast.success('Profile updated successfully');
    } catch (err) {
      const msg = err.response?.data;
      toast.error(typeof msg === 'string' ? msg : msg?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const used = storage?.storageUsed || 0;
  const limit = storage?.storageLimit || 1073741824;
  const pct = Math.min((used / limit) * 100, 100);

  const docsPct = pct * 0.45;
  const imgsPct = pct * 0.30;
  const zipsPct = pct * 0.15;
  const otherPct = Math.max(0, pct - (docsPct + imgsPct + zipsPct));

  return (
    <div className="app-layout">
      <Sidebar
        storage={storage}
        onUpload={() => navigate('/drive')}
        onNewFolder={() => navigate('/drive')}
      />

      <div className="content-area">
        <TopBar onSearch={() => navigate('/drive')} searchValue="" />

        <div className="content-header">
          <div className="breadcrumb">
            <Link to="/drive" className="breadcrumb-item">My Drive</Link>
            <ChevronRight size={18} className="breadcrumb-sep" />
            <span className="breadcrumb-item active">Manage Profile</span>
          </div>
        </div>

        <div className="content-scroll">
          <div style={{ maxWidth: 640, margin: '0 auto', paddingTop: 16 }}>
            {fetching ? (
              <div className="loading-overlay">
                <div className="spinner" />
                <span style={{ color: 'var(--color-text-secondary)' }}>Loading profile details…</span>
              </div>
            ) : (
              <>
                <div style={{
                  background: '#ffffff',
                  borderRadius: 'var(--radius-lg)',
                  padding: '32px',
                  marginBottom: 20,
                  boxShadow: 'var(--shadow-card)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 24
                }}>
                  <div className="profile-avatar-lg" style={{ width: 72, height: 72, fontSize: 28 }}>
                    {(form.name || user?.username || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                      {form.name || 'User'}
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                      {user?.username}
                    </div>
                  </div>
                </div>

                <div style={{
                  background: '#ffffff',
                  borderRadius: 'var(--radius-lg)',
                  padding: '28px',
                  marginBottom: 20,
                  boxShadow: 'var(--shadow-card)',
                  border: '1px solid var(--color-border)'
                }}>
                  <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 20, color: 'var(--color-text-primary)' }}>
                    Personal Information
                  </h2>
                  <form onSubmit={handleSave} noValidate>
                    <div className="form-group">
                      <label className="form-label" htmlFor="profile-name">
                        <User size={14} style={{ marginRight: 6, verticalAlign: 'middle', color: 'var(--color-google-blue)' }} />
                        Full Name
                      </label>
                      <input
                        id="profile-name"
                        className="form-input"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Your full name"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="profile-email">
                        <Mail size={14} style={{ marginRight: 6, verticalAlign: 'middle', color: 'var(--color-text-secondary)' }} />
                        Email Address (Read only)
                      </label>
                      <input
                        id="profile-email"
                        className="form-input"
                        value={user?.username || ''}
                        readOnly
                        style={{ background: 'var(--color-folder-bg)', cursor: 'not-allowed' }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="profile-phone">
                        <Phone size={14} style={{ marginRight: 6, verticalAlign: 'middle', color: 'var(--color-google-blue)' }} />
                        Mobile Number (10 digits)
                      </label>
                      <input
                        id="profile-phone"
                        className="form-input"
                        type="tel"
                        maxLength={10}
                        value={form.phoneNumber}
                        onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                        placeholder="9876543210"
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                      <button type="submit" className="btn btn-primary" disabled={loading} id="profile-save-btn">
                        {loading ? <span className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} /> : <><Save size={16} /> Save changes</>}
                      </button>
                    </div>
                  </form>
                </div>

                {storage && (
                  <div style={{
                    background: '#ffffff',
                    borderRadius: 'var(--radius-lg)',
                    padding: '28px',
                    boxShadow: 'var(--shadow-card)',
                    border: '1px solid var(--color-border)',
                    marginBottom: 32
                  }}>
                    <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-primary)' }}>
                      <HardDrive size={18} style={{ color: 'var(--color-google-blue)' }} /> Storage Details
                    </h2>
                    <div className="storage-bar-track" style={{ height: 8, marginBottom: 14 }}>
                      <div className="storage-bar-fill storage-fill-docs" style={{ width: `${docsPct}%` }} title="Documents & PDFs" />
                      <div className="storage-bar-fill storage-fill-imgs" style={{ width: `${imgsPct}%` }} title="Images & Media" />
                      <div className="storage-bar-fill storage-fill-zips" style={{ width: `${zipsPct}%` }} title="Archives" />
                      <div className="storage-bar-fill storage-fill-other" style={{ width: `${otherPct}%` }} title="Other files" />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>
                        <strong style={{ color: 'var(--color-text-primary)' }}>{formatBytes(used)}</strong> used
                      </span>
                      <span style={{ color: 'var(--color-text-secondary)' }}>{formatBytes(limit)} total</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 8 }}>
                      {formatBytes(limit - used)} remaining of your personal 1 GB quota
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
