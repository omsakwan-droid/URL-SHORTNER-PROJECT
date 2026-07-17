import { useState } from 'react'
import { api, ApiError } from '../lib/api'
import TerminalWindow from './TerminalWindow'

const inputClass =
  'w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-amber)] focus:ring-1 focus:ring-[var(--color-amber)]/40 transition-colors'

const labelClass = 'text-xs text-[var(--color-mint)] mb-1 block'

export default function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [form, setForm] = useState({ firstname: '', lastname: '', email: '', password: '' })
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [loading, setLoading] = useState(false)

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  function switchMode(next) {
    setMode(next)
    setError(null)
    setNotice(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setNotice(null)
    setLoading(true)
    try {
      if (mode === 'signup') {
        await api.signup(form)
        setNotice('account created — you can log in now')
        setMode('login')
        setForm((f) => ({ ...f, password: '' }))
      } else {
        const { token } = await api.login({ email: form.email, password: form.password })
        onAuthenticated(token)
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md fade-up">
        <div className="mb-6 text-center">
          <h1 className="text-xl sm:text-2xl font-semibold text-[var(--color-text)] tracking-tight">
            <span className="text-[var(--color-amber)]">short</span>
            <span className="text-[var(--color-mint)]">nr</span>
            <span className="text-[var(--color-text-dim)]">://</span>
          </h1>
          <p className="text-xs text-[var(--color-text-dim)] mt-1">
            a link shortener that lives in the terminal
          </p>
        </div>

        <TerminalWindow title={mode === 'login' ? 'guest@shortnr:~$ login' : 'guest@shortnr:~$ signup'}>
          <div className="flex gap-1 mb-5 border border-[var(--color-border)] rounded p-1 text-xs">
            <button
              onClick={() => switchMode('login')}
              className={`flex-1 rounded py-1.5 transition-colors ${
                mode === 'login'
                  ? 'bg-[var(--color-amber)]/15 text-[var(--color-amber-bright)]'
                  : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
              }`}
            >
              login
            </button>
            <button
              onClick={() => switchMode('signup')}
              className={`flex-1 rounded py-1.5 transition-colors ${
                mode === 'signup'
                  ? 'bg-[var(--color-mint)]/15 text-[var(--color-mint-bright)]'
                  : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
              }`}
            >
              signup
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>--firstname</label>
                  <input
                    required
                    className={inputClass}
                    value={form.firstname}
                    onChange={update('firstname')}
                    placeholder="om"
                  />
                </div>
                <div>
                  <label className={labelClass}>--lastname</label>
                  <input
                    className={inputClass}
                    value={form.lastname}
                    onChange={update('lastname')}
                    placeholder="optional"
                  />
                </div>
              </div>
            )}

            <div>
              <label className={labelClass}>--email</label>
              <input
                required
                type="email"
                className={inputClass}
                value={form.email}
                onChange={update('email')}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className={labelClass}>--password</label>
              <input
                required
                type="password"
                minLength={3}
                className={inputClass}
                value={form.password}
                onChange={update('password')}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-xs text-[var(--color-danger)] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 rounded px-3 py-2">
                error: {error}
              </p>
            )}
            {notice && (
              <p className="text-xs text-[var(--color-mint-bright)] border border-[var(--color-mint)]/30 bg-[var(--color-mint)]/5 rounded px-3 py-2">
                {notice}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-[var(--color-amber)] hover:bg-[var(--color-amber-bright)] disabled:opacity-50 text-[#1a1300] font-medium text-sm py-2.5 transition-colors"
            >
              {loading ? 'running…' : mode === 'login' ? 'run login' : 'run signup'}
            </button>
          </form>
        </TerminalWindow>
      </div>
    </div>
  )
}
