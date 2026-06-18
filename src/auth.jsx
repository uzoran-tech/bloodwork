import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, setRememberMe, appUrl } from './supabaseClient.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  // True while the user is on a password-recovery link and must set a new password.
  const [recovering, setRecovering] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s)
      setLoading(false)
      if (event === 'PASSWORD_RECOVERY') setRecovering(true)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    recovering,
    signUp: (email, password) =>
      supabase.auth.signUp({ email, password, options: { emailRedirectTo: appUrl() } }),
    signIn: (email, password, remember) => {
      setRememberMe(remember)
      return supabase.auth.signInWithPassword({ email, password })
    },
    signOut: () => supabase.auth.signOut(),
    requestPasswordReset: (email) =>
      supabase.auth.resetPasswordForEmail(email, { redirectTo: appUrl() }),
    updatePassword: async (password) => {
      const res = await supabase.auth.updateUser({ password })
      if (!res.error) setRecovering(false)
      return res
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
