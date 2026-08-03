'use client';

import {
     createContext,
     useCallback,
     useContext,
     useEffect,
     useMemo,
     useState,
     type ReactNode,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { supabaseBrowser } from '@/services/supabase-browser';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export type AuthViewer = {
     id: string;
     email: string;
     avatar: string | null;
};

type AuthContextValue = {
     status: AuthStatus;
     viewer: AuthViewer | null;
     refresh: () => Promise<void>;
     signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
     const context = useContext(AuthContext);

     if (!context) {
          throw new Error('useAuth must be used inside <AuthProvider>');
     }

     return context;
}

function mapUserToViewer(user: User): AuthViewer {
     const metadata = user.user_metadata ?? {};

     return {
          id: user.id,
          email: user.email ?? '',
          avatar:
               metadata.avatar_url ??
               metadata.picture ??
               null,
     };
}

export function AuthProvider({
     children,
}: {
     children: ReactNode;
}) {
     const [status, setStatus] = useState<AuthStatus>('loading');
     const [viewer, setViewer] = useState<AuthViewer | null>(null);

     const updateAuthState = useCallback((user: User | null) => {
          if (user) {
               setViewer(mapUserToViewer(user));
               setStatus('authenticated');
               return;
          }

          setViewer(null);
          setStatus('unauthenticated');
     }, []);

     const refresh = useCallback(async () => {
          const {
               data: { user },
               error,
          } = await supabaseBrowser.auth.getUser();

          if (error) {
               console.error('[AuthProvider] Unable to retrieve user:', error);
               updateAuthState(null);
               return;
          }

          updateAuthState(user);
     }, [updateAuthState]);

     const signOut = useCallback(async () => {
          const { error } = await supabaseBrowser.auth.signOut();

          if (error) {
               console.error('[AuthProvider] Sign-out failed:', error);
               throw error;
          }

          updateAuthState(null);
     }, [updateAuthState]);

     useEffect(() => {
          void refresh();

          const {
               data: { subscription },
          } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
               updateAuthState(session?.user ?? null);
          });

          return () => {
               subscription.unsubscribe();
          };
     }, [refresh, updateAuthState]);

     const value = useMemo(
          () => ({
               status,
               viewer,
               refresh,
               signOut,
          }),
          [status, viewer, refresh, signOut]
     );

     return (
          <AuthContext.Provider value={value}>
               {children}
          </AuthContext.Provider>
     );
}