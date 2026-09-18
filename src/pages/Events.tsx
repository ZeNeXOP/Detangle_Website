import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Event } from '../types'
import { formatEventEyebrow } from '../lib/formatEventDate'

function EventTile({ event }: { event: Event }) {
  return (
    <Link to={`/events/${event.slug}`} className="event-tile">
      <div className="event-tile-image-wrap">
        {event.poster_url && (
          <img src={event.poster_url} alt={`${event.title} poster`} loading="lazy" />
        )}
      </div>
      <div className="event-tile-caption">
        <p className="event-tile-title">{event.title}</p>
        {formatEventEyebrow(event) && <p className="event-tile-date">{formatEventEyebrow(event)}</p>}
      </div>
    </Link>
  )
}

export default function Events() {
  const [events, setEvents] = useState<Event[] | null>(null)

  useEffect(() => {
    let cancelled = false

    fetch('/api/events')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Event[]) => {
        if (!cancelled) {
          setEvents(data)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEvents([])
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const upcoming = events?.filter((event) => event.status === 'upcoming') ?? []
  const past = events?.filter((event) => event.status === 'past') ?? []

  return (
    <section className="section events-archive-section">
      <h1>Events</h1>
      <p className="section-intro">
        A look at Detangle's upcoming and past workshops, sessions, and group events.
      </p>

      {events && events.length === 0 && (
        <p className="events-empty-state">No events yet — check back soon.</p>
      )}

      {upcoming.length > 0 && (
        <>
          <h2 className="events-archive-heading">Upcoming</h2>
          <div className="events-grid">
            {upcoming.map((event) => (
              <EventTile key={event.id} event={event} />
            ))}
          </div>
        </>
      )}

      {past.length > 0 && (
        <>
          <h2 className="events-archive-heading">Past Events</h2>
          <div className="events-grid">
            {past.map((event) => (
              <EventTile key={event.id} event={event} />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
