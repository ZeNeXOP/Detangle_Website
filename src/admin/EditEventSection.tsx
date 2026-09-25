import { useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type { Event, EventType } from '../types'
import { EVENT_TYPE_LABELS, formatEventEyebrow, isoToDatetimeLocal } from '../lib/formatEventDate'
import { uploadFile } from './lib/uploadFile'
import { useExistingEvents } from './hooks/useExistingEvents'

type ExistingMediaItem = { kind: 'existing'; url: string; type: 'image' | 'video' }
type NewMediaItem = { kind: 'new'; file: File; previewUrl: string; type: 'image' | 'video' }
type GalleryItem = ExistingMediaItem | NewMediaItem

type EditForm = {
  title: string
  status: 'upcoming' | 'past'
  type: EventType | ''
  shortDescription: string
  longDescription: string
  startDateTime: string
  upcomingCutoffHours: string
  location: string
  price: string
  whatsappCtaText: string
}


export default function EditEventSection() {
  const { events, refetch } = useExistingEvents()
  const [selectedId, setSelectedId] = useState('')
  const [form, setForm] = useState<EditForm | null>(null)
  const [posterUrl, setPosterUrl] = useState<string | null>(null)
  const [newPoster, setNewPoster] = useState<{ file: File; previewUrl: string } | null>(null)
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [validationError, setValidationError] = useState('')
  const [savedNotice, setSavedNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const posterInputRef = useRef<HTMLInputElement | null>(null)
  const galleryInputRef = useRef<HTMLInputElement | null>(null)

  const selectedEvent = events?.find((e) => e.id === selectedId) ?? null

  const loadEvent = (event: Event) => {
    setSelectedId(event.id)
    setForm({
      title: event.title,
      status: event.status,
      type: event.type ?? '',
      shortDescription: event.short_description ?? '',
      longDescription: event.long_description ?? '',
      startDateTime: isoToDatetimeLocal(event.start_datetime),
      upcomingCutoffHours: event.upcoming_cutoff_hours ? String(event.upcoming_cutoff_hours) : '',
      location: event.location ?? '',
      price: event.price != null ? String(event.price) : '',
      whatsappCtaText: event.whatsapp_cta_text ?? '',
    })
    setPosterUrl(event.poster_url)
    setNewPoster(null)
    setGalleryItems([
      ...event.gallery_image_urls.map((url): ExistingMediaItem => ({ kind: 'existing', url, type: 'image' })),
      ...event.gallery_video_urls.map((url): ExistingMediaItem => ({ kind: 'existing', url, type: 'video' })),
    ])
    setValidationError('')
    setSavedNotice('')
  }

  const handleSelectChange = (id: string) => {
    if (!id) {
      setSelectedId('')
      setForm(null)
      return
    }
    const event = events?.find((e) => e.id === id)
    if (event) {
      loadEvent(event)
    }
  }

  const updateField = <K extends keyof EditForm>(field: K, value: EditForm[K]) => {
    setForm((current) => (current ? { ...current, [field]: value } : current))
  }

  const handlePosterChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (newPoster) URL.revokeObjectURL(newPoster.previewUrl)
    setNewPoster({ file, previewUrl: URL.createObjectURL(file) })
  }

  const removePoster = () => {
    if (newPoster) URL.revokeObjectURL(newPoster.previewUrl)
    setNewPoster(null)
    setPosterUrl(null)
    if (posterInputRef.current) posterInputRef.current.value = ''
  }

  const handleGalleryChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    const newItems: GalleryItem[] = Array.from(files).map((file) => ({
      kind: 'new',
      file,
      previewUrl: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image',
    }))
    setGalleryItems((current) => [...current, ...newItems])
    event.target.value = ''
  }

  const removeGalleryItem = (index: number) => {
    setGalleryItems((current) => {
      const target = current[index]
      if (target?.kind === 'new') {
        URL.revokeObjectURL(target.previewUrl)
      }
      return current.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault()
    setValidationError('')
    setSavedNotice('')

    if (!selectedEvent || !form) {
      setValidationError('Select an event to edit first.')
      return
    }
    if (!form.title.trim()) {
      setValidationError('Name is required.')
      return
    }

    setIsSubmitting(true)
    try {
      let finalPosterUrl: string | null = posterUrl
      if (newPoster) {
        finalPosterUrl = (await uploadFile(newPoster.file)).url
      }

      const newItemsToUpload = galleryItems.filter((item): item is NewMediaItem => item.kind === 'new')
      const uploaded = await Promise.all(newItemsToUpload.map((item) => uploadFile(item.file)))

      let uploadIndex = 0
      const finalImageUrls: string[] = []
      const finalVideoUrls: string[] = []
      for (const item of galleryItems) {
        if (item.kind === 'existing') {
          ;(item.type === 'image' ? finalImageUrls : finalVideoUrls).push(item.url)
        } else {
          const result = uploaded[uploadIndex]
          uploadIndex += 1
          ;(result.resource_type === 'image' ? finalImageUrls : finalVideoUrls).push(result.url)
        }
      }

      const startDateTimeIso = form.startDateTime ? new Date(form.startDateTime).toISOString() : null

      const response = await fetch(`/api/admin/events/${selectedEvent.slug}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          status: form.status,
          type: form.type || null,
          short_description: form.shortDescription,
          long_description: form.longDescription,
          start_datetime: startDateTimeIso,
          upcoming_cutoff_hours: form.upcomingCutoffHours ? Number(form.upcomingCutoffHours) : 0,
          location: form.location,
          price: form.price ? Number(form.price) : null,
          poster_url: finalPosterUrl,
          gallery_image_urls: finalImageUrls,
          gallery_video_urls: finalVideoUrls,
          whatsapp_cta_text: form.whatsappCtaText,
        }),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error ?? 'Failed to update event.')
      }

      setSavedNotice(`"${form.title}" updated.`)
      refetch()
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="admin-event-form">
      <section className="admin-form-section">
        <h2 className="admin-form-section-title">Edit Event</h2>
        <p className="admin-form-section-hint">Pick an event to update its details or media.</p>

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
            <p className="admin-form-section-hint">No events exist yet — add one first.</p>
          )}
        </label>
      </section>

      {form && (
        <form onSubmit={handleSubmit}>
          <section className="admin-form-section">
            <label className="admin-field">
              <span>Upcoming or Past</span>
              <div className="admin-segmented">
                <button
                  type="button"
                  className={`admin-segmented-option ${form.status === 'upcoming' ? 'admin-segmented-option--active' : ''}`}
                  onClick={() => updateField('status', 'upcoming')}
                >
                  Upcoming
                </button>
                <button
                  type="button"
                  className={`admin-segmented-option ${form.status === 'past' ? 'admin-segmented-option--active' : ''}`}
                  onClick={() => updateField('status', 'past')}
                >
                  Past
                </button>
              </div>
            </label>

            <label className="admin-field">
              <span>
                Name <span className="admin-required">*</span>
              </span>
              <input type="text" value={form.title} onChange={(e) => updateField('title', e.target.value)} />
            </label>

            <label className="admin-field">
              <span>URL slug</span>
              <input type="text" value={selectedEvent?.slug ?? ''} disabled />
              <p className="admin-form-section-hint">Slug can't be changed after creation.</p>
            </label>

            <label className="admin-field">
              <span>Type</span>
              <select value={form.type} onChange={(e) => updateField('type', e.target.value as EventType | '')}>
                <option value="">— Select type —</option>
                {(Object.keys(EVENT_TYPE_LABELS) as EventType[]).map((type) => (
                  <option key={type} value={type}>
                    {EVENT_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-field">
              <span>Short Description</span>
              <textarea
                rows={2}
                value={form.shortDescription}
                onChange={(e) => updateField('shortDescription', e.target.value)}
                placeholder="One or two lines shown on the homepage upcoming-event card"
              />
            </label>

            <label className="admin-field">
              <span>Long Description</span>
              <p className="admin-form-section-hint">
                Leave a blank line between paragraphs. Use **bold** and *italic* for emphasis, and
                start a line with "- " or "* " for a bullet list.
              </p>
              <textarea
                rows={4}
                value={form.longDescription}
                onChange={(e) => updateField('longDescription', e.target.value)}
                placeholder="The full description shown on the event's own page"
              />
            </label>

            <div className="admin-field-row">
              <label className="admin-field">
                <span>Date &amp; Time</span>
                <input
                  type="datetime-local"
                  value={form.startDateTime}
                  onChange={(e) => updateField('startDateTime', e.target.value)}
                />
              </label>
              <label className="admin-field">
                <span>Price (₹)</span>
                <input type="number" min="0" value={form.price} onChange={(e) => updateField('price', e.target.value)} />
              </label>
            </div>

            {form.status === 'upcoming' && (
              <label className="admin-field">
                <span>Switch to "Past" this many hours before start</span>
                <input
                  type="number"
                  min="0"
                  value={form.upcomingCutoffHours}
                  onChange={(e) => updateField('upcomingCutoffHours', e.target.value)}
                />
              </label>
            )}

            <label className="admin-field">
              <span>Location</span>
              <input type="text" value={form.location} onChange={(e) => updateField('location', e.target.value)} />
            </label>

            <label className="admin-field">
              <span>WhatsApp interest message</span>
              <input
                type="text"
                value={form.whatsappCtaText}
                onChange={(e) => updateField('whatsappCtaText', e.target.value)}
              />
            </label>
          </section>

          <section className="admin-form-section">
            <h2 className="admin-form-section-title">Media</h2>

            <p className="admin-form-section-hint">Poster</p>
            <div className="admin-media-panel">
              {newPoster || posterUrl ? (
                <div className="admin-poster-preview">
                  <img src={newPoster?.previewUrl ?? posterUrl ?? ''} alt="Poster preview" />
                  <button type="button" className="admin-remove-btn" onClick={removePoster}>
                    Remove
                  </button>
                </div>
              ) : (
                <button type="button" className="admin-upload-trigger" onClick={() => posterInputRef.current?.click()}>
                  Choose poster image
                </button>
              )}
              <input ref={posterInputRef} type="file" accept="image/*" hidden onChange={handlePosterChange} />
            </div>

            <p className="admin-form-section-hint">Gallery</p>
            <div className="admin-media-panel">
              <button type="button" className="admin-upload-trigger" onClick={() => galleryInputRef.current?.click()}>
                Add photos or videos
              </button>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                hidden
                onChange={handleGalleryChange}
              />

              {galleryItems.length > 0 && (
                <div className="admin-gallery-grid">
                  {galleryItems.map((item, index) => (
                    <div key={`${item.kind === 'existing' ? item.url : item.file.name}-${index}`} className="admin-gallery-item">
                      {item.type === 'image' ? (
                        <img src={item.kind === 'existing' ? item.url : item.previewUrl} alt="" />
                      ) : (
                        <video src={item.kind === 'existing' ? item.url : item.previewUrl} muted />
                      )}
                      <button
                        type="button"
                        className="admin-remove-btn admin-remove-btn--overlay"
                        onClick={() => removeGalleryItem(index)}
                        aria-label="Remove"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {validationError && <p className="admin-error">{validationError}</p>}
          {savedNotice && <p className="admin-notice">{savedNotice}</p>}

          <button type="submit" className="admin-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      )}
    </div>
  )
}
