import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  Briefcase,
  Building,
  CheckCircle,
  Copy,
  ExternalLink,
  Facebook,
  Globe,
  GraduationCap,
  Instagram,
  Linkedin,
  MapPin,
  MessageCircle,
  Share2,
  User,
  X,
} from 'lucide-react';

interface MemberProfileModalProps {
  member: any | null;
  onClose: () => void;
}

export const MemberProfileModal: React.FC<MemberProfileModalProps> = ({ member, onClose }) => {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!member) return null;

  const profileUrl = `${window.location.origin}/#member-${member.memberId}`;

  const copyProfileLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        {/* Cover / Header */}
        <div className="bg-gradient-to-r from-[#002147] via-[#001733] to-[#002147] h-32 relative flex items-start justify-end p-4 border-b border-[#C5A059]/40">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Avatar & Verification Badge */}
        <div className="px-6 relative -mt-16 pb-4">
          <div className="flex items-end justify-between">
            <div className="relative">
              {member.profilePhotoUrl ? (
                <img
                  src={member.profilePhotoUrl}
                  alt={member.fullName}
                  className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-xl bg-slate-100"
                />
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-[#002147] to-[#C5A059] border-4 border-white shadow-xl flex items-center justify-center text-white text-3xl font-serif font-bold">
                  {member.fullName?.charAt(0) || 'B'}
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full shadow-md border-2 border-white" title="Verified Member">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Batch Member</span>
              </span>
              <div className="mt-1 font-mono font-extrabold text-sm text-[#002147] tracking-wider">
                {member.memberId}
              </div>
            </div>
          </div>

          {/* Name & Title */}
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-[#002147] font-serif">
              {member.fullName}
            </h3>
            {member.nickname && (
              <p className="text-xs text-slate-500 font-medium">({member.nickname})</p>
            )}
            <p className="text-sm font-semibold text-[#C5A059] mt-0.5">
              {member.profession || 'SSC 2023 Batchmate'}
            </p>
          </div>

          {/* School Badge Box */}
          <div className="mt-5 p-3.5 bg-[#F7F8FA] rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#002147]">
              <GraduationCap className="w-4 h-4 text-[#C5A059]" />
              <span>Border Guard Public School, Cox's Bazar</span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-2xs">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">SSC Batch</span>
                <span className="text-xs font-bold text-slate-800">2023</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-2xs">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">School Roll</span>
                <span className="text-xs font-bold text-[#002147]">{member.rollNumber}</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-2xs">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Group & Sec</span>
                <span className="text-xs font-bold text-slate-800 truncate block">
                  {member.groupStream} ({member.section || 'A'})
                </span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="mt-5 space-y-3 text-xs text-slate-600">
            {member.currentCity && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Lives in <strong>{member.currentCity}</strong>, {member.currentCountry || 'Bangladesh'}</span>
              </div>
            )}
            {member.universityCollege && (
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Studying / Studied at <strong>{member.universityCollege}</strong></span>
              </div>
            )}
            {member.organization && (
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Works at <strong>{member.organization}</strong></span>
              </div>
            )}
          </div>

          {/* Bio */}
          {member.bio && (
            <div className="mt-4 p-3 bg-amber-50/40 rounded-xl border border-amber-100 text-xs text-slate-700 italic leading-relaxed">
              "{member.bio}"
            </div>
          )}

          {/* Social Profiles (Respecting Privacy) */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Batch Connections
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {member.facebookUrl && (
                <a
                  href={member.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                >
                  <Facebook className="w-3.5 h-3.5" />
                  <span>Facebook</span>
                </a>
              )}
              {member.instagramUrl && (
                <a
                  href={member.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>Instagram</span>
                </a>
              )}
              {member.linkedinUrl && (
                <a
                  href={member.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-blue-50 text-blue-800 hover:bg-blue-100 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>LinkedIn</span>
                </a>
              )}
              {member.whatsappNumber && (
                <a
                  href={`https://wa.me/${member.whatsappNumber.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          </div>

          {/* Social Share Bar */}
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Share2 className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Share Profile:</span>
            </span>
            <div className="flex items-center gap-2">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Meet ${member.fullName} (${member.memberId}), BGPS SSC 2023 Batchmate: ${profileUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] font-medium"
              >
                WhatsApp
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] font-medium"
              >
                Facebook
              </a>
              <button
                onClick={copyProfileLink}
                className="px-2 py-1 bg-[#002147] text-[#C5A059] rounded-lg text-[11px] font-bold flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
