import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

// Control the auth state the app sees.
const authState = { user: null, loading: true, recovering: false, signOut: vi.fn() }
vi.mock('./auth.jsx', () => ({
  useAuth: () => authState,
  AuthProvider: ({ children }) => children,
}))

// Keep the data layer and Supabase client out of these render tests.
vi.mock('./dataStore.js', () => ({
  listReports: vi.fn(async () => []),
  saveReport: vi.fn(),
  deleteReport: vi.fn(),
  clearAllReports: vi.fn(),
}))
vi.mock('./supabaseClient.js', () => ({
  supabase: { auth: {} },
  isSupabaseConfigured: true,
  setRememberMe: vi.fn(),
  appUrl: () => 'http://localhost/',
}))

import App from './App.jsx'

beforeEach(() => {
  authState.user = null
  authState.loading = true
  authState.recovering = false
})

describe('App auth gating', () => {
  it('shows the splash while auth is loading', () => {
    authState.loading = true
    const html = renderToStaticMarkup(<App />)
    expect(html).toContain('splash')
    expect(html).not.toContain('auth-card')
  })

  it('shows the auth screen when signed out', () => {
    authState.loading = false
    authState.user = null
    const html = renderToStaticMarkup(<App />)
    expect(html).toContain('auth-card')
    expect(html).toContain('Welcome back')
  })

  it('shows the reset-password screen during recovery', () => {
    authState.loading = false
    authState.recovering = true
    const html = renderToStaticMarkup(<App />)
    expect(html).toContain('Set a new password')
  })

  it('renders the app shell when signed in', () => {
    authState.loading = false
    authState.user = { id: 'u1' }
    const html = renderToStaticMarkup(<App />)
    expect(html).toContain('tabbar')
    expect(html).not.toContain('auth-card')
  })
})
