import React from 'react';
import { Award, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#001733] text-slate-300 border-t border-[#C5A059]/30 pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C5A059] to-[#002147] p-0.5 shadow-md flex items-center justify-center">
                <div className="w-full h-full bg-[#002147] rounded-[10px] flex items-center justify-center text-[#C5A059]">
                  <Award className="w-7 h-7" />
                </div>
              </div>
              <div>
                <span className="block font-bold text-white text-base tracking-wide leading-tight">
                  BGPS COX'S BAZAR
                </span>
                <span className="text-xs text-[#C5A059] font-medium tracking-wider uppercase">
                  SSC Batch 2023
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed italic">
              "Old Memories. New Connections. One Batch."
            </p>
            <p className="text-xs text-slate-400">
              The official centralized platform for Border Guard Public School, Cox's Bazar SSC 2023 alumni to reconnect, verify, share memories, and join our grand reunions.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-l-2 border-[#C5A059] pl-2">
              Platform Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-[#C5A059] transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('directory')}
                  className="hover:text-[#C5A059] transition-colors"
                >
                  Batch Directory (Verified Members)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('events')}
                  className="hover:text-[#C5A059] transition-colors"
                >
                  Reunion Events & Tickets
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('notices')}
                  className="hover:text-[#C5A059] transition-colors"
                >
                  Official Notices
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('gallery')}
                  className="hover:text-[#C5A059] transition-colors"
                >
                  Memories & School Photos
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & Venue */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-l-2 border-[#C5A059] pl-2">
              School & Committee
            </h4>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C5A059] shrink-0 mt-1" />
                <span className="text-xs text-slate-300">
                  Border Guard Public School, BGB Sector Headquarter, Cox's Bazar, Bangladesh
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span className="text-xs text-slate-300">+880 1819-876543 / +880 1711-234567</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span className="text-xs text-slate-300">bgps.ssc2023@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Col 4: Verified Payment Channels */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-l-2 border-[#C5A059] pl-2">
              Payment Methods
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Official payment submissions require both Transaction ID and screenshot confirmation:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              <div className="bg-[#002147] border border-slate-700/60 rounded-lg p-2 flex items-center gap-2 text-pink-400">
                <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                <span>bKash (Send Money)</span>
              </div>
              <div className="bg-[#002147] border border-slate-700/60 rounded-lg p-2 flex items-center gap-2 text-orange-400">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                <span>Nagad (Personal)</span>
              </div>
              <div className="bg-[#002147] border border-slate-700/60 rounded-lg p-2 flex items-center gap-2 text-purple-400">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span>Rocket DBBL</span>
              </div>
              <div className="bg-[#002147] border border-slate-700/60 rounded-lg p-2 flex items-center gap-2 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Bank Deposit</span>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[#C5A059]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Manual Admin Verification Enforced</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2023–2026 Border Guard Public School, Cox's Bazar — SSC Batch 2023 Reunion Committee. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('admin')} className="text-slate-400 hover:text-[#C5A059] transition-colors">
              Admin Portal
            </button>
            <span>•</span>
            <span className="text-[#C5A059] font-medium">BGPS Alumni Network</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
