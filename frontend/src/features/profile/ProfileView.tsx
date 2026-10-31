import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, HardDrive, Mail, Phone, ShieldCheck, User } from 'lucide-react';
import { userApi } from '../../api/user.api';
import { getApiErrorMessage } from '../../config/api';
import { formatBytes } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ProgressBar } from '../../components/ui/ProgressBar';

export const ProfileView: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: userApi.getProfile,
  });

  const { data: storage } = useQuery({
    queryKey: ['storageUsage'],
    queryFn: userApi.getStorageUsage,
  });

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setPhoneNumber(profile.phoneNumber || '');
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: () => userApi.updateProfile({ name, phoneNumber }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      setSuccessMessage('Profile details updated successfully.');
      setErrorMessage('');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (err) => {
      setErrorMessage(getApiErrorMessage(err));
      setSuccessMessage('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[0-9]{10}$/.test(phoneNumber)) {
      setErrorMessage('Phone number must contain exactly 10 digits.');
      return;
    }
    setErrorMessage('');
    updateMutation.mutate();
  };

  const used = storage?.storageUsed ?? 0;
  const limit = storage?.storageLimit ?? 1073741824;

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-surface-400">Loading profile data...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-100">
          Account & Preferences
        </h1>
        <p className="text-xs text-surface-500 mt-1">
          Manage your personal details and cloud storage capacity
        </p>
      </div>

      {successMessage && (
        <div className="flex items-center space-x-2 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 font-medium">
          {errorMessage}
        </div>
      )}

      {/* Account Status Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-lg">
              {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="text-base font-bold text-surface-900 dark:text-surface-100">
                {profile?.name}
              </h3>
              <p className="text-xs text-surface-400">{profile?.username}</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/50 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified User</span>
          </div>
        </div>

        {/* Storage details */}
        <div className="pt-4 border-t border-surface-100 dark:border-surface-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-surface-700 dark:text-surface-300 font-semibold">
              <HardDrive className="w-4 h-4 text-brand-600" />
              <span>Cloud Storage Usage</span>
            </div>
            <span className="font-mono text-surface-500">
              {formatBytes(used)} / {formatBytes(limit)}
            </span>
          </div>
          <ProgressBar used={used} total={limit} showLabels />
        </div>
      </div>

      {/* Update Form */}
      <div className="p-6 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm space-y-5">
        <h3 className="text-base font-bold text-surface-900 dark:text-surface-100">
          Personal Details
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address (Locked)"
            value={profile?.username || ''}
            disabled
            leftIcon={<Mail className="w-4 h-4" />}
            helperText="Your email address is your verified CloudShare identifier."
          />

          <Input
            label="Display Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            leftIcon={<User className="w-4 h-4" />}
          />

          <Input
            label="Phone Number (10 digits)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="9876543210"
            required
            maxLength={10}
            leftIcon={<Phone className="w-4 h-4" />}
            helperText="Must contain exactly 10 numeric digits."
          />

          <div className="flex justify-end pt-2">
            <Button type="submit" isLoading={updateMutation.isPending}>
              Update Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
