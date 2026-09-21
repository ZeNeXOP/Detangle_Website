import { useState } from 'react'
import { formatEventEyebrow } from '../lib/formatEventDate'
import { useExistingEvents } from './hooks/useExistingEvents'

export default function DeleteEventSection() {
  const { events, refetch } = useExistingEvents()
  const [selectedId, setSelectedId] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const selectedEvent = events?.find((e) => e.id === selectedId) ?? null

  const handleSelectChange = (id: string) => {
    setSelectedId(id)
    setError('')
    setNotice('')
  }

  const handleDelete = async () => {
    if (!selectedEvent) return

    const confirmed = window.confirm(
      `Delete "${selectedEvent.title}" permanently? This cannot be undone (the event's photos/videos will stay in Cloudinary, but the event record and its links will be gone).`,
    )
    if (!confirmed) return

    setIsDeleting(true)
    setError('')
    try {
      const response = await fetch(`/api/admin/events/${selectedEvent.slug}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error ?? 'Failed to delete event.')
      }
      setNotice(`"${selectedEvent.title}" deleted.`)
      setSelectedId('')
      refetch()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="admin-event-form">
      <section className="admin-form-section">
        <h2 className="admin-form-section-title">Delete Event</h2>
        <p className="admin-form-section-hint">This permanently removes the event record. Cannot be undone.</p>

        <label className="admin-field">
          <span>Select Event</span>
          <select value={selectedId} onChange={(e) => handleSelectChange(e.target.value)}>
            <option value="">{events === null ? 'Loading events…' : '— Select an event —'}</option>
            {events?.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title} — {event.status === 'upcoming' ? 'Upcoming' : 'Past'}
                {event.start_datetime ? ` — ${formatEventEyebrow(event)}` : ''}
              </option>
            ))}
          </select>
          {events && events.length === 0 && (
            <p className="admin-form-section-hint">No events exist yet.</p>
          )}
        </label>

        {selectedEvent && (
          <div className="admin-delete-preview">
            {selectedEvent.poster_url && (
              <img src={selectedEvent.poster_url} alt={`${selectedEvent.title} poster`} />
            )}
            <div>
              <p className="admin-form-section-title" style={{ margin: 0 }}>
                {selectedEvent.title}
              </p>
              <p className="admin-form-section-hint">
                {selectedEvent.status === 'upcoming' ? 'Upcoming' : 'Past'}
                {formatEventEyebrow(selectedEvent) ? ` — ${formatEventEyebrow(selectedEvent)}` : ''}
              </p>
              <p className="admin-form-section-hint">
                {selectedEvent.gallery_image_urls.length + selectedEvent.gallery_video_urls.length} gallery item(s)
              </p>
            </div>
          </div>
        )}

        {error && <p className="admin-error">{error}</p>}
        {notice && <p className="admin-notice">{notice}</p>}

        <button
          type="button"
          className="admin-submit-btn admin-submit-btn--danger"
          disabled={!selectedEvent || isDeleting}
          onClick={handleDelete}
        >
          {isDeleting ? 'Deleting…' : 'Delete Event'}
        </button>
      </section>
    </div>
  )
}
