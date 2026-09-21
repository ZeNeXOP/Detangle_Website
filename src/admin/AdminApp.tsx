import { useEffect, useState } from 'react'
import LoginForm from './LoginForm'
import AddEventSection from './AddEventSection'
import EditEventSection from './EditEventSection'
import DeleteEventSection from './DeleteEventSection'
import './admin.css'

type SessionState = 'checking' | 'authenticated' | 'anonymous'
type Tab = 'add' | 'edit' | 'delete'

export default function AdminApp() {
  const [sessionState, setSessionState] = useState<SessionState>('checking')
  const [email, setEmail] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('add')

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

      <nav className="admin-tabs">
        <button
          type="button"
          className={`admin-tab ${tab === 'add' ? 'admin-tab--active' : ''}`}
          onClick={() => setTab('add')}
        >
          Add
        </button>
        <button
          type="button"
          className={`admin-tab ${tab === 'edit' ? 'admin-tab--active' : ''}`}
          onClick={() => setTab('edit')}
        >
          Edit
        </button>
        <button
          type="button"
          className={`admin-tab ${tab === 'delete' ? 'admin-tab--active' : ''}`}
          onClick={() => setTab('delete')}
        >
          Delete
        </button>
      </nav>

      <main className="admin-main">
        {tab === 'add' && <AddEventSection />}
        {tab === 'edit' && <EditEventSection />}
        {tab === 'delete' && <DeleteEventSection />}
      </main>
    </div>
  )
}
