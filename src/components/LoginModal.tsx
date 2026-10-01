import React, { useState } from 'react';
import {
  AlertCircle,
  Award,
  CheckCircle,
  Eye,
  EyeOff,
  GraduationCap,
  Key,
  Lock,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister: () => void;
  onSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onOpenRegister,
  onSuccess,
}) => {
  const { login, changePassword, quickLoginDemo } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // First Login: Change Password Prompt
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMessage('Please enter both your username and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const res = await login(username.trim(), password);
    setIsLoading(false);

    if (res.success) {
      if (res.mustChangePassword) {
        setIsChangingPassword(true);
      } else {
        onSuccess();
        onClose();
      }
    } else {
      setErrorMessage(res.error || 'Invalid username or password.');
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const res = await changePassword(newPassword);
    setIsLoading(false);

    if (res.success) {
      setPasswordSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } else {
      setErrorMessage(res.error || 'Failed to update password');
    }
  };

  const handleDemoSwitch = async (role: 'super_admin' | 'verified_member' | 'pending_member') => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      await quickLoginDemo(role);
      setIsLoading(false);
      onSuccess();
      onClose();
    } catch (e: any) {
      setIsLoading(false);
      setErrorMessage(e.message || 'Demo login failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#002147] via-[#001733] to-[#002147] px-6 py-6 text-white text-center relative border-b border-[#C5A059]/30">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#C5A059] text-[#002147] font-bold flex items-center justify-center shadow-lg mb-2">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-xl text-white font-serif">BGPS SSC 2023</h3>
          <p className="text-xs text-[#C5A059] font-medium mt-0.5">
            Classmate Memory Portal Sign In
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isChangingPassword ? (
            /* First Login: Create New Password Screen */
            <form onSubmit={handleSetNewPassword} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 mx-auto rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Key className="w-5 h-5 text-[#C5A059]" />
                </div>
                <h4 className="font-bold text-base text-[#002147] font-serif">
                  Create a Personal Password
                </h4>
                <p className="text-xs text-slate-500">
                  You logged in with your temporary password. You can now set your own secure password.
                </p>
              </div>

              {passwordSuccess ? (
                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-semibold text-center flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Password updated! Redirecting to your profile...</span>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Min 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#002147]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Repeat new password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#002147]"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        onSuccess();
                        onClose();
                      }}
                      className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                    >
                      Skip for Now
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-2.5 px-3 bg-[#002147] hover:bg-[#001733] text-[#C5A059] font-bold text-xs rounded-xl shadow disabled:opacity-50"
                    >
                      {isLoading ? 'Saving...' : 'Set Password'}
                    </button>
                  </div>
                </>
              )}
            </form>
          ) : (
            /* Standard Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Username (or Email)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. sajondey"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#002147]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Password</label>
                  <span className="text-[11px] text-slate-400">
                    Use your generated temporary password
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#002147]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[#002147] hover:bg-[#001733] text-[#C5A059] font-bold text-sm rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Quick Demo Switcher */}
          {!isChangingPassword && (
            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Quick Test Logins</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoSwitch('super_admin')}
                  className="p-2 text-left bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs transition-colors"
                >
                  <div className="font-bold text-amber-900">Super Admin</div>
                  <div className="text-[10px] text-amber-700">Tahsin (Admin Panel)</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoSwitch('verified_member')}
                  className="p-2 text-left bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs transition-colors"
                >
                  <div className="font-bold text-emerald-900">Verified Member</div>
                  <div className="text-[10px] text-emerald-700">Dr. Nuzhat (Roll 105)</div>
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-5 text-center text-xs text-slate-500">
            Not registered yet?{' '}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenRegister();
              }}
              className="text-[#002147] font-bold hover:underline"
            >
              Join Our Batch Memory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
