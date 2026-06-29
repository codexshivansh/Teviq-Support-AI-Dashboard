export const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "";

export const isDemoLoginEnabled =
  !import.meta.env.PROD &&
  (import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO_LOGIN === "true");

export const DEMO_SESSION_KEY = "teviq:demoSession";

export function getStoredDemoSession() {
  if (!isDemoLoginEnabled) return false;

  try {
    return localStorage.getItem(DEMO_SESSION_KEY) === "true";
  } catch {
    return false;
  }
}

export function setStoredDemoSession(enabled) {
  try {
    if (enabled) {
      localStorage.setItem(DEMO_SESSION_KEY, "true");
    } else {
      localStorage.removeItem(DEMO_SESSION_KEY);
    }
  } catch {
    // Demo mode should not fail if storage is unavailable.
  }
}
