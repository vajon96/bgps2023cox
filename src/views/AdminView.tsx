import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Archive,
  Award,
  Bell,
  Check,
  CheckCircle,
  ChevronDown,
  Clock,
  Database,
  DollarSign,
  Download,
  Edit2,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Filter,
  GraduationCap,
  Image as ImageIcon,
  Key,
  Layers,
  Lock,
  Mail,
  Megaphone,
  MoreVertical,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  Ticket,
  Trash2,
  Upload,
  UserCheck,
  UserMinus,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { Notice, Payment, ReunionEvent, SiteSettings } from '../types/index.ts';
import { safeFetchJson } from '../lib/api.ts';

export const AdminView: React.FC = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'payments' | 'events' | 'notices' | 'gallery' | 'settings' | 'users' | 'logs'>('overview');

  // Overview Stats
  const [overview, setOverview] = useState<any>(null);
  const [isLoadingOverview, setIsLoadingOverview] = useState(false);

  // Members Management State
  const [membersList, setMembersList] = useState<any[]>([]);
  const [memberFilterStatus, setMemberFilterStatus] = useState<string>('pending');
  const [memberSearch, setMemberSearch] = useState<string>('');
  const [selectedProofDoc, setSelectedProofDoc] = useState<any>(null);
  const [rejectModalMember, setRejectModalMember] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [correctionModalMember, setCorrectionModalMember] = useState<any>(null);
  const [correctionNotes, setCorrectionNotes] = useState<string>('');

  // Payments Management State
  const [paymentsList, setPaymentsList] = useState<any[]>([]);
  const [paymentFilterStatus, setPaymentFilterStatus] = useState<string>('pending');
  const [inspectScreenshot, setInspectScreenshot] = useState<any>(null);
  const [rejectModalPayment, setRejectModalPayment] = useState<any>(null);
  const [paymentRejectReason, setPaymentRejectReason] = useState<string>('');

  // Events Management State
  const [eventsList, setEventsList] = useState<ReunionEvent[]>([]);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventForm, setEventForm] = useState<any>({
    title: '',
    eventType: 'Reunion',
    eventDate: '2026-12-25',
    startTime: '09:00 AM',
    endTime: '08:00 PM',
    venue: '',
    address: "Cox's Bazar",
    description: '',
    registrationFee: 1500,
    registrationDeadline: '2026-12-15',
    organizer: 'BGPS SSC 2023 Central Reunion Committee',
    contactInfo: '+880 1819-876543',
  });

  // Notice Management State
  const [noticesList, setNoticesList] = useState<Notice[]>([]);
  const [noticeForm, setNoticeForm] = useState<any>({
    title: '',
    description: '',
    priority: 'normal',
    targetAudience: 'all',
  });
  const [isNoticeSubmitting, setIsNoticeSubmitting] = useState(false);

  // Gallery Moderation State
  const [galleryList, setGalleryList] = useState<any[]>([]);

  // Site Settings State
  const [siteSettingsForm, setSiteSettingsForm] = useState<SiteSettings>({
    schoolName: "Border Guard Public School, Cox's Bazar",
    batchYear: "SSC Batch 2023",
    tagline: "Old Memories. New Connections. One Batch.",
    aboutText: '',
    bkashNumber: '',
    nagadNumber: '',
    rocketNumber: '',
    bankInfo: '',
    paymentInstructions: '',
    contactEmail: '',
    contactPhone: '',
    facebookGroup: '',
    registrationOpen: true,
  });
  const [settingsSavedMsg, setSettingsSavedMsg] = useState('');

  // User Roles State
  const [usersList, setUsersList] = useState<any[]>([]);

  // Audit Logs State
  const [auditLogsList, setAuditLogsList] = useState<any[]>([]);

  // Action Notification Banner
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const fetchOverview = async () => {
    setIsLoadingOverview(true);
    try {
      const data = await safeFetchJson<any>('/api/admin/overview', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data) setOverview(data);
    } catch (e: any) {
      console.warn('Overview fetch notice:', e?.message);
    } finally {
      setIsLoadingOverview(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const data = await safeFetchJson<any[]>(`/api/admin/members?status=${memberFilterStatus}&search=${encodeURIComponent(memberSearch)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(data)) setMembersList(data);
    } catch (e: any) {
      console.warn('Members fetch notice:', e?.message);
    }
  };

  const fetchPayments = async () => {
    try {
      const data = await safeFetchJson<any[]>(`/api/admin/payments?status=${paymentFilterStatus}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(data)) setPaymentsList(data);
    } catch (e: any) {
      console.warn('Payments fetch notice:', e?.message);
    }
  };

  const fetchEvents = async () => {
    try {
      const data = await safeFetchJson<any[]>('/api/events');
      if (Array.isArray(data)) setEventsList(data);
    } catch (e: any) {
      console.warn('Events fetch notice:', e?.message);
    }
  };

  const fetchNotices = async () => {
    try {
      const data = await safeFetchJson<any[]>('/api/notices');
      if (Array.isArray(data)) setNoticesList(data);
    } catch (e: any) {
      console.warn('Notices fetch notice:', e?.message);
    }
  };

  const fetchGallery = async () => {
    try {
      const data = await safeFetchJson<any[]>('/api/admin/gallery', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(data)) setGalleryList(data);
    } catch (e: any) {
      console.warn('Admin gallery fetch notice:', e?.message);
    }
  };

  const fetchSettings = async () => {
    try {
      const data = await safeFetchJson<any>('/api/settings');
      if (data) setSiteSettingsForm(data);
    } catch (e: any) {
      console.warn('Settings fetch notice:', e?.message);
    }
  };

  const fetchUsers = async () => {
    if (user?.role !== 'super_admin') return;
    try {
      const data = await safeFetchJson<any[]>('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(data)) setUsersList(data);
    } catch (e: any) {
      console.warn('Admin users fetch notice:', e?.message);
    }
  };

  const fetchLogs = async () => {
    try {
      const data = await safeFetchJson<any[]>('/api/admin/audit-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(data)) setAuditLogsList(data);
    } catch (e: any) {
      console.warn('Audit logs fetch notice:', e?.message);
    }
  };

  useEffect(() => {
    if (token) {
      if (activeTab === 'overview') fetchOverview();
      if (activeTab === 'members') fetchMembers();
      if (activeTab === 'payments') fetchPayments();
      if (activeTab === 'events') fetchEvents();
      if (activeTab === 'notices') fetchNotices();
      if (activeTab === 'gallery') fetchGallery();
      if (activeTab === 'settings') fetchSettings();
      if (activeTab === 'users') fetchUsers();
      if (activeTab === 'logs') fetchLogs();
    }
  }, [activeTab, token, memberFilterStatus, paymentFilterStatus]);

  // Action: Verify / Reject Member
  const handleVerifyMember = async (profileId: number, action: string, reason?: string, notes?: string) => {
    try {
      const data = await safeFetchJson<{ message?: string }>(`/api/admin/members/${profileId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, reason, notes }),
      });

      setActionAlert({ type: 'success', msg: data.message || 'Action completed successfully' });
      setRejectModalMember(null);
      setCorrectionModalMember(null);
      setRejectReason('');
      setCorrectionNotes('');
      fetchMembers();
      fetchOverview();
    } catch (err: any) {
      setActionAlert({ type: 'error', msg: err.message || 'Failed to update member status' });
    }
  };

  // Action: Review Payment
  const handleReviewPayment = async (paymentId: number, action: string, notes?: string) => {
    try {
      const data = await safeFetchJson<{ message?: string }>(`/api/admin/payments/${paymentId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, notes }),
      });

      setActionAlert({ type: 'success', msg: data.message || 'Payment status updated' });
      setRejectModalPayment(null);
      setPaymentRejectReason('');
      fetchPayments();
      fetchOverview();
    } catch (err: any) {
      setActionAlert({ type: 'error', msg: err.message || 'Failed to review payment' });
    }
  };

  // Action: Save Event
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await safeFetchJson('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventForm),
      });

      setActionAlert({ type: 'success', msg: 'Event saved and batch members notified!' });
      setIsEventModalOpen(false);
      fetchEvents();
    } catch (err: any) {
      setActionAlert({ type: 'error', msg: err.message || 'Failed to save event' });
    }
  };

  // Action: Publish Notice
  const handlePublishNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsNoticeSubmitting(true);
    try {
      await safeFetchJson('/api/admin/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(noticeForm),
      });

      setIsNoticeSubmitting(false);
      setActionAlert({ type: 'success', msg: 'Notice broadcasted to batch members successfully!' });
      setNoticeForm({ title: '', description: '', priority: 'normal', targetAudience: 'all' });
      fetchNotices();
    } catch (err: any) {
      setIsNoticeSubmitting(false);
      setActionAlert({ type: 'error', msg: err.message || 'Failed to publish notice' });
    }
  };

  // Action: Update Site Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await safeFetchJson('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(siteSettingsForm),
      });

      setSettingsSavedMsg('Site settings updated successfully!');
      setTimeout(() => setSettingsSavedMsg(''), 3000);
    } catch (err: any) {
      console.warn('Settings update notice:', err?.message);
    }
  };

  // Action: Change User Role
  const handleChangeRole = async (userId: number, role: string) => {
    try {
      const data = await safeFetchJson<{ message?: string }>('/api/admin/users/role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, role }),
      });

      setActionAlert({ type: 'success', msg: data.message || 'User role updated' });
      fetchUsers();
    } catch (err: any) {
      setActionAlert({ type: 'error', msg: err.message || 'Failed to change role' });
    }
  };

  // Action: Seed / Clear Demo Data
  const handleSeedDemo = async () => {
    try {
      const data = await safeFetchJson<{ message?: string }>('/api/admin/seed-demo', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setActionAlert({ type: 'success', msg: data.message || 'Demo data generated' });
      fetchOverview();
      fetchMembers();
    } catch (err: any) {
      setActionAlert({ type: 'error', msg: err.message || 'Failed to seed demo data' });
    }
  };

  const handleClearDemo = async () => {
    try {
      const data = await safeFetchJson<{ message?: string }>('/api/admin/clear-demo', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setActionAlert({ type: 'success', msg: data.message || 'Demo data cleared' });
      fetchOverview();
      fetchMembers();
    } catch (err: any) {
      setActionAlert({ type: 'error', msg: err.message || 'Failed to clear demo data' });
    }
  };

  // CSV Export Download (iframe safe via hidden anchor)
  const downloadCSV = (type: 'members' | 'participants' | 'payments') => {
    const link = document.createElement('a');
    link.href = `/api/admin/export/${type}`;
    link.download = `bgps23_${type}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#002147] via-[#001733] to-[#002147] rounded-3xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#C5A059]/40 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#C5A059] text-[#002147] font-bold flex items-center justify-center shadow-lg">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-serif">Alumni Admin Control Panel</h1>
              <span className="text-[10px] uppercase font-bold bg-[#C5A059] text-[#002147] px-2 py-0.5 rounded-full">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Border Guard Public School, Cox's Bazar — SSC Batch 2023 Central Committee
            </p>
          </div>
        </div>

        {/* Quick CSV Export & Demo actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => downloadCSV('members')}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Export Members CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Members CSV</span>
          </button>
          <button
            onClick={() => downloadCSV('payments')}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Export Payments CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Payments CSV</span>
          </button>
          <button
            onClick={handleSeedDemo}
            className="px-3 py-1.5 bg-[#C5A059]/20 hover:bg-[#C5A059]/30 text-[#C5A059] border border-[#C5A059]/40 rounded-xl text-xs font-bold"
          >
            + Seed Demo Batch
          </button>
          <button
            onClick={handleClearDemo}
            className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-xl text-xs font-bold"
          >
            Clear Demo Data
          </button>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionAlert && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-3 ${
            actionAlert.type === 'error'
              ? 'bg-red-50 border border-red-200 text-red-800'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionAlert.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            ) : (
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            )}
            <span>{actionAlert.msg}</span>
          </div>
          <button onClick={() => setActionAlert(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Admin Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-bold">
        {[
          { id: 'overview', label: 'Dashboard Overview', icon: Layers },
          { id: 'members', label: 'Member Verification Queue', icon: UserCheck, count: overview?.pendingVerification },
          { id: 'payments', label: 'Payment Verification Queue', icon: DollarSign, count: overview?.pendingPayments },
          { id: 'events', label: 'Events Manager', icon: Ticket },
          { id: 'notices', label: 'Notices Publisher', icon: Megaphone },
          { id: 'gallery', label: 'Gallery Moderation', icon: ImageIcon },
          { id: 'settings', label: 'Site Settings', icon: Settings },
          { id: 'users', label: 'Admin Roles', icon: Key, hidden: user?.role !== 'super_admin' },
          { id: 'logs', label: 'Audit Trail', icon: FileText },
        ]
          .filter((t) => !t.hidden)
          .map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#002147] text-[#C5A059] shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span className="w-5 h-5 bg-amber-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
      </div>

      {/* TAB 1: DASHBOARD OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Members</span>
              <div className="text-3xl font-extrabold text-[#002147] font-mono">{overview?.totalMembers || 0}</div>
              <div className="text-xs text-slate-500">
                Verified: <strong className="text-emerald-700">{overview?.verifiedMembers || 0}</strong>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-sm border border-amber-200 space-y-1">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Pending Verification</span>
              <div className="text-3xl font-extrabold text-amber-600 font-mono">{overview?.pendingVerification || 0}</div>
              <div className="text-xs text-slate-500">Awaiting admin document review</div>
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-sm border border-emerald-200 space-y-1">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Confirmed Payments</span>
              <div className="text-3xl font-extrabold text-emerald-700 font-mono">
                {overview?.totalPaymentAmount || 0} <span className="text-xs">BDT</span>
              </div>
              <div className="text-xs text-slate-500">
                Pending: <strong className="text-amber-600">{overview?.pendingPayments || 0} Trx</strong>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reunion Events</span>
              <div className="text-3xl font-extrabold text-blue-700 font-mono">{overview?.totalEvents || 0}</div>
              <div className="text-xs text-slate-500">Registrations: {overview?.eventRegistrations || 0}</div>
            </div>
          </div>

          {/* Quick Overview Queues */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Audit Activities */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-sm text-[#002147] uppercase tracking-wider">Recent System Audit Trail</h3>
                <button onClick={() => setActiveTab('logs')} className="text-xs text-[#002147] hover:underline font-semibold">
                  View all logs →
                </button>
              </div>
              <div className="space-y-3">
                {overview?.recentActivity?.slice(0, 6).map((log: any) => (
                  <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-start justify-between gap-3">
                    <div>
                      <span className="font-mono font-bold text-[#002147] uppercase block">{log.action}</span>
                      <p className="text-slate-600 mt-0.5">{log.details || log.recordType}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">By: {log.userEmail || 'System'}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-gradient-to-br from-[#002147] to-[#001733] text-white rounded-3xl p-6 shadow-sm border border-[#C5A059]/40 space-y-4">
              <h3 className="font-bold text-base font-serif text-[#C5A059]">Admin Quick Access</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                As an authorized administrator of the BGPS SSC 2023 portal, you have direct jurisdiction over student identity verification, transaction validation, and public announcements.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('members')}
                  className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-left transition-all"
                >
                  <UserCheck className="w-5 h-5 text-[#C5A059] mb-1" />
                  <span className="font-bold text-xs block">Verify Members</span>
                  <span className="text-[10px] text-slate-300">Check school proof docs</span>
                </button>

                <button
                  onClick={() => setActiveTab('payments')}
                  className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-left transition-all"
                >
                  <DollarSign className="w-5 h-5 text-emerald-400 mb-1" />
                  <span className="font-bold text-xs block">Verify Payments</span>
                  <span className="text-[10px] text-slate-300">Check TrxID + screenshot</span>
                </button>

                <button
                  onClick={() => setActiveTab('notices')}
                  className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-left transition-all"
                >
                  <Megaphone className="w-5 h-5 text-blue-400 mb-1" />
                  <span className="font-bold text-xs block">Publish Notice</span>
                  <span className="text-[10px] text-slate-300">Broadcast notification</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-left transition-all"
                >
                  <Settings className="w-5 h-5 text-amber-400 mb-1" />
                  <span className="font-bold text-xs block">bKash / Nagad Setup</span>
                  <span className="text-[10px] text-slate-300">Update payment numbers</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MEMBER VERIFICATION QUEUE */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Status:
              </span>
              {[
                { id: 'pending', label: '🟡 Pending Verification' },
                { id: 'verified', label: '🟢 Verified' },
                { id: 'correction_required', label: '🟠 Correction Required' },
                { id: 'rejected', label: '🔴 Rejected' },
                { id: 'all', label: 'All Records' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setMemberFilterStatus(s.id)}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    memberFilterStatus === s.id
                      ? 'bg-[#002147] text-[#C5A059] shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search name, roll, email..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchMembers()}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
              />
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#002147] text-white uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Member ID & Name</th>
                    <th className="py-3.5 px-4">School Roll & Group</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Proof Document</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Verification Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {membersList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                        No members in "{memberFilterStatus}" queue.
                      </td>
                    </tr>
                  ) : (
                    membersList.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                        {/* Member */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {m.profilePhotoUrl ? (
                              <img
                                src={m.profilePhotoUrl}
                                alt={m.fullName}
                                className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-[#002147] text-[#C5A059] font-bold flex items-center justify-center shrink-0">
                                {m.fullName?.charAt(0)}
                              </div>
                            )}
                            <div>
                              <span className="font-mono font-extrabold text-[#002147] text-[11px] block">
                                {m.memberId}
                              </span>
                              <span className="font-bold text-slate-900 text-xs block">{m.fullName}</span>
                              <span className="text-[10px] text-slate-400">{m.userEmail}</span>
                            </div>
                          </div>
                        </td>

                        {/* School info */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <span className="font-bold text-[#002147]">Roll: {m.rollNumber}</span>
                            <div className="text-[11px] text-slate-500">
                              {m.groupStream} (Sec {m.section})
                            </div>
                            <span className="text-[10px] text-slate-400">SSC Year: {m.sscYear || 2023}</span>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5 text-[11px] text-slate-600">
                            <div>{m.mobileNumber || 'No phone'}</div>
                            <div className="text-slate-400">{m.currentCity || "Cox's Bazar"}</div>
                          </div>
                        </td>

                        {/* Proof document */}
                        <td className="py-3.5 px-4">
                          {m.documents && m.documents.length > 0 ? (
                            <button
                              type="button"
                              onClick={() => setSelectedProofDoc(m.documents[0])}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-[11px] flex items-center gap-1 border border-blue-200 transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Inspect Proof</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">No document</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {m.verificationStatus === 'verified' ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                              Verified
                            </span>
                          ) : m.verificationStatus === 'pending' ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300">
                              Pending
                            </span>
                          ) : m.verificationStatus === 'correction_required' ? (
                            <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold border border-orange-300">
                              Correction
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold border border-red-300">
                              Rejected
                            </span>
                          )}
                        </td>

                        {/* Action buttons */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {m.verificationStatus !== 'verified' && (
                              <button
                                onClick={() => handleVerifyMember(m.id, 'approve')}
                                className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                                title="Approve & Verify Member"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => setCorrectionModalMember(m)}
                              className="p-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
                              title="Request Correction with Reason"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {m.verificationStatus !== 'rejected' && (
                              <button
                                onClick={() => setRejectModalMember(m)}
                                className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                title="Reject Verification with Reason"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PAYMENT VERIFICATION QUEUE (CRITICAL) */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Status:
              </span>
              {[
                { id: 'pending', label: '🟡 Pending Payments' },
                { id: 'confirmed', label: '🟢 Confirmed' },
                { id: 'correction_required', label: '🟠 Correction Required' },
                { id: 'rejected', label: '🔴 Rejected' },
                { id: 'all', label: 'All Payments' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setPaymentFilterStatus(s.id)}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    paymentFilterStatus === s.id
                      ? 'bg-[#002147] text-[#C5A059] shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-500">
              Payments in Queue: <strong>{paymentsList.length}</strong>
            </div>
          </div>

          {/* Payments Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#002147] text-white uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Member Info</th>
                    <th className="py-3.5 px-4">Event & Method</th>
                    <th className="py-3.5 px-4">Amount & Sender</th>
                    <th className="py-3.5 px-4">Transaction ID</th>
                    <th className="py-3.5 px-4">Transaction Screenshot</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Review Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paymentsList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                        No payments found in "{paymentFilterStatus}" queue.
                      </td>
                    </tr>
                  ) : (
                    paymentsList.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        {/* Member */}
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-[#002147] block">{p.memberId}</span>
                          <span className="font-bold text-slate-900 block">{p.memberName}</span>
                          <span className="text-[10px] text-slate-400">Roll: {p.memberRoll}</span>
                        </td>

                        {/* Event & Method */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block truncate max-w-[140px]">{p.eventTitle}</span>
                          <span className="inline-block mt-0.5 font-bold px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-800">
                            {p.paymentMethod}
                          </span>
                        </td>

                        {/* Amount & Sender */}
                        <td className="py-3.5 px-4">
                          <span className="font-extrabold text-sm text-emerald-700 font-mono block">
                            {p.amount} BDT
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">From: {p.senderNumber}</span>
                        </td>

                        {/* TrxID */}
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-bold text-xs text-[#002147] bg-amber-50 px-2 py-1 rounded border border-amber-200 inline-block tracking-wider">
                            {p.transactionId}
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Date: {p.paymentDate}</span>
                        </td>

                        {/* Screenshot */}
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => setInspectScreenshot(p)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#002147] hover:bg-[#001733] text-[#C5A059] rounded-xl font-bold text-[11px] shadow-xs transition-colors"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Enlarge Screenshot</span>
                          </button>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {p.status === 'confirmed' ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                              Confirmed
                            </span>
                          ) : p.status === 'pending' ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-300">
                              Pending Review
                            </span>
                          ) : p.status === 'correction_required' ? (
                            <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-900 text-[10px] font-bold border border-orange-300">
                              Correction
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold border border-red-300">
                              Rejected
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {p.status !== 'confirmed' && (
                              <button
                                onClick={() => handleReviewPayment(p.id, 'confirm')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-xs transition-colors"
                                title="Confirm Payment"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Confirm</span>
                              </button>
                            )}

                            {p.status !== 'rejected' && (
                              <button
                                onClick={() => setRejectModalPayment(p)}
                                className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                title="Reject Payment"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EVENTS MANAGER */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#002147] font-serif">
              Manage Reunion Events & Gatherings
            </h3>
            <button
              onClick={() => setIsEventModalOpen(true)}
              className="px-4 py-2 bg-[#002147] text-[#C5A059] font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Event</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {eventsList.map((ev) => (
              <div key={ev.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase">
                      {ev.eventType}
                    </span>
                    <h4 className="font-bold text-base text-[#002147] mt-1">{ev.title}</h4>
                  </div>
                  <span className="font-mono font-extrabold text-sm text-emerald-700">
                    {ev.registrationFee} BDT
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <p><strong>Date & Time:</strong> {ev.eventDate} ({ev.startTime || '9:00 AM'} - {ev.endTime || '8:00 PM'})</p>
                  <p><strong>Venue:</strong> {ev.venue}, {ev.address}</p>
                  <p><strong>Organizer:</strong> {ev.organizer}</p>
                  <p><strong>Registration Deadline:</strong> {ev.registrationDeadline || 'December 2026'}</p>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2">{ev.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: NOTICES PUBLISHER */}
      {activeTab === 'notices' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Create Notice Form */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-[#002147] font-serif border-b pb-2 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#C5A059]" />
              <span>Broadcast Official Notice</span>
            </h3>

            <form onSubmit={handlePublishNotice} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Notice Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Reunion Venue & Transport Schedule"
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#002147] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={noticeForm.priority}
                    onChange={(e) => setNoticeForm({ ...noticeForm, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#002147] focus:outline-none"
                  >
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Audience</label>
                  <select
                    value={noticeForm.targetAudience}
                    onChange={(e) => setNoticeForm({ ...noticeForm, targetAudience: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#002147] focus:outline-none"
                  >
                    <option value="all">All Members</option>
                    <option value="verified">Verified Members Only</option>
                    <option value="science">Science Group</option>
                    <option value="humanities">Humanities Group</option>
                    <option value="business">Business Studies</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notice Content *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detailed announcement content..."
                  value={noticeForm.description}
                  onChange={(e) => setNoticeForm({ ...noticeForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#002147] focus:outline-none"
                />
              </div>

              <p className="text-[11px] text-slate-500 italic">
                * Publishing will automatically notify batch members in their in-site notification feed.
              </p>

              <button
                type="submit"
                disabled={isNoticeSubmitting}
                className="w-full py-2.5 bg-[#002147] hover:bg-[#001733] text-[#C5A059] font-bold rounded-xl shadow transition-all disabled:opacity-50"
              >
                {isNoticeSubmitting ? 'Broadcasting...' : 'Publish & Broadcast Notice'}
              </button>
            </form>
          </div>

          {/* Published Notices List */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-[#002147] font-serif border-b pb-2">
              Published Circulars ({noticesList.length})
            </h3>
            <div className="space-y-3">
              {noticesList.map((n) => (
                <div key={n.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 uppercase">
                      {n.priority}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-[#002147]">{n.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2">{n.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: GALLERY MODERATION */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <h3 className="font-bold text-base text-[#002147] font-serif">
            Moderate School Memories Uploads
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {galleryList.map((photo) => (
              <div key={photo.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 space-y-2 p-3">
                <img src={photo.imageUrl} alt={photo.title} className="w-full h-44 object-cover rounded-2xl" />
                <div className="p-2 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#C5A059]">{photo.category}</span>
                  <h4 className="font-bold text-xs text-slate-900">{photo.title}</h4>
                  <p className="text-[11px] text-slate-500">By: {photo.uploadedByName || 'Member'}</p>
                  <div className="pt-2 flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${photo.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {photo.status}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={async () => {
                          try {
                            await safeFetchJson(`/api/admin/gallery/${photo.id}/status`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                              body: JSON.stringify({ status: 'approved' }),
                            });
                            fetchGallery();
                          } catch (e: any) {
                            console.warn('Approve notice:', e?.message);
                          }
                        }}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                      >
                        Approve
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await safeFetchJson(`/api/admin/gallery/${photo.id}/status`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                              body: JSON.stringify({ status: 'rejected' }),
                            });
                            fetchGallery();
                          } catch (e: any) {
                            console.warn('Reject notice:', e?.message);
                          }
                        }}
                        className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: SITE SETTINGS (bKash / Nagad Configuration) */}
      {activeTab === 'settings' && (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-xl font-bold font-serif text-[#002147]">
              Portal & Payment Configuration
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Configure official payment receiver phone numbers and portal titles without modifying source code.
            </p>
          </div>

          {settingsSavedMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{settingsSavedMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">School Name</label>
                <input
                  type="text"
                  value={siteSettingsForm.schoolName || ''}
                  onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, schoolName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#002147] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Batch Year</label>
                <input
                  type="text"
                  value={siteSettingsForm.batchYear || ''}
                  onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, batchYear: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#002147] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Website Tagline</label>
              <input
                type="text"
                value={siteSettingsForm.tagline || ''}
                onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#002147] focus:outline-none"
              />
            </div>

            {/* PAYMENT NUMBERS CONFIGURATION */}
            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-3">
              <span className="font-extrabold text-sm text-[#002147] uppercase tracking-wide block">
                Official Payment Accounts
              </span>
              <p className="text-[11px] text-slate-600">
                These numbers are dynamically displayed on the payment modal for members to send reunion fees:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-pink-700 mb-1">bKash Number</label>
                  <input
                    type="text"
                    value={siteSettingsForm.bkashNumber || ''}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, bkashNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-pink-200 bg-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-orange-700 mb-1">Nagad Number</label>
                  <input
                    type="text"
                    value={siteSettingsForm.nagadNumber || ''}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, nagadNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-orange-200 bg-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-purple-700 mb-1">Rocket Number</label>
                  <input
                    type="text"
                    value={siteSettingsForm.rocketNumber || ''}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, rocketNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-white text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-blue-700 mb-1">Bank Account Information</label>
                <input
                  type="text"
                  value={siteSettingsForm.bankInfo || ''}
                  onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, bankInfo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-blue-200 bg-white text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Instructions to Members</label>
                <textarea
                  rows={3}
                  value={siteSettingsForm.paymentInstructions || ''}
                  onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, paymentInstructions: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={siteSettingsForm.contactEmail || ''}
                  onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={siteSettingsForm.contactPhone || ''}
                  onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, contactPhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-[#002147] hover:bg-[#001733] text-[#C5A059] font-bold text-sm rounded-xl shadow transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Site & Payment Configuration</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 8: USER ROLES (Super Admin Only) */}
      {activeTab === 'users' && user?.role === 'super_admin' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#002147] font-serif">
              Administrative Roles & Team Access
            </h3>
            <span className="text-xs text-slate-500">
              Only Super Admins can assign or revoke administrative rights.
            </span>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#002147] text-white uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">User Email</th>
                  <th className="py-3.5 px-4">Linked Member</th>
                  <th className="py-3.5 px-4">Current Role</th>
                  <th className="py-3.5 px-4 text-right">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{u.email}</td>
                    <td className="py-3.5 px-4">
                      {u.memberId ? (
                        <span>{u.fullName} ({u.memberId})</span>
                      ) : (
                        <span className="text-slate-400 italic">No profile linked</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'super_admin'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : u.role === 'admin'
                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                          : u.role === 'moderator'
                          ? 'bg-purple-100 text-purple-900 border border-purple-300'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u.id, e.target.value)}
                        className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold"
                      >
                        <option value="member">Member</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 9: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#002147] font-serif">
              Administrative Activity Audit Logs
            </h3>
            <button
              onClick={fetchLogs}
              className="text-xs font-semibold text-[#002147] flex items-center gap-1 hover:underline"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Logs</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#002147] text-white uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Admin / User</th>
                  <th className="py-3.5 px-4">Target Entity</th>
                  <th className="py-3.5 px-4">Details</th>
                  <th className="py-3.5 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogsList.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-[#002147]">{log.action}</td>
                    <td className="py-3 px-4 text-slate-700">{log.userEmail || 'System'}</td>
                    <td className="py-3 px-4 text-slate-500">{log.recordType} #{log.recordId}</td>
                    <td className="py-3 px-4 text-slate-600 line-clamp-1 max-w-xs">{log.details}</td>
                    <td className="py-3 px-4 text-slate-400 text-right">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: INSPECT VERIFICATION PROOF DOCUMENT */}
      {selectedProofDoc && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#C5A059] uppercase block">School Verification Proof</span>
                <h4 className="font-bold text-base text-[#002147]">{selectedProofDoc.documentType}</h4>
              </div>
              <button onClick={() => setSelectedProofDoc(null)} className="p-1 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto bg-slate-50 rounded-2xl p-2 flex items-center justify-center border">
              <img src={selectedProofDoc.fileUrl} alt="School Proof" className="max-h-[60vh] object-contain rounded-xl" />
            </div>

            <div className="text-right">
              <button
                onClick={() => setSelectedProofDoc(null)}
                className="px-5 py-2 bg-[#002147] text-[#C5A059] font-bold text-xs rounded-xl"
              >
                Close Document Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: INSPECT TRANSACTION SCREENSHOT (CRITICAL) */}
      {inspectScreenshot && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-800 space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Transaction Screenshot Review
                </span>
                <h4 className="font-bold text-lg text-white">
                  TrxID: {inspectScreenshot.transactionId} • {inspectScreenshot.amount} BDT ({inspectScreenshot.paymentMethod})
                </h4>
                <p className="text-xs text-slate-400">
                  Sender: {inspectScreenshot.senderNumber} • Member: {inspectScreenshot.memberName} ({inspectScreenshot.memberId})
                </p>
              </div>
              <button onClick={() => setInspectScreenshot(null)} className="p-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto bg-black/60 rounded-2xl p-2 flex items-center justify-center">
              <img
                src={inspectScreenshot.screenshotUrl}
                alt="Transaction Screenshot"
                className="max-h-[60vh] w-auto max-w-full object-contain rounded-lg border border-slate-700 shadow-md"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                Verify that Transaction ID, amount, and date in image match SMS records.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleReviewPayment(inspectScreenshot.id, 'confirm');
                    setInspectScreenshot(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Payment</span>
                </button>
                <button
                  onClick={() => {
                    setInspectScreenshot(null);
                    setRejectModalPayment(inspectScreenshot);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" />
                  <span>Reject / Correction</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: REJECT MEMBER REASON */}
      {rejectModalMember && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-md w-full bg-white rounded-3xl p-6 space-y-4 shadow-2xl">
            <h4 className="font-bold text-base text-red-700">Reject Profile Verification</h4>
            <p className="text-xs text-slate-600">
              You must provide an official reason explaining why <strong>{rejectModalMember.fullName}</strong> ({rejectModalMember.memberId}) cannot be verified:
            </p>
            <textarea
              rows={3}
              required
              placeholder="e.g. Roll 101 does not match school registration record for Section A in SSC 2023."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setRejectModalMember(null)} className="px-4 py-2 text-xs font-bold text-slate-600">
                Cancel
              </button>
              <button
                onClick={() => handleVerifyMember(rejectModalMember.id, 'reject', rejectReason)}
                disabled={!rejectReason.trim()}
                className="px-5 py-2 bg-red-600 text-white font-bold text-xs rounded-xl disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: REQUEST CORRECTION MEMBER */}
      {correctionModalMember && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-md w-full bg-white rounded-3xl p-6 space-y-4 shadow-2xl">
            <h4 className="font-bold text-base text-amber-800">Request Profile Correction</h4>
            <p className="text-xs text-slate-600">
              Enter specific instructions for <strong>{correctionModalMember.fullName}</strong> on what needs fixing:
            </p>
            <textarea
              rows={3}
              required
              placeholder="e.g. The uploaded registration card photo is blurry. Please upload a clear photo showing the roll number."
              value={correctionNotes}
              onChange={(e) => setCorrectionNotes(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setCorrectionModalMember(null)} className="px-4 py-2 text-xs font-bold text-slate-600">
                Cancel
              </button>
              <button
                onClick={() => handleVerifyMember(correctionModalMember.id, 'request_correction', undefined, correctionNotes)}
                disabled={!correctionNotes.trim()}
                className="px-5 py-2 bg-amber-600 text-white font-bold text-xs rounded-xl disabled:opacity-50"
              >
                Send Correction Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: REJECT PAYMENT REASON */}
      {rejectModalPayment && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-md w-full bg-white rounded-3xl p-6 space-y-4 shadow-2xl">
            <h4 className="font-bold text-base text-red-700">Reject Payment Submission</h4>
            <p className="text-xs text-slate-600">
              Provide a mandatory reason for rejecting TrxID <strong>{rejectModalPayment.transactionId}</strong>:
            </p>
            <textarea
              rows={3}
              required
              placeholder="e.g. Transaction ID was not found in statement / Amount paid (500) does not match required reunion fee (1500)."
              value={paymentRejectReason}
              onChange={(e) => setPaymentRejectReason(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setRejectModalPayment(null)} className="px-4 py-2 text-xs font-bold text-slate-600">
                Cancel
              </button>
              <button
                onClick={() => handleReviewPayment(rejectModalPayment.id, 'reject', paymentRejectReason)}
                disabled={!paymentRejectReason.trim()}
                className="px-5 py-2 bg-red-600 text-white font-bold text-xs rounded-xl disabled:opacity-50"
              >
                Confirm Payment Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: CREATE EVENT MODAL */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative max-w-lg w-full bg-white rounded-3xl p-6 space-y-4 shadow-2xl my-6">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-bold text-base text-[#002147] font-serif">Create Reunion Event</h4>
              <button onClick={() => setIsEventModalOpen(false)} className="p-1 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BGPS SSC 2023 Grand Reunion 2026"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Event Date *</label>
                  <input
                    type="date"
                    required
                    value={eventForm.eventDate}
                    onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Registration Fee (BDT) *</label>
                  <input
                    type="number"
                    required
                    value={eventForm.registrationFee}
                    onChange={(e) => setEventForm({ ...eventForm, registrationFee: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Venue Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hotel Sea Palace, Cox's Bazar"
                  value={eventForm.venue}
                  onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsEventModalOpen(false)} className="px-4 py-2 font-bold text-slate-600">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-[#002147] text-[#C5A059] font-bold rounded-xl shadow">
                  Save & Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
