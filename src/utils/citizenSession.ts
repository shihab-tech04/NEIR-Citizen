import type { UserSession } from '../types.ts';

/** Browser-only persistence for synthetic NEIR citizens. Not a server auth credential. */
export const CITIZEN_SESSION_KEY = 'neir-citizen-demo-session-v1';

type StoredCitizen = {
  version: 1;
  mobile: string;
  name: string;
};

function parseStoredCitizen(raw: string | null): StoredCitizen | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') return null;
    const data = value as Record<string, unknown>;
    if (data.version !== 1 ||
        typeof data.mobile !== 'string' || !/^01\d{9}$/.test(data.mobile) ||
        typeof data.name !== 'string' || !data.name.trim() || data.name.length > 100) return null;
    return { version: 1, mobile: data.mobile, name: data.name };
  } catch {
    return null;
  }
}

/** Restore only UI identity; never save passwords, registration files or NID details. */
export function restoreCitizenSession(base: UserSession): UserSession {
  if (typeof window === 'undefined') return base;
  try {
    const raw = window.localStorage.getItem(CITIZEN_SESSION_KEY);
    const stored = parseStoredCitizen(raw);
    if (!stored) {
      if (raw !== null) window.localStorage.removeItem(CITIZEN_SESSION_KEY);
      return base;
    }
    return {
      ...base,
      isLoggedIn: true,
      mobile: stored.mobile,
      name: stored.name,
      nameBangla: '',
      nid: 'DEMO-NID',
      email: '',
      registeredHandsets: [],
    };
  } catch {
    return base;
  }
}

/** Persist after the existing successful sign-in flow; leave session without an expiry. */
export function rememberCitizenSession(session: UserSession): void {
  if (typeof window === 'undefined') return;
  if (!session.isLoggedIn || !/^01\d{9}$/.test(session.mobile) ||
      !session.name.trim() || session.name.length > 100) return;
  try {
    const stored: StoredCitizen = { version: 1, mobile: session.mobile, name: session.name };
    window.localStorage.setItem(CITIZEN_SESSION_KEY, JSON.stringify(stored));
  } catch {
    // If storage is unavailable, the current-tab demo session still works.
  }
}

export function forgetCitizenSession(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(CITIZEN_SESSION_KEY);
  } catch {
    // Browser storage may be disabled.
  }
}
