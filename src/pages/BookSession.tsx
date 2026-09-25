import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Event } from '../types'
import { BOOKABLE_SERVICES, buildWhatsAppLink, type BookableServiceType } from '../lib/services'
import WhatsAppQr from '../components/WhatsAppQr'

const noopurPhoto = '/assets/noopur_3.png'

type BookingForm = {
  full_name: string
  email: string
  phone: string
  notes: string
}

const EMPTY_FORM: BookingForm = { full_name: '', email: '', phone: '', notes: '' }

type Selection = { kind: 'none' } | { kind: 'service'; service: BookableServiceType } | { kind: 'event'; slug: string }

function parseSelection(value: string): Selection {
  if (!value) return { kind: 'none' }
  const separatorIndex = value.indexOf(':')
  const prefix = value.slice(0, separatorIndex)
  const id = value.slice(separatorIndex + 1)
  if (prefix === 'service') return { kind: 'service', service: id as BookableServiceType }
  if (prefix === 'event') return { kind: 'event', slug: id }
  return { kind: 'none' }
}

export default function BookSession() {
  const [searchParams] = useSearchParams()
  const preselectedEventSlug = searchParams.get('event') ?? ''

  const [selection, setSelection] = useState(preselectedEventSlug ? `event:${preselectedEventSlug}` : '')
  const [events, setEvents] = useState<Event[] | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [formData, setFormData] = useState<BookingForm>(EMPTY_FORM)

  // Once an event booking has saved, we move to a dedicated confirmation
  // screen for it — kept separately so it survives the dropdown resetting.
  const [confirmedEvent, setConfirmedEvent] = useState<Event | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/events?status=upcoming')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Event[]) => {
        if (!cancelled) setEvents(data)
      })
      .catch(() => {
        if (!cancelled) setEvents([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  const parsed = parseSelection(selection)
  const selectedEvent = parsed.kind === 'event' ? events?.find((event) => event.slug === parsed.slug) ?? null : null

  const updateField = (field: keyof BookingForm, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitMessage('')
    setSubmitError('')

    if (parsed.kind === 'none') {
      return
    }

    setIsSubmitting(true)

    const body =
      parsed.kind === 'event'
        ? {
            booking_type: 'event',
            event_slug: parsed.slug,
            event_title: selectedEvent?.title ?? '',
            ...formData,
          }
        : { booking_type: 'service', service_type: parsed.service, ...formData }

    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(async (response) => {
        const payload = (await response.json()) as { message?: string; error?: string }
        if (!response.ok) {
          throw new Error(payload.error ?? 'Booking could not be submitted.')
        }

        setFormData(EMPTY_FORM)

        if (parsed.kind === 'event') {
          setConfirmedEvent(selectedEvent)
        } else {
          const serviceLabel = BOOKABLE_SERVICES.find((service) => service.value === parsed.service)?.label ?? 'Session'
          setSubmitMessage(payload.message ?? `Your request for the "${serviceLabel}" has been sent.`)
        }
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : 'Something went wrong while submitting your booking.'
        setSubmitError(message)
      })
      .finally(() => setIsSubmitting(false))
  }

  // ── Step 2 (events only): the details are saved — now hand off to WhatsApp ──
  if (confirmedEvent) {
    const message = confirmedEvent.whatsapp_cta_text?.trim() || `I'm interested in ${confirmedEvent.title}`
    const waLink = buildWhatsAppLink(message)

    return (
      <section className="section">
        <p className="eyebrow">Booking</p>
        <h1>You're almost there</h1>
        <p className="section-intro">
          Your details for <strong>{confirmedEvent.title}</strong> have been saved. Continue on WhatsApp to confirm
          with Noopur.
        </p>

        <div className="booking-whatsapp-panel">
          <p className="booking-whatsapp-note">
            Opens WhatsApp with a message to Noopur, pre-filled for <strong>{confirmedEvent.title}</strong>.
          </p>
          <WhatsAppQr url={waLink} />
          <span className="booking-whatsapp-qr-caption">Can't open WhatsApp here? Scan with your phone.</span>
        </div>

        <a href={waLink} target="_blank" rel="noopener noreferrer" className="button-primary booking-whatsapp-cta">
          Continue on WhatsApp
        </a>

        <button
          type="button"
          className="booking-back-link"
          onClick={() => {
            setConfirmedEvent(null)
            setSelection('')
          }}
        >
          ← Book something else
        </button>
      </section>
    )
  }

  return (
    <section className="section">
      <p className="eyebrow">Booking</p>
      <h1>Book a Session</h1>
      <p className="section-intro">Choose what you'd like to book, and fill in your details below.</p>

      <div className="booking-intro-panel">
        <img src={noopurPhoto} alt="Noopur Asthana" className="booking-intro-photo" />
        <p className="booking-intro-text">
          Noopur will get back to you within 24 hours. No pressure, no judgment.
        </p>
      </div>

      <form className="booking-form" onSubmit={handleSubmit}>
        <label htmlFor="book-what">
          What would you like to book?
          <select
            id="book-what"
            required
            value={selection}
            onChange={(event) => {
              setSelection(event.target.value)
              setSubmitMessage('')
              setSubmitError('')
            }}
          >
            <option value="" disabled>
              Choose a service or an upcoming event
            </option>
            <optgroup label="Services">
              {BOOKABLE_SERVICES.map((service) => (
                <option key={service.value} value={`service:${service.value}`}>
                  {service.label}
                </option>
              ))}
            </optgroup>
            {events && events.length > 0 && (
              <optgroup label="Upcoming Events">
                {events.map((event) => (
                  <option key={event.slug} value={`event:${event.slug}`}>
                    {event.title}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </label>

        <label htmlFor="book-name">
          Full Name
          <input
            id="book-name"
            required
            value={formData.full_name}
            onChange={(event) => updateField('full_name', event.target.value)}
            placeholder="Enter your full name"
          />
        </label>

        <label htmlFor="book-email">
          Email
          <input
            id="book-email"
            required
            type="email"
            value={formData.email}
            onChange={(event) => updateField('email', event.target.value)}
            placeholder="Enter your email"
          />
        </label>

        <label htmlFor="book-phone">
          Phone
          <input
            id="book-phone"
            required
            value={formData.phone}
            onChange={(event) => updateField('phone', event.target.value)}
            placeholder="Enter your phone number"
          />
        </label>

        <label htmlFor="book-notes">
          Notes (optional)
          <textarea
            id="book-notes"
            rows={4}
            value={formData.notes}
            onChange={(event) => updateField('notes', event.target.value)}
            placeholder="Share anything you would like us to know."
          />
        </label>

        <button className="button-primary" disabled={isSubmitting || parsed.kind === 'none'} type="submit">
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
