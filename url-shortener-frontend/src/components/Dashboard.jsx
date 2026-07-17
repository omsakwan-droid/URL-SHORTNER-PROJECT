import { useEffect, useState } from 'react'
import { api, ApiError, BASE_URL } from '../lib/api'
import TerminalWindow from './TerminalWindow'

function shortLink(shortCode) {
  return `${BASE_URL}/${shortCode}`
}

export default function Dashboard({ token, onLogout }) {
  const [codes, setCodes] = useState([])
  const [loadingList, setLoadingList] = useState(true)
  const [listError, setListError] = useState(null)

  const [url, setUrl] = useState('')
  const [customCode, setCustomCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  async function loadCodes() {
    setLoadingList(true)
    setListError(null)
    try {
      const data = await api.listCodes({ token })
      setCodes(data.codes || [])
    } catch (err) {
      setListError(err instanceof ApiError ? err.message : 'failed to load links')
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => {
    loadCodes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleShorten(e) {
    e.preventDefault()
    setFormError(null)
    setSubmitting(true)
    try {
      const result = await api.shorten({ url, code: customCode.trim() || undefined, token })
      setCodes((prev) => [
        { id: result.id, shortCode: result.shortCode, targetURL: result.targetURL, createdAt: new Date().toISOString() },
        ...prev,
      ])
      setUrl('')
      setCustomCode('')
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'failed to shorten url')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    const prev = codes
    setCodes((c) => c.filter((item) => item.id !== id))
    try {
      await api.deleteCode({ id, token })
    } catch {
      setCodes(prev) // roll back on failure
    }
  }

  async function handleCopy(id, link) {
    try {
      await navigator.clipboard.writeText(link)
      setCopiedId(id)
      setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1500)
    } catch {
      // clipboard access denied — silently ignore
    }
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight">
            <span className="text-[var(--color-amber)]">short</span>
            <span className="text-[var(--color-mint)]">nr</span>
            <span className="text-[var(--color-text-dim)]">://</span>
          </h1>
          <button
            onClick={onLogout}
            className="text-xs text-[var(--color-text-dim)] hover:text-[var(--color-danger)] transition-colors"
          >
            logout
          </button>
        </div>

        <TerminalWindow title="user@shortnr:~$ shorten">
          <form onSubmit={handleShorten} className="space-y-3">
            <div>
              <label className="text-xs text-[var(--color-mint)] mb-1 block">--url</label>
              <input
                required
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/some/very/long/path"
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded px-3 py-2 text-sm placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-amber)] focus:ring-1 focus:ring-[var(--color-amber)]/40 transition-colors"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-[var(--color-mint)] mb-1 block">--code (optional)</label>
                <input
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  placeholder="auto-generated if empty"
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded px-3 py-2 text-sm placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-amber)] focus:ring-1 focus:ring-[var(--color-amber)]/40 transition-colors"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded bg-[var(--color-amber)] hover:bg-[var(--color-amber-bright)] disabled:opacity-50 text-[#1a1300] font-medium text-sm px-5 py-2 transition-colors"
                >
                  {submitting ? 'running…' : 'run shorten'}
                </button>
              </div>
            </div>
            {formError && (
              <p className="text-xs text-[var(--color-danger)] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 rounded px-3 py-2">
                error: {formError}
              </p>
            )}
          </form>
        </TerminalWindow>

        <TerminalWindow title={`user@shortnr:~$ ls links · ${codes.length}`}>
          {loadingList ? (
            <p className="text-sm text-[var(--color-text-dim)]">loading…</p>
          ) : listError ? (
            <p className="text-xs text-[var(--color-danger)]">error: {listError}</p>
          ) : codes.length === 0 ? (
            <p className="text-sm text-[var(--color-text-dim)]">
              no links yet — shorten your first url above.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--color-border)]">
              {codes.map((item) => {
                const link = shortLink(item.shortCode)
                return (
                  <li key={item.id} className="py-3 first:pt-0 last:pb-0 fade-up">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <a
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-[var(--color-amber-bright)] hover:underline break-all"
                        >
                          {link.replace(/^https?:\/\//, '')}
                        </a>
                        <p className="text-xs text-[var(--color-text-dim)] truncate mt-0.5">
                          → {item.targetURL}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleCopy(item.id, link)}
                          className="text-xs px-2 py-1 rounded border border-[var(--color-border)] text-[var(--color-text-dim)] hover:text-[var(--color-mint-bright)] hover:border-[var(--color-mint)]/40 transition-colors"
                        >
                          {copiedId === item.id ? 'copied' : 'copy'}
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-xs px-2 py-1 rounded border border-[var(--color-border)] text-[var(--color-text-dim)] hover:text-[var(--color-danger)] hover:border-[var(--color-danger)]/40 transition-colors"
                        >
                          delete
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </TerminalWindow>
      </div>
    </div>
  )
}
