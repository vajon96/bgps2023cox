import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  Camera,
  CheckCircle,
  Clock,
  GraduationCap,
  LogOut,
  Menu,
  Shield,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenRegister: () => void;
  onOpenLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  onOpenRegister,
  onOpenLogin,
}) => {
  const { user, profile, features, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Dynamic Navigation Links based on active Feature Flags
  const navLinks = [
    { id: 'home', label: 'Home', show: true },
    { id: 'directory', label: 'Classmates', show: features.member_directory !== false },
    { id: 'gallery', label: 'Memories', show: features.gallery !== false },
    { id: 'about', label: 'Our Batch', show: true },
    // Future features only visible when enabled in Admin Feature Flags:
    { id: 'events', label: 'Reunion Events', show: features.events === true },
    { id: 'notices', label: 'Notices', show: features.notices === true },
  ].filter((link) => link.show);

  return (
    <header className="sticky top-0 z-50 bg-[#002147] text-white shadow-lg border-b border-[#C5A059]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Name */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 text-left focus:outline-none group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#C5A059] to-[#001733] p-0.5 shadow-md group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#002147] rounded-[10px] flex items-center justify-center text-[#C5A059]">
                <GraduationCap className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-wide text-white font-serif">
                  BGPS SSC 2023
                </span>
                <span className="bg-[#C5A059] text-[#002147] text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  Memory Book
                </span>
              </div>
              <span className="text-[11px] text-slate-300 tracking-wider font-medium block">
                Border Guard Public School, Cox's Bazar
              </span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  currentTab === link.id
                    ? 'text-[#C5A059] bg-white/10 shadow-sm font-bold'
                    : 'text-slate-200 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right Action buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 bg-white/10 hover:bg-white/15 px-3.5 py-1.5 rounded-full border border-[#C5A059]/40 transition-colors"
                >
                  {profile?.profilePhotoUrl ? (
                    <img
                      src={profile.profilePhotoUrl}
                      alt={profile.fullName}
                      className="w-8 h-8 rounded-full object-cover border border-[#C5A059]"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#C5A059] text-[#002147] font-bold text-xs flex items-center justify-center">
                      {profile?.fullName?.charAt(0) || user.username?.charAt(0).toUpperCase() || 'M'}
                    </div>
                  )}
                  <div className="text-left">
                    <div className="text-xs font-semibold text-white leading-tight">
                      {profile?.fullName || user.username}
                    </div>
                    <div className="text-[10px] text-[#C5A059] font-mono">
                      @{user.username || profile?.memberId}
                    </div>
                  </div>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 text-slate-800 py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs text-slate-400">Classmate Account</p>
                      <p className="text-sm font-bold text-slate-900">{profile?.fullName}</p>
                      <p className="text-xs font-mono text-[#002147] font-semibold mt-0.5">
                        @{user.username} • {profile?.memberId}
                      </p>
                      <div className="mt-2">
                        {profile?.verificationStatus === 'verified' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            Verified Classmate
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Pending Verification
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="py-1 text-sm">
                      <button
                        onClick={() => {
                          onNavigate('dashboard');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700"
                      >
                        <UserIcon className="w-4 h-4 text-[#002147]" />
                        <span>My Profile</span>
                      </button>

                      {(user.role === 'admin' || user.role === 'super_admin' || user.role === 'moderator') && (
                        <button
                          onClick={() => {
                            onNavigate('admin');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-amber-700 font-semibold"
                        >
                          <Shield className="w-4 h-4 text-[#C5A059]" />
                          <span>Admin Control Center</span>
                        </button>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                          onNavigate('home');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2.5 text-sm"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={onOpenLogin}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Member Login
                </button>
                <button
                  onClick={onOpenRegister}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-[#C5A059] to-[#DFBF7D] text-[#002147] hover:brightness-105 shadow-md shadow-[#C5A059]/20 transition-all flex items-center gap-1.5"
                >
                  <Award className="w-4 h-4" />
                  <span>Join Our Batch</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <button
                onClick={() => onNavigate('dashboard')}
                className="p-2 text-[#C5A059]"
                title="My Profile"
              >
                <UserIcon className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#001733] border-b border-[#C5A059]/30 px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-700/60">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium text-left ${
                  currentTab === link.id
                    ? 'text-[#C5A059] bg-white/10 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {user ? (
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  onNavigate('dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-4 bg-[#002147] border border-[#C5A059]/40 rounded-xl text-sm font-bold text-[#C5A059] flex items-center justify-center gap-2"
              >
                <UserIcon className="w-4 h-4" />
                <span>My Profile (@{user.username})</span>
              </button>
              {(user.role === 'admin' || user.role === 'super_admin' || user.role === 'moderator') && (
                <button
                  onClick={() => {
                    onNavigate('admin');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-4 bg-amber-500/20 border border-amber-500/40 rounded-xl text-sm font-bold text-amber-300 flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Panel</span>
                </button>
              )}
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  onNavigate('home');
                }}
                className="w-full py-2 px-4 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 text-center"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  onOpenLogin();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl text-sm font-semibold bg-white/10 text-white"
              >
                Login
              </button>
              <button
                onClick={() => {
                  onOpenRegister();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl text-sm font-bold bg-[#C5A059] text-[#002147]"
              >
                Join Our Batch
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
