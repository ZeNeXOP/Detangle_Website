import { useEffect, useState } from 'react'
import LoginForm from './LoginForm'
import EventUploadForm from './EventUploadForm'
import './admin.css'

type SessionState = 'checking' | 'authenticated' | 'anonymous'

export default function AdminApp() {
  const [sessionState, setSessionState] = useState<SessionState>('checking')
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => {
      document.head.removeChild(meta)
    }
  }, [])

  useEffect(() => {
    fetch('/api/admin/session', { credentials: 'include' })
      .then((res) => res.json())
      .then((data: { authenticated: boolean; email?: string }) => {
        if (data.authenticated) {
          setEmail(data.email ?? null)
          setSessionState('authenticated')
        } else {
          setSessionState('anonymous')
        }
      })
      .catch(() => setSessionState('anonymous'))
  }, [])

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' })
    setEmail(null)
    setSessionState('anonymous')
  }

  if (sessionState === 'checking') {
    return (
      <div className="admin-shell admin-shell--centered">
        <p>Checking session…</p>
      </div>
    )
  }

  if (sessionState === 'anonymous') {
    return (
      <LoginForm
        onLoggedIn={(loggedInEmail) => {
          setEmail(loggedInEmail)
          setSessionState('authenticated')
        }}
      />
    )
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <h1>Detangle Admin</h1>
        <div className="admin-header-right">
          <span>{email}</span>
          <button type="button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>
      <main className="admin-main">
        <EventUploadForm />
      </main>
    </div>
  )
}
