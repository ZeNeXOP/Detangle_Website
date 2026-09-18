import { useState } from 'react'
import type { FormEvent } from 'react'

type LoginFormProps = {
  onLoggedIn: (email: string) => void
}

export default function LoginForm({ onLoggedIn }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const payload = (await response.json()) as { email?: string; error?: string }

      if (!response.ok) {
        throw new Error(payload.error ?? 'Login failed.')
      }

      onLoggedIn(payload.email ?? email)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="admin-shell admin-shell--centered">
      <form className="admin-login-form" onSubmit={handleSubmit}>
        <h1>Detangle Admin</h1>
        <label className="admin-field">
          <span>Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
          />
        </label>
        <label className="admin-field">
          <span>Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />
        </label>
        {error && <p className="admin-error">{error}</p>}
        <button type="submit" className="admin-submit-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </div>
  )
}
