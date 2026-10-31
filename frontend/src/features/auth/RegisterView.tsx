import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, Cloud, KeyRound, Lock, Mail, Phone, RotateCw, User } from 'lucide-react';
import { authApi } from '../../api/auth.api';
import { getApiErrorMessage } from '../../config/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const RegisterView: React.FC = () => {
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const navigate = useNavigate();

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Client-side validations matching backend constraints
    if (password.length < 8 || password.length > 15) {
      setErrorMessage('Password must be between 8 and 15 characters.');
      return;
    }
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobile)) {
      setErrorMessage('Please enter a valid 10-digit mobile number starting with 6-9.');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.register({ name, username, password, mobile });
      setInfoMessage(`Verification code dispatched to ${username}.`);
      setStep('otp');
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setErrorMessage('');
    try {
      await authApi.register({ name, username, password, mobile });
      setInfoMessage(`A fresh verification code was sent to ${username}.`);
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err));
    } finally {
      setIsResending(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setErrorMessage('Please enter the 6-digit OTP code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      await authApi.verifyOtp({ username, otp });
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface-50 dark:bg-surface-950">
      <div className="w-full max-w-md bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-xl p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-lg shadow-brand-500/20 mb-2">
            <Cloud className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-50">
            {step === 'form' ? 'Create your account' : 'Verify your email'}
          </h2>
          <p className="text-xs text-surface-500 dark:text-surface-400">
            {step === 'form'
              ? 'Get 1 GB free secure cloud storage and multimodal AI analysis'
              : infoMessage}
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 font-medium">
            {errorMessage}
          </div>
        )}

        {step === 'form' ? (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Morgan"
              required
              leftIcon={<User className="w-4 h-4" />}
            />

            <Input
              label="Email Address"
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="alex@company.com"
              required
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Mobile Number (10 digits)"
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="9876543210"
              required
              helperText="Must start with 6, 7, 8, or 9"
              leftIcon={<Phone className="w-4 h-4" />}
            />

            <Input
              label="Password (8-15 characters)"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
              Continue to Verification
            </Button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="p-3 rounded-xl bg-brand-50/60 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-900/40 flex items-start space-x-2.5 text-xs text-brand-700 dark:text-brand-300">
              <Clock className="w-4 h-4 flex-shrink-0 mt-0.5 text-brand-500" />
              <span>Dispatched via message queue. The OTP is valid for 5 minutes. Check your inbox or spam.</span>
            </div>

            <Input
              label="6-Digit Verification Code"
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.trim())}
              placeholder="123456"
              required
              className="text-center tracking-widest font-mono text-lg font-bold"
              leftIcon={<KeyRound className="w-4 h-4" />}
            />

            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={isLoading}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Verify & Activate Account
            </Button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 font-medium"
              >
                ← Edit details
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResending}
                className="inline-flex items-center space-x-1 text-brand-600 dark:text-brand-400 hover:underline font-semibold disabled:opacity-50"
              >
                <RotateCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
                <span>Resend Code</span>
              </button>
            </div>
          </form>
        )}

        <div className="pt-4 border-t border-surface-100 dark:border-surface-800 text-center">
          <p className="text-xs text-surface-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
