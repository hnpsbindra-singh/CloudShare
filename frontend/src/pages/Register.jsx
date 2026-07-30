import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { useToast } from '../context/ToastContext';
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';

export default function Register() {
  const [step, setStep] = useState('register');
  const [form, setForm] = useState({ name: '', username: '', phoneNumber: '', password: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleFieldChange = (field, value) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const getPasswordStrength = (pass) => {
    if (!pass) return null;
    if (pass.length < 8) return 'weak';
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) return 'strong';
    return 'medium';
  };

  const strength = getPasswordStrength(form.password);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.username.trim()) errs.username = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(form.username)) errs.username = 'Please enter a valid email address';

    const cleanPhone = form.phoneNumber.replace(/[\s-]/g, '');
    if (!cleanPhone) errs.phoneNumber = 'Mobile number is required';
    else if (!/^[6-9]\d{9}$/.test(cleanPhone)) errs.phoneNumber = 'Must be a 10-digit Indian mobile number starting with 6-9';

    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8 || form.password.length > 15) errs.password = 'Password must be between 8 and 15 characters';
    return errs;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const cleanPhone = form.phoneNumber.replace(/[\s-]/g, '');

    setLoading(true);
    try {
      await authAPI.register({
        name: form.name.trim(),
        username: form.username.trim(),
        mobile: cleanPhone,
        phoneNumber: cleanPhone,
        password: form.password,
      });
      toast.success('Verification code sent to your email!');
      setStep('otp');
    } catch (err) {
      const msg = err.response?.data;
      let userMsg = 'Registration failed';
      if (typeof msg === 'string') {
        if (msg.includes('duplicate') || msg.includes('already exists')) {
          userMsg = 'Mobile number or email is already registered. Please sign in.';
        } else {
          userMsg = msg;
        }
      } else if (msg?.message) {
        userMsg = msg.message;
      }
      toast.error(userMsg);
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
      document.getElementById(`reg-otp-${idx + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      document.getElementById(`reg-otp-${idx - 1}`)?.focus();
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { toast.error('Please enter the complete 6-digit code'); return; }

    setLoading(true);
    try {
      await authAPI.verifyOtp({ username: form.username.trim(), otp: code });
      toast.success('Account verified! Please sign in.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data;
      let userMsg = 'Invalid verification code';
      if (typeof msg === 'string') {
        if (msg.includes('duplicate key') || msg.includes('already exists')) {
          userMsg = 'Mobile number or email is already registered. Please sign in.';
        } else {
          userMsg = msg;
        }
      } else if (msg?.message) {
        if (msg.message.includes('duplicate key') || msg.message.includes('already exists')) {
          userMsg = 'Mobile number or email is already registered. Please sign in.';
        } else {
          userMsg = msg.message;
        }
      }
      toast.error(userMsg);
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

        {step === 'register' ? (
          <>
            <div className="auth-header" style={{ textAlign: 'center' }}>
              <h2 className="auth-title">Create your account</h2>
              <p className="auth-subtitle">Get 1 GB free storage in under 60 seconds</p>
            </div>

            <form onSubmit={handleRegisterSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="name-input">Full Name</label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input
                    id="name-input"
                    type="text"
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    autoFocus
                  />
                </div>
                {errors.name && <span className="form-error"><AlertCircle size={12} /> {errors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-email-input">Email Address</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input
                    id="reg-email-input"
                    type="email"
                    className={`form-input ${errors.username ? 'error' : ''}`}
                    placeholder="name@company.com"
                    value={form.username}
                    onChange={(e) => handleFieldChange('username', e.target.value)}
                  />
                </div>
                {errors.username && <span className="form-error"><AlertCircle size={12} /> {errors.username}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="phone-input">Mobile Number (10 digits)</label>
                <div className="input-with-icon">
                  <Phone size={18} className="input-icon" />
                  <input
                    id="phone-input"
                    type="tel"
                    maxLength={10}
                    className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
                    placeholder="9876543210"
                    value={form.phoneNumber}
                    onChange={(e) => handleFieldChange('phoneNumber', e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                {errors.phoneNumber && <span className="form-error"><AlertCircle size={12} /> {errors.phoneNumber}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-password-input">Password (8-15 chars)</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="reg-password-input"
                    type={showPassword ? 'text' : 'password'}
                    maxLength={15}
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => handleFieldChange('password', e.target.value)}
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
                {errors.password ? (
                  <span className="form-error"><AlertCircle size={12} /> {errors.password}</span>
                ) : strength && (
                  <div className="password-strength-bar">
                    <div className={`password-strength-fill strength-${strength}`} />
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={loading} id="register-submit-btn" style={{ marginTop: 8 }}>
                {loading ? <span className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} /> : <>Create Account <ArrowRight size={18} /></>}
              </button>
            </form>

            <div className="auth-footer-note">
              Already have an account? <Link to="/login">Sign in</Link>
            </div>
          </>
        ) : (
          <>
            <div className="auth-header" style={{ textAlign: 'center' }}>
              <h2 className="auth-title">Verify your email</h2>
              <p className="auth-subtitle">Enter the 6-digit code sent to <strong>{form.username}</strong></p>
            </div>

            <form onSubmit={handleVerifySubmit} noValidate>
              <div className="otp-inputs">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`reg-otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="otp-box"
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    onKeyDown={(e) => handleOtpKeyDown(e, i)}
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={loading} id="verify-submit-btn">
                {loading ? <span className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} /> : 'Verify & Continue'}
              </button>
            </form>

            <div className="auth-footer-note">
              Didn't receive code? <button className="btn-ghost-link" onClick={() => setStep('register')}>Re-enter email</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
