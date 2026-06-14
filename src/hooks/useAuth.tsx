'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { dbService } from '../lib/db';
import { Profile, UserRole } from '../types';

interface AuthSession {
  user: {
    id: string;
    email: string;
    full_name?: string;
  } | null;
}

interface AuthContextType {
  user: AuthSession['user'];
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthSession['user']>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to load profile
  const fetchProfile = async (userId: string) => {
    try {
      const p = await dbService.getProfile(userId);
      setProfile(p);
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    let authSubscription: any = null;

    const initAuth = async () => {
      try {
        if (isSupabaseConfigured()) {
          // Supabase Auth Init
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || ''
            });
            await fetchProfile(session.user.id);
          }

          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              if (session?.user) {
                setUser({
                  id: session.user.id,
                  email: session.user.email || '',
                  full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || ''
                });
                await fetchProfile(session.user.id);
              } else {
                setUser(null);
                setProfile(null);
              }
              setLoading(false);
            }
          );
          authSubscription = subscription;
        } else {
          // Fallback Local Storage Auth Init
          if (typeof window !== 'undefined') {
            const savedSession = localStorage.getItem('ecotrack_session');
            if (savedSession) {
              const sessionObj = JSON.parse(savedSession);
              setUser(sessionObj.user);
              await fetchProfile(sessionObj.user.id);
            }
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setLoading(false);
      } finally {
        if (isSupabaseConfigured()) {
          // Keep loading true until auth event triggers it to false
        } else {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        const usr = {
          id: data.user.id,
          email: data.user.email || '',
          full_name: data.user.user_metadata?.full_name || ''
        };
        setUser(usr);
        await fetchProfile(data.user.id);
        return { error: null };
      } else {
        // Local fallback auth flow
        // Check credentials against hardcoded test accounts or register dynamically
        let userId = 'user-id-1'; // Elena Rostova
        let role: UserRole = 'user';
        let fullName = 'Elena Rostova';

        if (email.toLowerCase() === 'admin@ecotrack.ai') {
          userId = 'admin-id-1';
          role = 'admin';
          fullName = 'EcoTrack Administrator';
        } else if (email.toLowerCase() === 'solar.warrior@ecotrack.ai') {
          userId = 'user-id-2';
          role = 'user';
          fullName = 'Marcus Chen';
        } else {
          // Log in any generic email as a new user if it doesn't match
          userId = `usr-${email.replace(/[^a-zA-Z0-9]/g, '')}`;
          role = 'user';
          fullName = email.split('@')[0];
        }

        const fallbackUser = { id: userId, email, full_name: fullName };
        
        // Save/Sync profile in localStorage
        const prof = await dbService.createOrUpdateProfile({
          id: userId,
          email,
          full_name: fullName,
          role,
        });

        setUser(fallbackUser);
        setProfile(prof);
        localStorage.setItem('ecotrack_session', JSON.stringify({ user: fallbackUser }));
        return { error: null };
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      return { error: err.message || 'Authentication failed' };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName
            }
          }
        });
        if (error) throw error;
        
        if (data.user) {
          const usr = {
            id: data.user.id,
            email: data.user.email || '',
            full_name: fullName
          };
          setUser(usr);
          // Wait for trigger or manually invoke profile creation
          const prof = await dbService.createOrUpdateProfile({
            id: data.user.id,
            email,
            full_name: fullName,
            role: 'user'
          });
          setProfile(prof);
        }
        return { error: null };
      } else {
        // Fallback local sign up
        const userId = `usr-${Date.now()}`;
        const fallbackUser = { id: userId, email, full_name: fullName };
        
        const prof = await dbService.createOrUpdateProfile({
          id: userId,
          email,
          full_name: fullName,
          role: 'user',
          green_points: 0,
          sustainability_level: 'Eco Beginner'
        });

        setUser(fallbackUser);
        setProfile(prof);
        localStorage.setItem('ecotrack_session', JSON.stringify({ user: fallbackUser }));
        return { error: null };
      }
    } catch (err: any) {
      console.error('Sign up error:', err);
      return { error: err.message || 'Sign up failed' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      } else {
        localStorage.removeItem('ecotrack_session');
      }
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
