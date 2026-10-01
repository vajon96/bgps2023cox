import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Award,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  FileCheck,
  Info,
  MapPin,
  Phone,
  Sparkles,
  Ticket,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { EventRegistration, ReunionEvent } from '../types/index.ts';
import { safeFetchJson } from '../lib/api.ts';

interface EventsViewProps {
  onOpenPayment: (event: ReunionEvent) => void;
  onOpenRegister: () => void;
  onOpenLogin: () => void;
}

export const EventsView: React.FC<EventsViewProps> = ({
  onOpenPayment,
  onOpenRegister,
  onOpenLogin,
}) => {
  const { user, profile, token } = useAuth();
  const [eventsList, setEventsList] = useState<ReunionEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRegistrations, setUserRegistrations] = useState<{ [eventId: number]: any }>({});
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const data = await safeFetchJson<ReunionEvent[]>('/api/events');
      const list = Array.isArray(data) ? data : [];
      setEventsList(list);

      // If user logged in, fetch status for each event
      if (token && list.length > 0) {
        for (const ev of list) {
          try {
            const statusData = await safeFetchJson<any>(`/api/events/${ev.id}/my-status`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (statusData?.registered) {
              setUserRegistrations((prev) => ({ ...prev, [ev.id]: statusData }));
            }
          } catch {
            // Status check is optional
          }
        }
      }
    } catch (err: any) {
      console.warn('Events fetch notice:', err?.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [token]);

  const handleRegisterEvent = async (ev: ReunionEvent) => {
    setActionMessage(null);

    if (!user) {
      onOpenLogin();
      return;
    }

    if (!profile) {
      setActionMessage({ type: 'error', text: 'Please complete your batch member registration profile first.' });
      return;
    }

    if (profile.verificationStatus !== 'verified' && user.role !== 'admin' && user.role !== 'super_admin') {
      setActionMessage({
        type: 'error',
        text: `Your profile is currently ${profile.verificationStatus}. Only verified batch members can register for reunion events.`,
      });
      return;
    }

    try {
      const data = await safeFetchJson<{ registration: any }>(`/api/events/${ev.id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ guestCount: 0 }),
      });

      setActionMessage({
        type: 'success',
        text: 'Seat registered! Now submit your payment proof with Transaction ID and screenshot to confirm your ticket.',
      });

      // Update registration map
      setUserRegistrations((prev) => ({
        ...prev,
        [ev.id]: { registered: true, registration: data.registration },
      }));

      // Directly open payment modal
      onOpenPayment(ev);
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to register' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider">
          <Ticket className="w-4 h-4 text-[#C5A059]" />
          <span>Batch Reunions & Gatherings</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-[#002147]">
          Reunion Events & Tickets
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Official reunions organized by the Border Guard Public School, Cox's Bazar SSC 2023 Committee. Register early and submit your payment verification to secure your commemorative batch kit and ticket.
        </p>
      </div>

      {actionMessage && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 max-w-2xl mx-auto ${
            actionMessage.type === 'error'
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
          }`}
        >
          {actionMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          ) : (
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Events List */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#002147] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Loading events...</p>
        </div>
      ) : eventsList.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No upcoming events right now</h3>
          <p className="text-xs text-slate-500">New batch reunion dates will be published soon by the committee.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {eventsList.map((ev) => {
            const userReg = userRegistrations[ev.id];
            const isRegistered = !!userReg;
            const regStatus = userReg?.registration?.status;
            const confirmedPayments = userReg?.payments?.filter((p: any) => p.status === 'confirmed') || [];
            const isConfirmed = regStatus === 'confirmed' || confirmedPayments.length > 0;

            return (
              <div
                key={ev.id}
                className="bg-white rounded-3xl shadow-md border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12 hover:shadow-xl transition-all"
              >
                {/* Image Col */}
                <div className="lg:col-span-5 relative h-64 lg:h-auto min-h-[300px]">
                  <img
                    src={ev.coverImage || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80'}
                    alt={ev.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-[#002147] text-[#C5A059] border border-[#C5A059]/40 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                      {ev.eventType}
                    </span>
                  </div>
                </div>

                {/* Details Col */}
                <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#002147]">
                          {ev.title}
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                          Organized by: <strong className="text-slate-800">{ev.organizer}</strong>
                        </p>
                      </div>

                      {/* Status indicator if registered */}
                      {isRegistered && (
                        <div className="text-right">
                          {isConfirmed ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Ticket Confirmed</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>Payment Pending</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {ev.description}
                    </p>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <Calendar className="w-4 h-4 text-[#002147] shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Event Date</span>
                          <span className="font-semibold text-slate-800">
                            {ev.eventDate} ({ev.startTime || '9:00 AM'})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <MapPin className="w-4 h-4 text-[#C5A059] shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Venue & Address</span>
                          <span className="font-semibold text-slate-800 truncate block">
                            {ev.venue}, {ev.address || "Cox's Bazar"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Reunion Fee</span>
                          <span className="font-extrabold text-emerald-700 text-sm font-mono">
                            {ev.registrationFee} BDT
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <Users className="w-4 h-4 text-blue-600 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Participants</span>
                          <span className="font-semibold text-slate-800">
                            {ev.confirmedParticipants || 0} Confirmed Attendees
                          </span>
                        </div>
                      </div>
                    </div>

                    {ev.contactInfo && (
                      <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 text-xs text-amber-900 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#C5A059] shrink-0" />
                        <span><strong>Contact Committee:</strong> {ev.contactInfo}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-slate-500">
                      Registration Deadline: <strong className="text-slate-800">{ev.registrationDeadline || '20 December 2026'}</strong>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      {!user ? (
                        <button
                          onClick={onOpenLogin}
                          className="w-full sm:w-auto px-6 py-2.5 bg-[#002147] hover:bg-[#001733] text-[#C5A059] font-bold text-xs rounded-xl shadow-md transition-all text-center"
                        >
                          Sign In to Register
                        </button>
                      ) : !isRegistered ? (
                        <button
                          onClick={() => handleRegisterEvent(ev)}
                          className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-[#C5A059] to-[#DFBF7D] text-[#002147] font-bold text-xs rounded-xl shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2"
                        >
                          <Ticket className="w-4 h-4" />
                          <span>Register for Event</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => onOpenPayment(ev)}
                            className="w-full sm:w-auto px-5 py-2.5 bg-[#002147] hover:bg-[#001733] text-[#C5A059] font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                          >
                            <FileCheck className="w-4 h-4" />
                            <span>{isConfirmed ? 'View / Submit Additional Payment' : 'Submit Payment Proof'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
