import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cloud, Lock, Mail } from 'lucide-react';
import { authApi } from '../../api/auth.api';
import { getApiErrorMessage } from '../../config/api';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const LoginView: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();
  const { setToken } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const token = await authApi.login({ username, password });
      setToken(token);
      navigate('/');
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
            Welcome back
          </h2>
          <p className="text-xs text-surface-500 dark:text-surface-400">
            Sign in to access your secure CloudShare asset workspace
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="you@company.com"
            required
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <div className="space-y-1">
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              leftIcon={<Lock className="w-4 h-4" />}
            />
            <div className="flex justify-end pt-1">
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        <div className="pt-4 border-t border-surface-100 dark:border-surface-800 text-center">
          <p className="text-xs text-surface-500">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
