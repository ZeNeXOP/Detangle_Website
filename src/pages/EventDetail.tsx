import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Event } from '../types'
import { formatEventEyebrow } from '../lib/formatEventDate'

type MediaItem = { type: 'image' | 'video'; src: string }

export default function EventDetail() {
  const { slug } = useParams<{ slug: string }>()
  // undefined = loading, null = not found
  const [event, setEvent] = useState<Event | null | undefined>(undefined)
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null)

  useEffect(() => {
    if (!slug) {
      return
    }

    let cancelled = false

    fetch(`/api/events/${slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Event | null) => {
        if (!cancelled) {
          setEvent(data)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEvent(null)
        }
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  useEffect(() => {
    if (!activeMedia) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveMedia(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeMedia])

  if (event === undefined) {
    return (
      <section className="section event-detail-section">
        <p>Loading…</p>
      </section>
    )
  }

  if (event === null) {
    return (
      <section className="section event-detail-section">
        <p>Event not found.</p>
        <Link to="/events" className="event-detail-back">
          ← Back to Events
        </Link>
      </section>
    )
  }

  const mediaItems: MediaItem[] = [
    ...event.gallery_image_urls.map((src): MediaItem => ({ type: 'image', src })),
    ...event.gallery_video_urls.map((src): MediaItem => ({ type: 'video', src })),
  ]

  return (
    <section className="section event-detail-section">
      <Link to="/events" className="event-detail-back">
        ← Back to Events
      </Link>

      {formatEventEyebrow(event) && <p className="eyebrow">{formatEventEyebrow(event)}</p>}
      <h1>{event.title}</h1>

      <div className="event-detail-layout">
        <div className="event-detail-poster">
          {event.poster_url && <img src={event.poster_url} alt={`${event.title} poster`} />}
        </div>

        <div>
          {event.location && <p className="lead">{event.location}</p>}
          {typeof event.price === 'number' && <p className="lead">₹{event.price} per person</p>}
          <p>{event.long_description}</p>

          {mediaItems.length > 0 && (
            <div className="event-detail-media-grid">
              {mediaItems.map((media, idx) =>
                media.type === 'image' ? (
                  <button
                    key={`${media.src}-${idx}`}
                    type="button"
                    className="event-detail-media-tile"
                    onClick={() => setActiveMedia(media)}
                    aria-label={`Open photo ${idx + 1}`}
                  >
                    <img src={media.src} alt={`${event.title} photo ${idx + 1}`} loading="lazy" />
                  </button>
                ) : (
                  <div key={`${media.src}-${idx}`} className="event-detail-media-tile">
                    <video src={media.src} controls />
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      </div>

      {activeMedia && activeMedia.type === 'image' && (
        <div
          className="media-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Photo preview"
          onClick={() => setActiveMedia(null)}
        >
          <div className="media-lightbox-content" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="media-lightbox-close"
              aria-label="Close preview"
              onClick={() => setActiveMedia(null)}
            >
              ×
            </button>
            <img src={activeMedia.src} alt="Event photo preview" className="media-lightbox-image" />
          </div>
        </div>
      )}
    </section>
  )
}
