import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Edit3,
  FileCheck,
  FileText,
  GraduationCap,
  Info,
  Lock,
  Mail,
  MapPin,
  Phone,
  Save,
  Shield,
  Ticket,
  Upload,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { Payment, ReunionEvent } from '../types/index.ts';
import { safeFetchJson } from '../lib/api.ts';

interface DashboardViewProps {
  onOpenPayment: (event: ReunionEvent) => void;
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenPayment,
  onNavigate,
}) => {
  const { user, profile, schoolInfo, token, refreshProfile } = useAuth();
  const [paymentsList, setPaymentsList] = useState<Payment[]>([]);
  const [eventsList, setEventsList] = useState<ReunionEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit Profile Modal
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [editSuccessMsg, setEditSuccessMsg] = useState('');
  const [editErrorMsg, setEditErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!token) return;

    // Fetch my payments
    safeFetchJson<Payment[]>('/api/payments/my-payments', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((data) => {
        if (Array.isArray(data)) setPaymentsList(data);
      })
      .catch((err) => console.warn('My payments notice:', err?.message));

    // Fetch events
    safeFetchJson<ReunionEvent[]>('/api/events')
      .then((data) => {
        if (Array.isArray(data)) setEventsList(data);
      })
      .catch((err) => console.warn('Events notice:', err?.message))
      .finally(() => setIsLoading(false));
  }, [token]);

  useEffect(() => {
    if (profile && schoolInfo) {
      setEditForm({
        fullName: profile.fullName || '',
        nickname: profile.nickname || '',
        mobileNumber: profile.mobileNumber || '',
        gender: profile.gender || '',
        dateOfBirth: profile.dateOfBirth || '',
        currentCity: profile.currentCity || '',
        currentCountry: profile.currentCountry || 'Bangladesh',
        profession: profile.profession || '',
        universityCollege: profile.universityCollege || '',
        organization: profile.organization || '',
        bio: profile.bio || '',
        profilePhotoUrl: profile.profilePhotoUrl || '',
        rollNumber: schoolInfo.rollNumber || '',
        groupStream: schoolInfo.groupStream || 'Science',
        section: schoolInfo.section || 'A',
        showPhone: profile.showPhone || false,
        showEmail: profile.showEmail || false,
        showCity: profile.showCity !== false,
        showFacebook: profile.showFacebook !== false,
        showInstagram: profile.showInstagram !== false,
        showLinkedin: profile.showLinkedin !== false,
        facebookUrl: profile.facebookUrl || '',
        instagramUrl: profile.instagramUrl || '',
        linkedinUrl: profile.linkedinUrl || '',
        whatsappNumber: profile.whatsappNumber || '',
      });
    }
  }, [profile, schoolInfo]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setEditSuccessMsg('');
    setEditErrorMsg('');

    try {
      const data = await safeFetchJson<{ message?: string }>('/api/members/my-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      setIsSaving(false);
      setEditSuccessMsg(data.message || 'Profile updated successfully!');
      await refreshProfile();
      setTimeout(() => {
        setIsEditing(false);
        setEditSuccessMsg('');
      }, 1500);
    } catch (err: any) {
      setIsSaving(false);
      setEditErrorMsg(err.message || 'Failed to update profile');
    }
  };

  if (!user || !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#002147]">Please Sign In</h2>
        <p className="text-xs text-slate-500">You must be logged in to view your batch member dashboard.</p>
        <button
          onClick={() => onNavigate('home')}
          className="px-6 py-2 bg-[#002147] text-[#C5A059] rounded-xl font-bold text-xs"
        >
          Return to Home
        </button>
      </div>
    );
  }

  // Calculate profile completion percentage
  const fieldsToCheck = [
    profile.fullName,
    schoolInfo?.rollNumber,
    schoolInfo?.groupStream,
    profile.mobileNumber,
    profile.profilePhotoUrl,
    profile.bio,
    profile.profession,
    profile.currentCity,
  ];
  const filledCount = fieldsToCheck.filter(Boolean).length;
  const completionPercentage = Math.round((filledCount / fieldsToCheck.length) * 100);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 1. WELCOME HEADER */}
      <div className="bg-gradient-to-r from-[#002147] to-[#001733] rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl border border-[#C5A059]/30">
        <div className="flex items-center gap-5">
          {profile.profilePhotoUrl ? (
            <img
              src={profile.profilePhotoUrl}
              alt={profile.fullName}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-[#C5A059] shadow-lg shrink-0"
            />
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#002147] to-[#C5A059] border-4 border-white shadow-lg flex items-center justify-center text-white text-3xl font-serif font-bold shrink-0">
              {profile.fullName.charAt(0)}
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white">
                {profile.fullName}
              </h1>
              {profile.verificationStatus === 'verified' && (
                <span title="Verified Member">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300">
              Roll: <strong className="text-white">{schoolInfo?.rollNumber}</strong> • Group: <strong className="text-white">{schoolInfo?.groupStream}</strong> (Sec {schoolInfo?.section || 'A'})
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="font-mono text-xs font-extrabold text-[#002147] bg-[#C5A059] px-2.5 py-0.5 rounded-lg shadow-xs">
                {profile.memberId}
              </span>
              <span className="text-[11px] text-slate-400">
                Border Guard Public School, Cox's Bazar
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-slate-700/60">
          <button
            onClick={() => setIsEditing(true)}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 flex items-center gap-2 transition-all"
          >
            <Edit3 className="w-4 h-4 text-[#C5A059]" />
            <span>Edit My Profile</span>
          </button>
          <div className="text-right text-[11px] text-slate-400">
            Profile Completion: <strong className="text-[#C5A059]">{completionPercentage}%</strong>
          </div>
        </div>
      </div>

      {/* 2. VERIFICATION STATUS ALERT BANNER */}
      <div>
        {profile.verificationStatus === 'verified' ? (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start gap-3 text-xs text-emerald-900 shadow-xs">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="font-bold text-sm text-emerald-800">
                Verified BGPS SSC 2023 Batch Member
              </h4>
              <p className="leading-relaxed">
                Your profile and roll credentials have been verified by the alumni committee. Your profile is live in the batch directory, and you are eligible to register for reunion events and submit payment proof.
              </p>
            </div>
          </div>
        ) : profile.verificationStatus === 'pending' ? (
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3 text-xs text-amber-900 shadow-xs">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-0.5">
              <h4 className="font-bold text-sm text-amber-800">
                Registration Status: 🟡 Pending Verification
              </h4>
              <p className="leading-relaxed">
                Your profile has been submitted and is currently waiting for administrator review. Our committee checks your roll number, section, and uploaded verification document against school registers. You will receive a notification once approved.
              </p>
            </div>
          </div>
        ) : profile.verificationStatus === 'correction_required' ? (
          <div className="p-4 bg-orange-50 border border-orange-300 rounded-2xl flex items-start gap-3 text-xs text-orange-900 shadow-xs">
            <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-orange-800">
                Correction Required: 🟠 Profile Updates Requested
              </h4>
              <p className="leading-relaxed font-semibold">
                Committee Note: "{profile.correctionNotes || 'Please check your school roll or upload a clearer verification document.'}"
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="mt-1 px-3 py-1 bg-orange-600 text-white font-bold rounded-lg text-[11px]"
              >
                Update Profile Now
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-red-50 border border-red-300 rounded-2xl flex items-start gap-3 text-xs text-red-900 shadow-xs">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="font-bold text-sm text-red-800">
                Verification Rejected: 🔴
              </h4>
              <p className="leading-relaxed">
                Reason: {profile.rejectionReason || 'Unable to confirm school registration records for SSC 2023.'}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols): Events & Payments */}
        <div className="lg:col-span-2 space-y-8">
          {/* Upcoming Events Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-[#002147]" />
                <h3 className="font-bold text-base text-[#002147] font-serif">
                  Reunion Events & Tickets
                </h3>
              </div>
              <button
                onClick={() => onNavigate('events')}
                className="text-xs font-bold text-[#002147] hover:underline"
              >
                View all events →
              </button>
            </div>

            {eventsList.slice(0, 2).map((ev) => (
              <div
                key={ev.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase">
                    {ev.eventType}
                  </span>
                  <h4 className="font-bold text-sm text-[#002147]">{ev.title}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>{ev.eventDate} ({ev.startTime || '9:00 AM'})</span>
                    <span>•</span>
                    <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span className="truncate">{ev.venue}</span>
                  </p>
                  <p className="text-xs font-semibold text-emerald-700">
                    Registration Fee: {ev.registrationFee} BDT
                  </p>
                </div>

                <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto shrink-0">
                  <button
                    onClick={() => onOpenPayment(ev)}
                    className="w-full sm:w-auto px-4 py-2 bg-[#002147] hover:bg-[#001733] text-[#C5A059] font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Submit Payment Proof</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-[#002147] font-serif">
                  My Payment Submissions
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                {paymentsList.length} submission{paymentsList.length !== 1 ? 's' : ''}
              </span>
            </div>

            {paymentsList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                <FileCheck className="w-8 h-8 text-slate-300 mx-auto" />
                <p>No payment records submitted yet.</p>
                <p className="text-[11px] text-slate-400">
                  When you register for an event, submit your bKash/Nagad/Rocket Transaction ID and screenshot here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {paymentsList.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{p.eventTitle}</h4>
                        <div className="flex items-center gap-2 text-xs font-mono text-slate-600 mt-0.5">
                          <span className="font-bold text-[#002147]">{p.paymentMethod}</span>
                          <span>•</span>
                          <span>TrxID: <strong>{p.transactionId}</strong></span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-extrabold text-sm text-emerald-700 font-mono">
                          {p.amount} BDT
                        </span>
                        <div className="mt-1">
                          {p.status === 'confirmed' ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                              🟢 Confirmed
                            </span>
                          ) : p.status === 'pending' ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                              🟡 Pending Review
                            </span>
                          ) : p.status === 'correction_required' ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-900 border border-orange-300">
                              🟠 Correction Required
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300">
                              🔴 Rejected
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {p.adminNotes && (
                      <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                        Admin Note: {p.adminNotes}
                      </p>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Sender: {p.senderNumber}</span>
                      <span>Paid: {p.paymentDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Profile Overview & School Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-[#002147] font-serif border-b pb-2 flex items-center justify-between">
              <span>BGPS School Profile</span>
              <GraduationCap className="w-4 h-4 text-[#C5A059]" />
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">School Name</span>
                <span className="font-semibold text-slate-800 text-right">
                  {schoolInfo?.schoolName}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">SSC Batch</span>
                <span className="font-bold text-slate-800">2023</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">School Roll</span>
                <span className="font-extrabold text-[#002147] font-mono">
                  {schoolInfo?.rollNumber}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Group / Stream</span>
                <span className="font-semibold text-slate-800">
                  {schoolInfo?.groupStream}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Section</span>
                <span className="font-semibold text-slate-800">
                  {schoolInfo?.section}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Profession</span>
                <span className="font-semibold text-slate-800">
                  {profile.profession || 'Not set'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Current City</span>
                <span className="font-semibold text-slate-800">
                  {profile.currentCity || 'Cox\'s Bazar'}
                </span>
              </div>
            </div>

            {profile.bio && (
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                  Bio / Message
                </span>
                <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  "{profile.bio}"
                </p>
              </div>
            )}
          </div>

          {/* Privacy Settings Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-3">
            <h3 className="font-bold text-sm text-[#002147] uppercase tracking-wider border-b pb-2 flex items-center justify-between">
              <span>Public Profile Privacy</span>
              <Lock className="w-3.5 h-3.5 text-slate-400" />
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Show Phone Number:</span>
                <span className={`font-bold ${profile.showPhone ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {profile.showPhone ? 'ON' : 'OFF (Private)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Show Email Address:</span>
                <span className={`font-bold ${profile.showEmail ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {profile.showEmail ? 'ON' : 'OFF (Private)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Show Current City:</span>
                <span className={`font-bold ${profile.showCity ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {profile.showCity ? 'ON' : 'OFF'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Verification Document:</span>
                <span className="font-bold text-emerald-700">Strictly Private (Admin only)</span>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="w-full mt-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
            >
              Adjust Privacy Toggles
            </button>
          </div>
        </div>
      </div>

      {/* 3. EDIT PROFILE MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6">
            <div className="bg-[#002147] px-6 py-4 text-white flex items-center justify-between border-b border-[#C5A059]/30">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#C5A059]" />
                <h3 className="font-bold text-base font-serif">Edit Member Profile</h3>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1.5 rounded-full text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {editSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{editSuccessMsg}</span>
                </div>
              )}
              {editErrorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span>{editErrorMsg}</span>
                </div>
              )}

              {/* Warning about protected fields */}
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Notice on Protected Information:</strong> Changing your official Full Name, Roll Number, Group, or Section will reset your status to <strong>🟡 Pending Verification</strong> requiring admin re-approval.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.fullName || ''}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#002147] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nickname</label>
                  <input
                    type="text"
                    value={editForm.nickname || ''}
                    onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#002147] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Roll Number</label>
                  <input
                    type="text"
                    required
                    value={editForm.rollNumber || ''}
                    onChange={(e) => setEditForm({ ...editForm, rollNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#002147] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Group</label>
                  <select
                    value={editForm.groupStream || 'Science'}
                    onChange={(e) => setEditForm({ ...editForm, groupStream: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#002147] focus:outline-none"
                  >
                    <option value="Science">Science</option>
                    <option value="Humanities">Humanities</option>
                    <option value="Business Studies">Business Studies</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Section</label>
                  <input
                    type="text"
                    required
                    value={editForm.section || ''}
                    onChange={(e) => setEditForm({ ...editForm, section: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#002147] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Profession</label>
                  <input
                    type="text"
                    value={editForm.profession || ''}
                    onChange={(e) => setEditForm({ ...editForm, profession: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#002147] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current City</label>
                  <input
                    type="text"
                    value={editForm.currentCity || ''}
                    onChange={(e) => setEditForm({ ...editForm, currentCity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#002147] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Short Bio</label>
                <textarea
                  rows={2}
                  value={editForm.bio || ''}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#002147] focus:outline-none"
                />
              </div>

              {/* Social Links */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-[#002147] uppercase tracking-wider block">
                  Social Links
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="url"
                    placeholder="Facebook Profile URL"
                    value={editForm.facebookUrl || ''}
                    onChange={(e) => setEditForm({ ...editForm, facebookUrl: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                  <input
                    type="url"
                    placeholder="Instagram Profile URL"
                    value={editForm.instagramUrl || ''}
                    onChange={(e) => setEditForm({ ...editForm, instagramUrl: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                  <input
                    type="url"
                    placeholder="LinkedIn Profile URL"
                    value={editForm.linkedinUrl || ''}
                    onChange={(e) => setEditForm({ ...editForm, linkedinUrl: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                  <input
                    type="tel"
                    placeholder="WhatsApp Number"
                    value={editForm.whatsappNumber || ''}
                    onChange={(e) => setEditForm({ ...editForm, whatsappNumber: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              {/* Privacy Toggles */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-[#002147] block mb-1">
                  Privacy Settings
                </span>
                <label className="flex items-center justify-between text-xs cursor-pointer">
                  <span>Show Phone Number on public profile:</span>
                  <input
                    type="checkbox"
                    checked={editForm.showPhone}
                    onChange={(e) => setEditForm({ ...editForm, showPhone: e.target.checked })}
                    className="w-4 h-4 accent-[#002147]"
                  />
                </label>
                <label className="flex items-center justify-between text-xs cursor-pointer">
                  <span>Show Email Address on public profile:</span>
                  <input
                    type="checkbox"
                    checked={editForm.showEmail}
                    onChange={(e) => setEditForm({ ...editForm, showEmail: e.target.checked })}
                    className="w-4 h-4 accent-[#002147]"
                  />
                </label>
                <label className="flex items-center justify-between text-xs cursor-pointer">
                  <span>Show Current City:</span>
                  <input
                    type="checkbox"
                    checked={editForm.showCity}
                    onChange={(e) => setEditForm({ ...editForm, showCity: e.target.checked })}
                    className="w-4 h-4 accent-[#002147]"
                  />
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-[#002147] text-[#C5A059] font-bold text-xs rounded-xl shadow hover:bg-[#001733] transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
