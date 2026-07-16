import { useAuth, useUser } from "@clerk/clerk-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEMO_BRAND_ID } from "../data/brands";
import { CLERK_PUBLISHABLE_KEY, getStoredDemoSession, isDemoLoginEnabled, setStoredDemoSession } from "./authConfig";

const AuthContext = createContext(null);

function selectDemoWorkspace() {
  try {
    localStorage.setItem("teviq:selectedBrandId", DEMO_BRAND_ID);
  } catch {
    // Best-effort demo workspace selection.
  }
}

function useDemoSessionState() {
  const [isDemoSession, setIsDemoSession] = useState(getStoredDemoSession);

  useEffect(() => {
    if (!isDemoLoginEnabled) {
      setStoredDemoSession(false);
      if (isDemoSession) setIsDemoSession(false);
    }
  }, [isDemoSession]);

  const startDemoSession = useCallback(() => {
    if (!isDemoLoginEnabled) return;
    setStoredDemoSession(true);
    setIsDemoSession(true);
    selectDemoWorkspace();
  }, []);

  const stopDemoSession = useCallback(() => {
    setStoredDemoSession(false);
    setIsDemoSession(false);
  }, []);

  return { isDemoSession, startDemoSession, stopDemoSession };
}

function DemoOnlyAuthProvider({ children }) {
  const { isDemoSession, startDemoSession, stopDemoSession } = useDemoSessionState();

  const value = useMemo(
    () => ({
      authError: "",
      clerkConfigured: false,
      isLoaded: true,
      isAuthenticated: isDemoSession,
      isDemoSession,
      isDemoLoginEnabled,
      user: null,
      getAuthToken: async () => null,
      refreshUser: async () => {},
      startDemoSession,
      signOut: stopDemoSession
    }),
    [isDemoSession, startDemoSession, stopDemoSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function ClerkAuthProvider({ children }) {
  const { getToken, isLoaded, isSignedIn, signOut: clerkSignOut } = useAuth();
  const { user } = useUser();
  const { isDemoSession, startDemoSession, stopDemoSession } = useDemoSessionState();

  useEffect(() => {
    if (isSignedIn) {
      setStoredDemoSession(false);
      if (isDemoSession) stopDemoSession();
    }
  }, [isSignedIn, isDemoSession, stopDemoSession]);

  const value = useMemo(
    () => ({
      authError: "",
      clerkConfigured: true,
      isLoaded,
      isAuthenticated: Boolean(isSignedIn) || isDemoSession,
      isDemoSession,
      isDemoLoginEnabled,
      user,
      getAuthToken: async () => {
        if (isDemoSession || !isSignedIn) return null;
        const token = await getToken();
        if (token) return token;
        return getToken({ skipCache: true });
      },
      refreshUser: async () => {
        if (user?.reload) {
          await user.reload();
        }
      },
      startDemoSession,
      signOut: async () => {
        setStoredDemoSession(false);
        if (isDemoSession) {
          stopDemoSession();
          return;
        }

        await clerkSignOut();
      }
    }),
    [clerkSignOut, getToken, isDemoSession, isLoaded, isSignedIn, startDemoSession, stopDemoSession, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }) {
  if (!CLERK_PUBLISHABLE_KEY) {
    return <DemoOnlyAuthProvider>{children}</DemoOnlyAuthProvider>;
  }

  return <ClerkAuthProvider>{children}</ClerkAuthProvider>;
}

export function useTeviqAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useTeviqAuth must be used inside AuthProvider");
  }

  return context;
}
