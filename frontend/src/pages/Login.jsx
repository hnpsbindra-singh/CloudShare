import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authAPI, userAPI } from '../api';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '', remember: true });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleFieldChange = (field, value) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(form.username)) errs.username = 'Please enter a valid email address';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const res = await authAPI.login({
        username: form.username.trim(),
        password: form.password,
      });

      const token = typeof res.data === 'string' ? res.data : res.data.token || res.data.jwt;
      localStorage.setItem('token', token);

      const profile = await userAPI.getProfile();
      login(token, profile.data);

      toast.success('Welcome back!');
      navigate('/drive');
    } catch (err) {
      const msg = err.response?.data;
      toast.error(typeof msg === 'string' ? msg : msg?.message || 'Invalid email or password');
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

        <div className="auth-header" style={{ textAlign: 'center' }}>
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Sign in to access your CloudShare Drive</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="email-input">Email address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                id="email-input"
                type="email"
                className={`form-input ${errors.username ? 'error' : ''}`}
                placeholder="name@company.com"
                value={form.username}
                onChange={(e) => handleFieldChange('username', e.target.value)}
                autoComplete="email"
                autoFocus
              />
            </div>
            {errors.username && <span className="form-error"><AlertCircle size={12} /> {errors.username}</span>}
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="form-label" htmlFor="password-input" style={{ marginBottom: 0 }}>Password</label>
              <Link to="/forgot-password" className="auth-forgot-link">Forgot password?</Link>
            </div>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => handleFieldChange('password', e.target.value)}
                autoComplete="current-password"
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
            {errors.password && <span className="form-error"><AlertCircle size={12} /> {errors.password}</span>}
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.remember}
                onChange={(e) => setForm({ ...form, remember: e.target.checked })}
              />
              <span>Keep me signed in</span>
            </label>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading} id="login-submit-btn">
            {loading ? <span className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} /> : <>Sign in <ArrowRight size={18} /></>}
          </button>
        </form>

        <div className="auth-footer-note">
          Don't have an account? <Link to="/register">Create free account</Link>
        </div>
      </div>
    </div>
  );
}
