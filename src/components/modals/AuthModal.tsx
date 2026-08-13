/**
 * AuthModal.tsx
 * ─────────────────────────────────────────────────────────────
 * Dedicated Supabase Authentication Modal:
 *   • Google OAuth 2.0 Sign In button with official branding
 *   • Email & Password Sign In and Registration
 *   • Opening & Closing exit/entry animations
 *   • Displays logged-in status & profile email
 *   • One-click Sign Out
 * ─────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Mail,
  KeyRound,
  UserCheck,
  LogOut,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useBuilderStore } from '../../store/useBuilderStore';
import { supabase } from '../../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { studioTheme } = useBuilderStore();
  const isLight = studioTheme === 'light';

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [user, setUser] = useState<any>(null);

  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  // Handle open / close animation states
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      checkUser();
    } else if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle ESC key press to trigger smooth close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleTriggerClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleTriggerClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 250);
  };

  const checkUser = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    } catch (e) {
      setUser(null);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) setErrorMsg(error.message);
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg('Please provide both email and password.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMsg(error.message);
        } else if (data.user) {
          setUser(data.user);
          setSuccessMsg(`Welcome back, ${data.user.email}!`);
          setTimeout(() => {
            handleTriggerClose();
          }, 1000);
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          setErrorMsg(error.message);
        } else if (data.user) {
          setUser(data.user);
          setSuccessMsg('Account created successfully! Cloud sync activated.');
          setTimeout(() => {
            handleTriggerClose();
          }, 1200);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
    setSuccessMsg('Signed out successfully.');
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[10000] flex items-center justify-center p-4 transition-all duration-300 select-none ${
        isClosing ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Backdrop with Fade Animation */}
      <div
        className={`absolute inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleTriggerClose}
      />

      {/* Modal Dialog with Scale & Bounce Pop Animation */}
      <div
        className={`relative w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden transform transition-all duration-300 ease-out ${
          isClosing
            ? 'scale-90 translate-y-4 opacity-0'
            : 'scale-100 translate-y-0 opacity-100'
        } ${
          isLight
            ? 'bg-white border-slate-200 text-slate-800'
            : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-bold tracking-tight">Velox Account & Cloud Sync</h3>
              <span className="text-[11px] text-slate-500 font-medium">
                {user ? 'Authenticated User Profile' : 'Sign in to enable persistent project cloud storage'}
              </span>
            </div>
          </div>
          <button
            onClick={handleTriggerClose}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 border-slate-300'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-800'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5">
          {user ? (
            /* Logged in View */
            <div className="flex flex-col items-center text-center space-y-4 py-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-inner">
                <UserCheck className="w-8 h-8" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Authenticated via Supabase
                </span>
                <span className="text-base font-bold truncate max-w-[260px] mt-0.5">{user.email}</span>
                <span className="text-[11px] text-slate-500 mt-1">
                  All your node additions, deletions & style edits are auto-saved to your personal cloud.
                </span>
              </div>

              {successMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold w-full animate-fade-in">
                  {successMsg}
                </div>
              )}

              <div className="w-full pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                <button
                  onClick={handleTriggerClose}
                  className="flex-1 py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Continue Editing
                </button>
                <button
                  onClick={handleSignOut}
                  disabled={loading}
                  className={`py-2 px-4 rounded-xl border font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isLight
                      ? 'bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 border-slate-300'
                      : 'bg-slate-950 hover:bg-red-950/40 text-slate-300 hover:text-red-400 border-slate-800'
                  }`}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            /* Auth Form (Sign In / Sign Up) */
            <div className="space-y-4">
              {/* Official Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className={`w-full py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 ${
                  isLight
                    ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-600'
                }`}
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-2">
                <div className={`w-full border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`} />
                <span className={`absolute px-2 text-[10px] font-semibold uppercase tracking-wider ${
                  isLight ? 'bg-white text-slate-400' : 'bg-slate-900 text-slate-500'
                }`}>
                  or with email
                </span>
              </div>

              {/* Tab Switcher */}
              <div
                className={`grid grid-cols-2 p-1 rounded-xl border text-xs font-semibold ${
                  isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}
              >
                <button
                  onClick={() => {
                    setMode('signin');
                    setErrorMsg('');
                  }}
                  className={`py-1.5 rounded-lg transition-all ${
                    mode === 'signin'
                      ? 'bg-indigo-600 text-white shadow-sm font-bold'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg('');
                  }}
                  className={`py-1.5 rounded-lg transition-all ${
                    mode === 'signup'
                      ? 'bg-indigo-600 text-white shadow-sm font-bold'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Register Account
                </button>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold leading-relaxed">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleAuth} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-indigo-500" /> Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-indigo-500 font-medium ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-slate-950 border-slate-700 text-slate-100'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-indigo-500" /> Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-indigo-500 font-medium ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-slate-950 border-slate-700 text-slate-100'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 mt-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {loading ? (
                    <span>Processing...</span>
                  ) : mode === 'signin' ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      Sign In & Sync Cloud
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Create Account
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
