import { useState } from 'react'
import type { FormEvent } from 'react'

const noopurPhoto = '/assets/noopur_3.png'

type BookingForm = {
  full_name: string
  email: string
  phone: string
  notes: string
}

export default function BookSession() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [submitError, setSubmitError] = useState('')

  const [formData, setFormData] = useState<BookingForm>({
    full_name: '',
    email: '',
    phone: '',
    notes: '',
  })

  const updateField = (field: keyof BookingForm, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitMessage('')
    setSubmitError('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const payload = (await response.json()) as { message?: string; error?: string }

      if (!response.ok) {
        throw new Error(payload.error ?? 'Booking could not be submitted.')
      }

      setSubmitMessage(payload.message ?? 'Booking request submitted successfully.')
      setFormData({ full_name: '', email: '', phone: '', notes: '' })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Something went wrong while submitting your booking.'
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="section">
      <p className="eyebrow">Booking</p>
      <h1>Book a Session</h1>
      <p className="section-intro">
        Fill in your details and Detangle will get back to you to confirm your session.
      </p>

      <div className="booking-intro-panel">
        <img src={noopurPhoto} alt="Noopur Asthana" className="booking-intro-photo" />
        <p className="booking-intro-text">
          Noopur will get back to you within 24 hours to confirm your session. No pressure, no
          judgment.
        </p>
      </div>

      <form className="booking-form" onSubmit={handleSubmit}>
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
          Notes (optional)
          <textarea
            rows={4}
            value={formData.notes}
            onChange={(event) => updateField('notes', event.target.value)}
            placeholder="Share anything you would like us to know."
          />
        </label>

        <button className="button-primary" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>

        <p className="booking-privacy-note">
          Your details stay private and are only used to confirm your session.
        </p>
      </form>

      {submitMessage && <p className="status-message success">{submitMessage}</p>}
      {submitError && <p className="status-message error">{submitError}</p>}
    </section>
  )
}
