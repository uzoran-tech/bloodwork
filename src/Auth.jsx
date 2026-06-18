import { useState } from 'react'
import { useAuth } from './auth.jsx'
import { isSupabaseConfigured } from './supabaseClient.js'
import { IconDrop } from './components/Icons.jsx'

const MIN_PW = 8

export default function Auth({ mode: initialMode = 'login' }) {
  const auth = useAuth()
  const [mode, setMode] = useState(initialMode) // login | signup | forgot | reset
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [remember, setRemember] = useState(true)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null) // { tone, text }

  async function submit(e) {
    e.preventDefault()
    setMsg(null)
    if (!isSupabaseConfigured && mode !== 'reset') {
      return setMsg({ tone: 'warn', text: 'The cloud backend is not configured yet.' })
    }
    if ((mode === 'signup' || mode === 'reset') && password.length < MIN_PW) {
      return setMsg({ tone: 'warn', text: `Password must be at least ${MIN_PW} characters.` })
    }
    if ((mode === 'signup' || mode === 'reset') && password !== confirm) {
      return setMsg({ tone: 'warn', text: 'Passwords do not match.' })
    }
    setBusy(true)
    try {
      if (mode === 'login') {
        const { error } = await auth.signIn(email, password, remember)
        if (error) setMsg({ tone: 'warn', text: 'Invalid email or password.' })
      } else if (mode === 'signup') {
        const { error } = await auth.signUp(email, password)
        if (error) setMsg({ tone: 'warn', text: error.message })
        else setMsg({ tone: 'good', text: 'Account created. Check your email to confirm, then sign in.' })
      } else if (mode === 'forgot') {
        await auth.requestPasswordReset(email)
        setMsg({ tone: 'good', text: 'If an account exists for that email, a reset link is on its way.' })
      } else if (mode === 'reset') {
        const { error } = await auth.updatePassword(password)
        if (error) setMsg({ tone: 'warn', text: error.message })
        // success drops `recovering` → app renders automatically
      }
    } catch (err) {
      setMsg({ tone: 'warn', text: err?.message || 'Something went wrong. Please try again.' })
    } finally {
      setBusy(false)
    }
  }

  const titles = {
    login: 'Welcome back',
    signup: 'Create your account',
    forgot: 'Reset your password',
    reset: 'Set a new password',
  }
  const cta = { login: 'Sign in', signup: 'Create account', forgot: 'Send reset link', reset: 'Save password' }

  function go(next) {
    setMsg(null)
    setPassword('')
    setConfirm('')
    setMode(next)
  }

  return (
    <div className="auth">
      <div className="auth-card">
        <div className="auth-brand">
          <IconDrop size={40} />
          <span>BloodTrack</span>
        </div>
        <h1 className="auth-title">{titles[mode]}</h1>

        {msg && <p className={`feedback ${msg.tone}`}>{msg.text}</p>}

        <form className="auth-form" onSubmit={submit}>
          {mode !== 'reset' && (
            <label>
              Email
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>
          )}

          {mode !== 'forgot' && (
            <label>
              {mode === 'reset' ? 'New password' : 'Password'}
              <input
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'login' ? 'Your password' : `At least ${MIN_PW} characters`}
              />
            </label>
          )}

          {(mode === 'signup' || mode === 'reset') && (
            <label>
              Confirm password
              <input
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter password"
              />
            </label>
          )}

          {mode === 'login' && (
            <label className="auth-remember">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Remember me
            </label>
          )}

          <button className="btn primary" type="submit" disabled={busy}>
            {busy ? 'Please wait…' : cta[mode]}
          </button>
        </form>

        <div className="auth-links">
          {mode === 'login' && (
            <>
              <button className="link" onClick={() => go('forgot')}>
                Forgot your password?
              </button>
              <span>
                New here?{' '}
                <button className="link" onClick={() => go('signup')}>
                  Create an account
                </button>
              </span>
            </>
          )}
          {(mode === 'signup' || mode === 'forgot') && (
            <button className="link" onClick={() => go('login')}>
              ← Back to sign in
            </button>
          )}
        </div>
      </div>

      <p className="auth-foot">
        Your reports are stored privately in your account. This is not medical advice.
      </p>
    </div>
  )
}
