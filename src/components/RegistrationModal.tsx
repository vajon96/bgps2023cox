import React, { useState } from 'react';
import {
  AlertCircle,
  Award,
  BookOpen,
  Camera,
  CheckCircle,
  Copy,
  GraduationCap,
  Key,
  Lock,
  Sparkles,
  Upload,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { safeFetchJson } from '../lib/api.ts';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onSwitchToLogin,
}) => {
  const { refreshProfile } = useAuth();

  // Simple 4-Field Form State
  const [fullName, setFullName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [groupStream, setGroupStream] = useState('Science');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Generated Credentials State for Success Screen
  const [createdCredentials, setCreatedCredentials] = useState<{
    memberId: string;
    username: string;
    temporaryPassword: string;
  } | null>(null);

  const [copiedInfo, setCopiedInfo] = useState(false);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Profile photo size exceeds 5 MB. Please choose an optimized photo.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePhotoUrl(reader.result as string);
      setErrorMessage('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!rollNumber.trim()) {
      setErrorMessage('Please enter your school roll number.');
      return;
    }
    if (!groupStream.trim()) {
      setErrorMessage('Please select your group.');
      return;
    }
    if (!profilePhotoUrl.trim()) {
      setErrorMessage('Please upload a profile photo.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const data = await safeFetchJson<{
        memberId: string;
        username: string;
        temporaryPassword: string;
        token?: string;
      }>('/api/auth/register-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          rollNumber: rollNumber.trim(),
          groupStream: groupStream.trim(),
          profilePhotoUrl,
        }),
      });

      setIsSubmitting(false);

      // Store credentials to display on the success screen
      setCreatedCredentials({
        memberId: data.memberId,
        username: data.username,
        temporaryPassword: data.temporaryPassword,
      });

      if (data.token) {
        localStorage.setItem('bgps_auth_token', data.token);
      }
      await refreshProfile();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Network error occurred. Please try again.');
    }
  };

  const copyLoginInfo = () => {
    if (!createdCredentials) return;
    const textToCopy = `BGPS SSC 2023 Digital Memory Book Credentials:\nUsername: ${createdCredentials.username}\nTemporary Password: ${createdCredentials.temporaryPassword}\nMember ID: ${createdCredentials.memberId}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedInfo(true);
    setTimeout(() => setCopiedInfo(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#002147] via-[#001733] to-[#002147] px-6 py-5 text-white flex items-center justify-between border-b border-[#C5A059]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C5A059] text-[#002147] font-bold flex items-center justify-center shadow-md">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white font-serif">
                Join Our Batch Memory
              </h3>
              <p className="text-xs text-[#C5A059] font-medium">
                Border Guard Public School, Cox's Bazar — SSC 2023
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {createdCredentials ? (
            /* --- SUCCESS SCREEN (AUTOMATIC CREDENTIALS DISPLAY) --- */
            <div className="py-4 text-center space-y-5">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-md border border-emerald-200">
                <CheckCircle className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-[#002147] font-serif">
                  Welcome to BGPS SSC 2023!
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Your batch memory profile has been created successfully.
                </p>
              </div>

              {/* Credentials Card */}
              <div className="bg-[#F8FAFC] border-2 border-[#C5A059]/40 rounded-2xl p-5 text-left space-y-3 shadow-inner max-w-sm mx-auto">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Member ID
                  </span>
                  <span className="font-mono font-extrabold text-sm text-[#002147]">
                    {createdCredentials.memberId}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Generated Username
                  </span>
                  <span className="font-mono font-bold text-sm text-[#002147] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {createdCredentials.username}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Temporary Password
                  </span>
                  <span className="font-mono font-bold text-sm text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {createdCredentials.temporaryPassword}
                  </span>
                </div>
              </div>

              {/* Important notice */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed max-w-sm mx-auto flex items-start gap-2 text-left">
                <Key className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>IMPORTANT:</strong> Please save your username and temporary password safely. You will use these credentials to log in. You can also set a personal password after logging in.
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-semibold">
                Status: 🟡 Pending Admin Verification
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={copyLoginInfo}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#002147] hover:bg-[#001733] text-[#C5A059] font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedInfo ? 'Credentials Copied!' : 'Copy Login Information'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSwitchToLogin();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-[#C5A059] to-[#DFBF7D] text-[#002147] font-bold text-xs rounded-xl shadow hover:brightness-105 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Go to Login</span>
                </button>
              </div>
            </div>
          ) : (
            /* --- SIMPLE REGISTRATION FORM (4 FIELDS ONLY) --- */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center pb-2">
                <p className="text-xs text-slate-500">
                  Preserve your school memory and be part of our digital classmate yearbook.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 1. Full Name */}
              <div>
                <label className="block text-xs font-bold text-[#002147] mb-1">
                  Full Name (as per School Records) *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sajon Dey"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#002147]"
                  />
                </div>
              </div>

              {/* 2. School Roll Number & 3. Group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#002147] mb-1">
                    School Roll Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1234"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#002147]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#002147] mb-1">
                    Group / Department *
                  </label>
                  <select
                    value={groupStream}
                    onChange={(e) => setGroupStream(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#002147]"
                  >
                    <option value="Science">Science</option>
                    <option value="Humanities">Humanities</option>
                    <option value="Business Studies">Business Studies</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* 4. Profile Photo */}
              <div>
                <label className="block text-xs font-bold text-[#002147] mb-1">
                  Profile Photo *
                </label>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  {profilePhotoUrl ? (
                    <div className="relative group shrink-0">
                      <img
                        src={profilePhotoUrl}
                        alt="Preview"
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-[#C5A059] shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setProfilePhotoUrl('')}
                        className="absolute -top-1 -right-1 p-1 bg-red-600 text-white rounded-full shadow"
                        title="Remove Photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-slate-200 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                      <Camera className="w-7 h-7" />
                    </div>
                  )}

                  <div className="space-y-1.5 flex-1">
                    <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#002147] hover:bg-[#001733] text-[#C5A059] font-bold text-xs rounded-xl cursor-pointer shadow transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Profile Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Upload one clear photo for your yearbook profile. (JPG, PNG, WebP &lt; 5MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Automated Credentials Notice */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Automatic Credentials:</strong> The system will automatically create your unique username and a secure temporary password after you click Join.
                </span>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-[#C5A059] to-[#DFBF7D] text-[#002147] font-extrabold text-sm rounded-xl shadow-lg hover:brightness-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Award className="w-4 h-4" />
                  <span>{isSubmitting ? 'Generating Your Profile...' : 'Join Our Batch Memory'}</span>
                </button>
              </div>

              <div className="text-center text-xs text-slate-500 pt-1">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSwitchToLogin();
                  }}
                  className="text-[#002147] font-bold hover:underline"
                >
                  Sign In with Username
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
