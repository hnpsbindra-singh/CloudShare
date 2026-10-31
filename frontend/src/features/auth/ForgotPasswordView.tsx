import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Cloud, KeyRound, Lock, Mail } from 'lucide-react';
import { authApi } from '../../api/auth.api';
import { getApiErrorMessage } from '../../config/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const ForgotPasswordView: React.FC = () => {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const navigate = useNavigate();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      await authApi.sendResetOtp(username);
      setInfoMessage(`A password reset code has been sent to ${username}.`);
      setStep('reset');
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (newPassword.length < 8 || newPassword.length > 15) {
      setErrorMessage('New password must be between 8 and 15 characters.');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.verifyResetPassword({ username, otp, newPassword });
      navigate('/login');
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface-50 dark:bg-surface-950">
      <div className="w-full max-w-md bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-xl p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-lg shadow-brand-500/20 mb-2">
            <Cloud className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-50">
            Reset Password
          </h2>
          <p className="text-xs text-surface-500 dark:text-surface-400">
            {step === 'request'
              ? 'Enter your registered email address to receive a verification OTP'
              : infoMessage}
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 font-medium">
            {errorMessage}
          </div>
        )}

        {step === 'request' ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <Input
              label="Registered Email Address"
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="you@company.com"
              required
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
              Send Reset Code
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <Input
              label="6-Digit Reset Code"
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.trim())}
              placeholder="123456"
              required
              className="text-center tracking-widest font-mono text-lg font-bold"
              leftIcon={<KeyRound className="w-4 h-4" />}
            />

            <Input
              label="New Password (8-15 characters)"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={isLoading}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Update Password
            </Button>
          </form>
        )}

        <div className="pt-4 border-t border-surface-100 dark:border-surface-800 text-center">
          <Link
            to="/login"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            ← Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
