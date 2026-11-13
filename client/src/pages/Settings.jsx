import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import {
  User,
  Mail,
  Globe,
  Lock,
  Shield,
  Save,
  LogOut,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const Settings = () => {
  const { user, updateUser, logout } = useAuth();
  const { showToast } = useToast();

  // Profile Form state
  const [name, setName] = useState(user?.name || '');
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileLoading(true);

    try {
      const res = await api.put('/users/profile', { name, timezone });
      if (res.data?.success) {
        updateUser(res.data.data);
        showToast('Profile information updated successfully!', 'success');
        setProfileMsg('Changes saved.');
      }
    } catch (err) {
      console.error('Update profile error:', err);
      showToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await api.put('/users/change-password', {
        currentPassword,
        newPassword,
        confirmNewPassword,
      });

      if (res.data?.success) {
        showToast('Password updated successfully!', 'success');
        setPasswordSuccess('Password changed.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (err) {
      console.error('Password change error:', err);
      setPasswordError(err.response?.data?.message || 'Failed to change password. Check current password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const commonTimezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Dubai',
    'Asia/Kolkata',
    'Asia/Singapore',
    'Asia/Tokyo',
    'Australia/Sydney',
  ];

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-200">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Account Settings</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your personal profile, preferred calendar timezone, and account security.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Profile Card */}
        <div className="bg-[#111726] border border-[#24304d] rounded-2xl p-6 sm:p-7 shadow-xl">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#24304d]/70">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Profile Details</h3>
              <p className="text-xs text-slate-400">Update your name and calendar timezone</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-[#161e31] border border-[#24304d] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
                  Email Address (Read-only)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full bg-[#0c121e] border border-[#24304d]/50 text-slate-500 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
                Timezone Preference
              </label>
              <div className="relative">
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-[#161e31] border border-[#24304d] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 pl-10 text-sm text-white focus:outline-none transition-colors appearance-none cursor-pointer"
                >
                  {!commonTimezones.includes(timezone) && (
                    <option value={timezone} className="bg-[#111726]">
                      {timezone}
                    </option>
                  )}
                  {commonTimezones.map((tz) => (
                    <option key={tz} value={tz} className="bg-[#111726]">
                      {tz}
                    </option>
                  ))}
                </select>
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Daily calorie consistency and calendar days are calculated according to this timezone.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              {profileMsg && (
                <span className="text-xs text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{profileMsg}</span>
                </span>
              )}
              <div />
              <button
                type="submit"
                disabled={profileLoading}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-950/40 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{profileLoading ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Password Card */}
        <div className="bg-[#111726] border border-[#24304d] rounded-2xl p-6 sm:p-7 shadow-xl">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#24304d]/70">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Security & Password</h3>
              <p className="text-xs text-slate-400">Ensure your CalTrack account is protected</p>
            </div>
          </div>

          {passwordError && (
            <div className="flex items-center space-x-2 p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="flex items-center space-x-2 p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#161e31] border border-[#24304d] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full bg-[#161e31] border border-[#24304d] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full bg-[#161e31] border border-[#24304d] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={passwordLoading}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#161e31] hover:bg-[#1a243a] border border-[#24304d] text-white hover:text-emerald-400 font-semibold text-xs sm:text-sm rounded-xl transition-all disabled:opacity-50"
              >
                <Shield className="w-4 h-4" />
                <span>{passwordLoading ? 'Updating...' : 'Change Password'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Session / Logout Card */}
        <div className="bg-[#111726] border border-[#24304d] rounded-2xl p-6 sm:p-7 shadow-xl flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Sign Out</h3>
            <p className="text-xs text-slate-400 mt-0.5">End your current session on this device.</p>
          </div>

          <button
            onClick={logout}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
