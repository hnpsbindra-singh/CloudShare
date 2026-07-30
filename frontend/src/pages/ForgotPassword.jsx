import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { useToast } from '../context/ToastContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!username.trim()) { toast.error('Please enter your email address'); return; }

    setLoading(true);
    try {
      await authAPI.sendOtp(username.trim());
      toast.success('Reset code sent to your email');
      setStep(2);
    } catch (err) {
      const msg = err.response?.data;
      toast.error(typeof msg === 'string' ? msg : msg?.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) {
      document.getElementById(`forgot-otp-${idx + 1}`)?.focus();
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { toast.error('Please enter the 6-digit code'); return; }
    if (!newPassword || newPassword.length < 8) { toast.error('New password must be at least 8 characters'); return; }

    setLoading(true);
    try {
      await authAPI.resetPassword({
        username: username.trim(),
        otp: code,
        newPassword,
      });
      toast.success('Password reset successfully! Please sign in.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data;
      toast.error(typeof msg === 'string' ? msg : msg?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo" style={{ justifyContent: 'center' }}>
          <Link to="/" className="sidebar-logo" style={{ padding: 0 }}>
            <span className="sidebar-logo-text" style={{ fontSize: 26 }}>Cloud<span>Share</span></span>
          </Link>
        </div>

        <Link to="/login" className="back-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20, color: 'var(--color-text-secondary)', fontSize: 13, textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Back to Sign in
        </Link>

        {step === 1 ? (
          <>
            <div className="auth-header" style={{ textAlign: 'center' }}>
              <h2 className="auth-title">Reset password</h2>
              <p className="auth-subtitle">Enter your email to receive a 6-digit passcode</p>
            </div>

            <form onSubmit={handleSendOtp} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="forgot-email">Email Address</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input
                    id="forgot-email"
                    type="email"
                    className="form-input"
                    placeholder="name@company.com"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={loading} id="send-otp-btn">
                {loading ? <span className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} /> : <>Send Reset Code <ArrowRight size={18} /></>}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="auth-header" style={{ textAlign: 'center' }}>
              <h2 className="auth-title">Set new password</h2>
              <p className="auth-subtitle">Enter the code sent to <strong>{username}</strong></p>
            </div>

            <form onSubmit={handleResetSubmit} noValidate>
              <div className="form-group">
                <label className="form-label">6-Digit Passcode</label>
                <div className="otp-inputs">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`forgot-otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="otp-box"
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, i)}
                      autoFocus={i === 0}
                    />
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="new-pass-input">New Password (8+ chars)</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="new-pass-input"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword((s) => !s)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={loading} id="reset-confirm-btn">
                {loading ? <span className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} /> : 'Reset Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
