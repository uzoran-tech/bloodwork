import { createClient } from '@supabase/supabase-js'

// VITE_* values are inlined at build time. They are public/safe (Row-Level
// Security is the real boundary). Falls back to placeholders so the app still
// builds/loads when the backend isn't configured yet.
const url = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
)

// "Remember me": route session storage to localStorage (persists across
// restarts) when the flag is set, else sessionStorage (cleared when the tab
// closes). The flag is set at sign-in time.
const PERSIST_KEY = 'bloodtrack.persist'

function store() {
  try {
    return localStorage.getItem(PERSIST_KEY) === '1' ? localStorage : sessionStorage
  } catch {
    return localStorage
  }
}

export function setRememberMe(remember) {
  try {
    if (remember) localStorage.setItem(PERSIST_KEY, '1')
    else localStorage.removeItem(PERSIST_KEY)
  } catch {
    /* storage unavailable */
  }
}

const rememberMeStorage = {
  getItem: (k) => store().getItem(k),
  setItem: (k, v) => store().setItem(k, v),
  removeItem: (k) => {
    // remove from both so a stale persisted session can't linger
    try {
      localStorage.removeItem(k)
    } catch {
      /* ignore */
    }
    try {
      sessionStorage.removeItem(k)
    } catch {
      /* ignore */
    }
  },
}

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // consumes the #access_token… hash on confirm/reset links
    storageKey: 'bloodtrack.auth',
    storage: rememberMeStorage,
  },
})

// Where Supabase should send confirm / password-reset links back to.
export const appUrl = () => window.location.origin + window.location.pathname
