import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type Page = 'home' | 'about' | 'register'

type RegistrationForm = {
  full_name: string
  email: string
  phone: string
  workshop_id: string
  experience_level: string
  notes: string
}

const workshops = [
  {
    id: 'detangle-mind-basics',
    title: 'Detangle Mind Basics',
    description:
      'A guided workshop on emotional awareness, stress mapping, and everyday grounding techniques.',
    date: 'May 2026',
  },
  {
    id: 'healthy-boundaries-lab',
    title: 'Healthy Boundaries Lab',
    description:
      'Interactive exercises to identify personal boundaries, communicate needs, and reduce emotional burnout.',
    date: 'June 2026',
  },
  {
    id: 'journaling-for-healing',
    title: 'Journaling for Healing',
    description:
      'A reflective session that combines psychology-informed prompts with practical journaling methods.',
    date: 'July 2026',
  },
]

const bookingSessionUrl = 'https://forms.gle/6CcMTZwz3zCo6Nre8'
const logoImage = '/assets/IMG_3208.PNG'

function App() {
  const [page, setPage] = useState<Page>('home')
  const [showNavBookingCta, setShowNavBookingCta] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [submitError, setSubmitError] = useState('')
  const heroBookingCtaRef = useRef<HTMLAnchorElement | null>(null)
  const [formData, setFormData] = useState<RegistrationForm>({
    full_name: '',
    email: '',
    phone: '',
    workshop_id: workshops[0].id,
    experience_level: 'beginner',
    notes: '',
  })

  const apiBaseUrl = useMemo(
    () => import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000',
    [],
  )

  const goToPage = (nextPage: Page) => {
    setPage(nextPage)
    setSubmitMessage('')
    setSubmitError('')
  }

  const updateField = (field: keyof RegistrationForm, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const handleRegistrationSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitMessage('')
    setSubmitError('')
    setIsSubmitting(true)

    try {
      const response = await fetch(`${apiBaseUrl}/api/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const payload = (await response.json()) as { message?: string; error?: string }

      if (!response.ok) {
        throw new Error(payload.error ?? 'Registration could not be submitted.')
      }

      setSubmitMessage(payload.message ?? 'Registration submitted successfully.')
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        workshop_id: workshops[0].id,
        experience_level: 'beginner',
        notes: '',
      })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Something went wrong while submitting your registration.'
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    const syncNavBookingCta = () => {
      if (page !== 'home') {
        setShowNavBookingCta(true)
        return
      }

      const heroBookingCta = heroBookingCtaRef.current
      if (!heroBookingCta) {
        setShowNavBookingCta(false)
        return
      }

      const { bottom } = heroBookingCta.getBoundingClientRect()
      setShowNavBookingCta(bottom <= 84)
    }

    syncNavBookingCta()
    window.addEventListener('scroll', syncNavBookingCta, { passive: true })
    window.addEventListener('resize', syncNavBookingCta)

    return () => {
      window.removeEventListener('scroll', syncNavBookingCta)
      window.removeEventListener('resize', syncNavBookingCta)
    }
  }, [page])

  return (
    <div className="site-shell">
      <header className="site-header">
        <button className="logo-mark" onClick={() => goToPage('home')} type="button">
          <img src={logoImage} alt="Detangle logo" />
        </button>
        <div className="brand-copy">
          <p
            className={`brand-name ${
              showNavBookingCta ? 'brand-name--visible' : 'brand-name--hidden'
            }`}
            aria-hidden={!showNavBookingCta}
          >
            Detangle
          </p>
        </div>
        <nav className="site-nav">
          <button type="button" onClick={() => goToPage('home')}>
            Home
          </button>
          <button type="button" onClick={() => goToPage('about')}>
            About
          </button>
          {showNavBookingCta && (
            <a href={bookingSessionUrl} target="_blank" rel="noreferrer" className="button-primary">
              Book a Session
            </a>
          )}
        </nav>
      </header>

      <main className="page-main">
        {page === 'home' && (
          <>
            <section className="landing-hero">
              <h1 className="landing-title">
                Detangle<span className="landing-dot">.</span>
              </h1>
              <p className="landing-subtitle">By Noopur Asthana</p>
              <p className="landing-oneliner">
                A gentle, non-judgmental space to understand your thoughts, emotions, and yourself.
              </p>
              <a
                ref={heroBookingCtaRef}
                href={bookingSessionUrl}
                target="_blank"
                rel="noreferrer"
                className="button-primary landing-booking-cta"
              >
                Let&apos;s Detangle Together
              </a>
            </section>

            <section className="section">
              <h2>Past Workshops</h2>
              <p className="section-intro">
                Detangle sessions are designed to be practical, reflective, and easy to apply in
                real life.
              </p>
              <div className="workshop-grid">
                {workshops.map((workshop) => (
                  <article key={workshop.id} className="workshop-card">
                    <p className="workshop-date">{workshop.date}</p>
                    <h3>{workshop.title}</h3>
                    <p>{workshop.description}</p>
                  </article>
                ))}
              </div>
              <div className="section-actions">
                <button className="button-secondary" onClick={() => goToPage('register')} type="button">
                  Register Now
                </button>
              </div>
            </section>
          </>
        )}

        {page === 'about' && (
          <section className="section">
            <p className="eyebrow">About</p>
            <h1>Noopur Asthana</h1>
            <p className="lead">
              Noopur is a trainee psychologist focused on making mental health support feel
              approachable, compassionate, and actionable for students and young professionals.
            </p>
            <div className="about-grid">
              <article>
                <h3>Practice philosophy</h3>
                <p>
                  A calm, non-judgmental space where self-awareness and emotional regulation can be
                  built through structured guidance.
                </p>
              </article>
              <article>
                <h3>Workshop style</h3>
                <p>
                  Interactive and reflective sessions that combine psychology concepts with clear
                  take-home practices.
                </p>
              </article>
              <article>
                <h3>Future vision</h3>
                <p>
                  Grow Detangle into a full portfolio and business platform with services,
                  testimonials, resources, and professional bookings.
                </p>
              </article>
            </div>
            <a
              className="button-primary"
              href={bookingSessionUrl}
              target="_blank"
              rel="noreferrer"
            >
              Let's Detangle Together
            </a>
          </section>
        )}

        {page === 'register' && (
          <section className="section">
            <p className="eyebrow">Registration</p>
            <h1>Register for a Workshop</h1>
            <p className="section-intro">
              Fill in your details and Detangle will confirm your workshop seat by email.
            </p>
            <form className="registration-form" onSubmit={handleRegistrationSubmit}>
              <label>
                Full Name
                <input
                  required
                  value={formData.full_name}
                  onChange={(event) => updateField('full_name', event.target.value)}
                  placeholder="Enter your full name"
                />
              </label>

              <label>
                Email
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  placeholder="Enter your email"
                />
              </label>

              <label>
                Phone
                <input
                  required
                  value={formData.phone}
                  onChange={(event) => updateField('phone', event.target.value)}
                  placeholder="Enter your phone number"
                />
              </label>

              <label>
                Workshop
                <select
                  value={formData.workshop_id}
                  onChange={(event) => updateField('workshop_id', event.target.value)}
                >
                  {workshops.map((workshop) => (
                    <option key={workshop.id} value={workshop.id}>
                      {workshop.title}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Experience Level
                <select
                  value={formData.experience_level}
                  onChange={(event) => updateField('experience_level', event.target.value)}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="experienced">Experienced</option>
                </select>
              </label>

              <label>
                Notes (optional)
                <textarea
                  rows={4}
                  value={formData.notes}
                  onChange={(event) => updateField('notes', event.target.value)}
                  placeholder="Share anything you would like us to know."
                />
              </label>

              <button className="button-primary" disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Submitting...' : 'Submit Registration'}
              </button>
            </form>

            {submitMessage && <p className="status-message success">{submitMessage}</p>}
            {submitError && <p className="status-message error">{submitError}</p>}
            <p className="helper-text">
              If the form is temporarily unavailable, you can still book through{' '}
              <a href={bookingSessionUrl} target="_blank" rel="noreferrer">
                Google Form
              </a>
              .
            </p>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
