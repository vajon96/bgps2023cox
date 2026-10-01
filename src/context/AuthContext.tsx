import React, { createContext, useContext, useEffect, useState } from 'react';
import { Profile, SchoolInfo, User } from '../types/index.ts';
import { safeFetchJson } from '../lib/api.ts';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  schoolInfo: SchoolInfo | null;
  token: string | null;
  features: Record<string, boolean>;
  isLoading: boolean;
  login: (username: string, pass: string) => Promise<{ success: boolean; error?: string; mustChangePassword?: boolean }>;
  changePassword: (newPass: string) => Promise<{ success: boolean; error?: string }>;
  quickLoginDemo: (type: 'super_admin' | 'verified_member' | 'pending_member') => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  refreshFeatures: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('bgps_auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [features, setFeatures] = useState<Record<string, boolean>>({
    member_directory: true,
    registration: true,
    gallery: true,
    events: false,
    payments: false,
    notices: false,
    reunion_registration: false,
    donations: false,
  });

  const refreshFeatures = async () => {
    try {
      const data = await safeFetchJson<{ dict?: Record<string, boolean> }>('/api/features');
      if (data?.dict) setFeatures(data.dict);
    } catch (e: any) {
      console.warn('Features fetch notice:', e?.message);
    }
  };

  const fetchCurrentUser = async (authToken: string) => {
    try {
      const data = await safeFetchJson<{ user: User; profile: Profile; schoolInfo: SchoolInfo }>('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (data?.user) {
        setUser(data.user);
        setProfile(data.profile);
        setSchoolInfo(data.schoolInfo);
      } else {
        logout();
      }
    } catch (err: any) {
      console.warn('Current user notice:', err?.message);
      // If token expired or invalid, log out cleanly
      if (err?.message && (err.message.includes('401') || err.message.includes('403') || err.message.includes('Unauthorized'))) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshFeatures();
    if (token) {
      fetchCurrentUser(token);
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (username: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await safeFetchJson<{
        token: string;
        user: User;
        profile: Profile;
        schoolInfo: SchoolInfo;
        mustChangePassword?: boolean;
      }>('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: pass }),
      });

      setToken(data.token);
      localStorage.setItem('bgps_auth_token', data.token);
      setUser(data.user);
      setProfile(data.profile);
      setSchoolInfo(data.schoolInfo);
      setIsLoading(false);
      return { success: true, mustChangePassword: data.mustChangePassword };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const changePassword = async (newPassword: string) => {
    if (!token) return { success: false, error: 'Not authenticated' };
    try {
      await safeFetchJson('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      if (user) {
        setUser({ ...user, mustChangePassword: false });
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to change password' };
    }
  };

  const quickLoginDemo = async (type: 'super_admin' | 'verified_member' | 'pending_member') => {
    let uName = 'tahsin.ahmed'; // super admin
    if (type === 'verified_member') {
      uName = 'nuzhat.fatima';
    } else if (type === 'pending_member') {
      uName = 'shahriar.kabir';
    }
    await login(uName, 'bgps2023');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setProfile(null);
    setSchoolInfo(null);
    localStorage.removeItem('bgps_auth_token');
  };

  const refreshProfile = async () => {
    if (token) {
      await fetchCurrentUser(token);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        schoolInfo,
        token,
        features,
        isLoading,
        login,
        changePassword,
        quickLoginDemo,
        logout,
        refreshProfile,
        refreshFeatures,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
