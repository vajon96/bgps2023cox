import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  Camera,
  CheckCircle,
  GraduationCap,
  Heart,
  Image as ImageIcon,
  Sparkles,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { BatchStats, MemoryGallery } from '../types/index.ts';
import { safeFetchJson } from '../lib/api.ts';

interface HomeViewProps {
  onNavigate: (tab: string) => void;
  onOpenRegister: () => void;
  onOpenLogin: () => void;
  onSelectMember: (member: any) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onOpenRegister,
  onOpenLogin,
  onSelectMember,
}) => {
  const { features } = useAuth();
  const [stats, setStats] = useState<BatchStats>({
    totalMembers: 5,
    verifiedMembers: 5,
    scienceCount: 3,
    humanitiesCount: 1,
    businessCount: 1,
  });

  const [featuredMembers, setFeaturedMembers] = useState<any[]>([]);
  const [memories, setMemories] = useState<MemoryGallery[]>([]);

  useEffect(() => {
    // Fetch live statistics
    safeFetchJson<BatchStats>('/api/stats')
      .then((data) => {
        if (data) setStats(data);
      })
      .catch((err) => console.warn('Stats fetch notice:', err?.message));

    // Fetch verified classmates preview
    safeFetchJson<{ members: any[] }>('/api/members/directory?limit=6')
      .then((data) => {
        if (data?.members) setFeaturedMembers(data.members);
      })
      .catch((err) => console.warn('Directory preview notice:', err?.message));

    // Fetch memory gallery photos
    safeFetchJson<MemoryGallery[]>('/api/gallery')
      .then((data) => {
        if (Array.isArray(data)) setMemories(data.slice(0, 3));
      })
      .catch((err) => console.warn('Gallery preview notice:', err?.message));
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* 01 — HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#002147] via-[#001733] to-[#001026] text-white pt-14 pb-24 border-b border-[#C5A059]/30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-[#C5A059]/40 text-[#C5A059] text-xs font-bold tracking-widest uppercase shadow-md">
            <Sparkles className="w-4 h-4" />
            <span>Border Guard Public School, Cox's Bazar</span>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-serif tracking-tight text-white leading-tight">
              BGPS SSC 2023
            </h1>
            <p className="text-lg sm:text-2xl text-[#C5A059] font-serif italic tracking-wide">
              "Old Memories. New Connections. One Batch."
            </p>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              A digital memory book dedicated to preserving our school days, celebrating our batch bonds, and keeping our classmates connected forever.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              onClick={onOpenRegister}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-[#C5A059] to-[#DFBF7D] text-[#002147] hover:brightness-105 shadow-xl shadow-[#C5A059]/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Award className="w-5 h-5" />
              <span>Join Our Batch</span>
            </button>
            <button
              onClick={() => onNavigate('directory')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-semibold text-sm bg-white/10 hover:bg-white/15 text-white border border-white/20 backdrop-blur-sm flex items-center justify-center gap-2 transition-all"
            >
              <Users className="w-5 h-5 text-[#C5A059]" />
              <span>View All Classmates</span>
            </button>
          </div>
        </div>
      </section>

      {/* 02 — MEMORY STATEMENT */}
      <section className="max-w-4xl mx-auto px-4 text-center">
        <div className="p-8 sm:p-10 rounded-3xl bg-white shadow-sm border border-slate-200/90 relative overflow-hidden">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 text-[#C5A059] flex items-center justify-center mb-4">
            <Heart className="w-6 h-6 text-[#C5A059] fill-[#C5A059]/20" />
          </div>
          <blockquote className="text-xl sm:text-2xl font-serif text-[#002147] font-semibold italic leading-relaxed">
            “School days may be over, but the memories never have to be.”
          </blockquote>
          <p className="text-xs text-slate-500 mt-3 font-medium">
            Dedicated to every student who walked the corridors of BGPS Cox's Bazar and passed SSC in 2023.
          </p>
        </div>
      </section>

      {/* 03 — BATCH STATISTICS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="text-center mb-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              SSC 2023 Batch Records
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            {/* Total Members */}
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#002147] font-mono block">
                {stats.totalMembers}
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1 block">
                Total Classmates
              </span>
            </div>

            {/* Verified */}
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-emerald-100">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono block">
                {stats.verifiedMembers}
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1 block">
                Verified Profiles
              </span>
            </div>

            {/* Science */}
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-blue-100">
              <span className="text-2xl sm:text-3xl font-extrabold text-blue-700 font-mono block">
                {stats.scienceCount}
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1 block">
                Science Group
              </span>
            </div>

            {/* Humanities */}
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-amber-100">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-700 font-mono block">
                {stats.humanitiesCount}
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1 block">
                Humanities Group
              </span>
            </div>

            {/* Business Studies */}
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-purple-100 col-span-2 md:col-span-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-purple-700 font-mono block">
                {stats.businessCount}
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1 block">
                Business Studies
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 04 — OUR BATCH */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#002147] to-[#001733] text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-[#C5A059]/30 space-y-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C5A059] uppercase tracking-widest">
            <GraduationCap className="w-4 h-4" />
            <span>Our School Story</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif leading-tight">
            Memories Born by the Hills and Sea of Cox's Bazar
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
            Border Guard Public School, Cox's Bazar gave us more than just textbooks and exam results. It gave us morning assemblies under the morning sun, lunch breaks shared on the quadrangle, rainy day football matches on the ground, and teachers whose wisdom shaped our paths.
          </p>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
            As the SSC 2023 batch, we stood side-by-side through our formative years. This digital yearbook is built so no classmate is ever lost or forgotten. Whenever you miss school, this is the place you can always come back to.
          </p>
        </div>
      </section>

      {/* 05 — CLASSMATE DIRECTORY (DIGITAL YEARBOOK PREVIEW) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#C5A059] uppercase tracking-widest">
              Digital Yearbook
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#002147]">
              Classmate Directory
            </h2>
          </div>
          <button
            onClick={() => onNavigate('directory')}
            className="text-xs font-bold text-[#002147] hover:text-[#C5A059] flex items-center gap-1.5 transition-colors"
          >
            <span>View All Classmates ({stats.verifiedMembers})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {featuredMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/90 flex flex-col justify-between hover:shadow-lg transition-all group"
            >
              <div className="flex items-start gap-4">
                {member.profilePhotoUrl ? (
                  <img
                    src={member.profilePhotoUrl}
                    alt={member.fullName}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-[#C5A059] shadow-sm shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-[#002147] text-[#C5A059] font-serif font-bold text-xl flex items-center justify-center shrink-0">
                    {member.fullName?.charAt(0)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-[#002147] truncate group-hover:text-[#C5A059] transition-colors">
                      {member.fullName}
                    </h4>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    @{member.username || member.memberId}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold">
                    <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                      Roll {member.rollNumber}
                    </span>
                    <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded">
                      {member.groupStream}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  {member.memberId}
                </span>
                <button
                  onClick={() => onSelectMember(member)}
                  className="text-xs font-bold text-[#002147] hover:text-[#C5A059] transition-colors"
                >
                  View Profile →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 06 — MEMORIES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#C5A059] uppercase tracking-widest">
              Photo Archive
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#002147]">
              School Memories
            </h2>
          </div>
          <button
            onClick={() => onNavigate('gallery')}
            className="text-xs font-bold text-[#002147] hover:text-[#C5A059] flex items-center gap-1.5 transition-colors"
          >
            <span>Explore All Photos</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {memories.map((m) => (
            <div
              key={m.id}
              onClick={() => onNavigate('gallery')}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer hover:shadow-lg transition-all group"
            >
              <div className="h-48 overflow-hidden bg-slate-100 relative">
                <img
                  src={m.imageUrl}
                  alt={m.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 bg-[#002147]/80 backdrop-blur-sm text-[#C5A059] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  {m.category}
                </span>
              </div>
              <div className="p-4 space-y-1">
                <h4 className="font-bold text-sm text-[#002147] group-hover:text-[#C5A059] transition-colors line-clamp-1">
                  {m.title}
                </h4>
                {m.caption && (
                  <p className="text-xs text-slate-500 line-clamp-2 italic">
                    "{m.caption}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 07 — FUTURE REUNION TEASER */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="bg-[#F8FAFC] border-2 border-dashed border-[#C5A059]/50 rounded-3xl p-8 sm:p-10 text-center space-y-3">
          <div className="w-10 h-10 mx-auto rounded-full bg-amber-50 text-[#C5A059] flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5 text-[#C5A059]" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-serif text-[#002147]">
            "Our Reunion Story Is Yet to Be Written..."
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Official gathering schedules, reunion programs, commemorative souvenir kits, and event registration will be activated here in the future once the committee finalizes plans.
          </p>
          <div className="pt-2">
            <span className="text-[11px] font-bold text-[#002147] uppercase tracking-wider bg-white px-3 py-1 rounded-full border border-slate-200">
              Future Reunion Module — Coming Soon
            </span>
          </div>
        </div>
      </section>

      {/* 08 — FINAL CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#002147] via-[#001733] to-[#002147] rounded-3xl p-8 sm:p-12 text-white text-center shadow-xl border border-[#C5A059]/40 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#C5A059] text-[#002147] flex items-center justify-center mx-auto shadow-md">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-white max-w-md mx-auto leading-tight">
            Let's Preserve Our Memories Together.
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Fill in your name, roll number, group, and a photo to receive your unique username and be preserved in our classmate directory.
          </p>
          <div className="pt-2">
            <button
              onClick={onOpenRegister}
              className="px-8 py-3.5 bg-gradient-to-r from-[#C5A059] to-[#DFBF7D] text-[#002147] font-extrabold text-sm rounded-xl shadow-lg hover:brightness-105 transition-all"
            >
              Join SSC 2023 Memory Book
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
