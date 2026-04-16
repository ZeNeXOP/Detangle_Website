import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Workshop } from '../types'

type RegistrationPageProps = {
  workshops: Workshop[]
  bookingSessionUrl: string
  apiBaseUrl: string
}

type RegistrationForm = {
  full_name: string
  email: string
  phone: string
  workshop_id: string
  experience_level: string
  notes: string
}

export default function Registration({ workshops, bookingSessionUrl, apiBaseUrl }: RegistrationPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [submitError, setSubmitError] = useState('')

  const [formData, setFormData] = useState<RegistrationForm>({
    full_name: '',
    email: '',
    phone: '',
    workshop_id: workshops[0].id,
    experience_level: 'beginner',
    notes: '',
  })

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

  return (
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
          <select value={formData.workshop_id} onChange={(event) => updateField('workshop_id', event.target.value)}>
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
  )
}

