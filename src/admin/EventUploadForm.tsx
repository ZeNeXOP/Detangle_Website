import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type { Event, EventType } from '../types'
import { EVENT_TYPE_LABELS } from '../lib/formatEventDate'

type EventMode = 'upcoming' | 'past' | 'existing'
type MediaMode = 'poster' | 'gallery'

type GalleryItem = {
  file: File
  previewUrl: string
  kind: 'image' | 'video'
}

type EventDetailsForm = {
  title: string
  slug: string
  type: EventType | ''
  description: string
  startDateTime: string
  upcomingCutoffHours: string
  location: string
  price: string
  whatsappCtaText: string
}

const EMPTY_DETAILS: EventDetailsForm = {
  title: '',
  slug: '',
  type: '',
  description: '',
  startDateTime: '',
  upcomingCutoffHours: '',
  location: '',
  price: '',
  whatsappCtaText: '',
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function uploadFile(file: File): Promise<{ url: string; resource_type: string }> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await fetch('/api/admin/uploads', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.error ?? 'Upload failed.')
  }
  return response.json()
}

export default function EventUploadForm() {
  const [mode, setMode] = useState<EventMode | ''>('')
  const [details, setDetails] = useState<EventDetailsForm>(EMPTY_DETAILS)
  const [slugTouched, setSlugTouched] = useState(false)

  const [existingEvents, setExistingEvents] = useState<Event[] | null>(null)
  const [selectedExistingEventId, setSelectedExistingEventId] = useState('')

  const [mediaMode, setMediaMode] = useState<MediaMode>('poster')
  const [poster, setPoster] = useState<{ file: File; previewUrl: string } | null>(null)
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [validationError, setValidationError] = useState('')
  const [savedNotice, setSavedNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const posterInputRef = useRef<HTMLInputElement | null>(null)
  const galleryInputRef = useRef<HTMLInputElement | null>(null)

  const refetchEvents = () => {
    fetch('/api/events')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Event[]) => setExistingEvents(data))
      .catch(() => setExistingEvents([]))
  }

  useEffect(() => {
    refetchEvents()
  }, [])

  useEffect(() => {
    return () => {
      if (poster) {
        URL.revokeObjectURL(poster.previewUrl)
      }
      galleryItems.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const chooseMode = (nextMode: EventMode) => {
    setMode(nextMode)
    if (nextMode === 'existing') {
      setMediaMode('gallery')
    }
  }

  const updateField = <K extends keyof EventDetailsForm>(field: K, value: EventDetailsForm[K]) => {
    setDetails((current) => ({ ...current, [field]: value }))
  }

  const handleTitleChange = (value: string) => {
    setDetails((current) => ({
      ...current,
      title: value,
      slug: slugTouched ? current.slug : slugify(value),
    }))
  }

  const handleSlugChange = (value: string) => {
    setSlugTouched(true)
    updateField('slug', slugify(value))
  }

  const handlePosterChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    if (poster) {
      URL.revokeObjectURL(poster.previewUrl)
    }
    setPoster({ file, previewUrl: URL.createObjectURL(file) })
  }

  const removePoster = () => {
    if (poster) {
      URL.revokeObjectURL(poster.previewUrl)
    }
    setPoster(null)
    if (posterInputRef.current) {
      posterInputRef.current.value = ''
    }
  }

  const handleGalleryChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) {
      return
    }

    const newItems: GalleryItem[] = Array.from(files).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      kind: file.type.startsWith('video/') ? 'video' : 'image',
    }))

    setGalleryItems((current) => [...current, ...newItems])
    event.target.value = ''
  }

  const removeGalleryItem = (index: number) => {
    setGalleryItems((current) => {
      const target = current[index]
      if (target) {
        URL.revokeObjectURL(target.previewUrl)
      }
      return current.filter((_, i) => i !== index)
    })
  }

  const resetForm = () => {
    setMode('')
    setDetails(EMPTY_DETAILS)
    setSlugTouched(false)
    setSelectedExistingEventId('')
    if (poster) {
      URL.revokeObjectURL(poster.previewUrl)
    }
    setPoster(null)
    galleryItems.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    setGalleryItems([])
    setMediaMode('poster')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSavedNotice('')
    setValidationError('')

    if (!mode) {
      setValidationError('Choose Upcoming, Past, or Existing Event to continue.')
      return
    }
    if (mode === 'existing' && !selectedExistingEventId) {
      setValidationError('Select which existing event you want to add media to.')
      return
    }
    if (mode !== 'existing' && !details.title.trim()) {
      setValidationError('Name is required.')
      return
    }

    setIsSubmitting(true)
    try {
      if (mode === 'existing') {
        const existingEvent = existingEvents?.find((e) => e.id === selectedExistingEventId)
        if (!existingEvent) {
          throw new Error('Selected event could not be found — try refreshing the page.')
        }

        const uploaded = await Promise.all(galleryItems.map((item) => uploadFile(item.file)))
        const newImageUrls = uploaded.filter((u) => u.resource_type === 'image').map((u) => u.url)
        const newVideoUrls = uploaded.filter((u) => u.resource_type === 'video').map((u) => u.url)

        const response = await fetch(`/api/admin/events/${existingEvent.slug}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gallery_image_urls: [...existingEvent.gallery_image_urls, ...newImageUrls],
            gallery_video_urls: [...existingEvent.gallery_video_urls, ...newVideoUrls],
          }),
        })
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}))
          throw new Error(payload.error ?? 'Failed to update event.')
        }

        setSavedNotice(`Added ${uploaded.length} item(s) to "${existingEvent.title}".`)
      } else {
        let posterUrl: string | null = null
        if (poster) {
          posterUrl = (await uploadFile(poster.file)).url
        }

        const uploadedGallery = await Promise.all(galleryItems.map((item) => uploadFile(item.file)))
        const galleryImageUrls = uploadedGallery.filter((u) => u.resource_type === 'image').map((u) => u.url)
        const galleryVideoUrls = uploadedGallery.filter((u) => u.resource_type === 'video').map((u) => u.url)

        const startDateTimeIso = details.startDateTime
          ? new Date(details.startDateTime).toISOString()
          : undefined

        const response = await fetch('/api/admin/events', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug: details.slug || slugify(details.title),
            title: details.title.trim(),
            status: mode,
            type: details.type || undefined,
            description: details.description,
            start_datetime: startDateTimeIso,
            upcoming_cutoff_hours: details.upcomingCutoffHours ? Number(details.upcomingCutoffHours) : undefined,
            location: details.location,
            price: details.price ? Number(details.price) : undefined,
            poster_url: posterUrl,
            gallery_image_urls: galleryImageUrls,
            gallery_video_urls: galleryVideoUrls,
            whatsapp_cta_text: details.whatsappCtaText,
          }),
        })
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}))
          throw new Error(payload.error ?? 'Failed to create event.')
        }

        setSavedNotice(`"${details.title}" saved.`)
      }

      resetForm()
      refetchEvents()
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="admin-event-form" onSubmit={handleSubmit}>
      <section className="admin-form-section">
        <h2 className="admin-form-section-title">
          {mode === 'existing' ? 'Add Media to an Existing Event' : 'Event Details'}
        </h2>
        <p className="admin-form-section-hint">
          {mode === 'existing'
            ? 'Pick which event you want to add more gallery media to.'
            : 'Everything here is optional except Name and Upcoming/Past.'}
        </p>

        <label className="admin-field">
          <span>
            What are you adding? <span className="admin-required">*</span>
          </span>
          <div className="admin-segmented">
            <button
              type="button"
              className={`admin-segmented-option ${mode === 'upcoming' ? 'admin-segmented-option--active' : ''}`}
              onClick={() => chooseMode('upcoming')}
            >
              Upcoming
            </button>
            <button
              type="button"
              className={`admin-segmented-option ${mode === 'past' ? 'admin-segmented-option--active' : ''}`}
              onClick={() => chooseMode('past')}
            >
              Past
            </button>
            <button
              type="button"
              className={`admin-segmented-option ${mode === 'existing' ? 'admin-segmented-option--active' : ''}`}
              onClick={() => chooseMode('existing')}
            >
              Existing Event
            </button>
          </div>
        </label>

        {mode === 'existing' && (
          <label className="admin-field">
            <span>
              Select Event <span className="admin-required">*</span>
            </span>
            <select
              value={selectedExistingEventId}
              onChange={(e) => setSelectedExistingEventId(e.target.value)}
            >
              <option value="">
                {existingEvents === null ? 'Loading events…' : '— Select an event —'}
              </option>
              {existingEvents?.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
            {existingEvents && existingEvents.length === 0 && (
              <p className="admin-form-section-hint">No events exist yet — add one as Upcoming or Past first.</p>
            )}
          </label>
        )}

        {(mode === 'upcoming' || mode === 'past') && (
          <>
            <label className="admin-field">
              <span>
                Name <span className="admin-required">*</span>
              </span>
              <input
                type="text"
                value={details.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. From Procrastination to Action"
              />
            </label>

            <label className="admin-field">
              <span>URL slug</span>
              <input
                type="text"
                value={details.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="auto-generated-from-name"
              />
            </label>

            <label className="admin-field">
              <span>Type</span>
              <select value={details.type} onChange={(e) => updateField('type', e.target.value as EventType | '')}>
                <option value="">— Select type —</option>
                {(Object.keys(EVENT_TYPE_LABELS) as EventType[]).map((type) => (
                  <option key={type} value={type}>
                    {EVENT_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-field">
              <span>Description</span>
              <textarea
                rows={4}
                value={details.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="What is this event about?"
              />
            </label>

            <div className="admin-field-row">
              <label className="admin-field">
                <span>Date &amp; Time</span>
                <input
                  type="datetime-local"
                  value={details.startDateTime}
                  onChange={(e) => updateField('startDateTime', e.target.value)}
                />
              </label>

              <label className="admin-field">
                <span>Price (₹)</span>
                <input
                  type="number"
                  min="0"
                  value={details.price}
                  onChange={(e) => updateField('price', e.target.value)}
                  placeholder="e.g. 599"
                />
              </label>
            </div>

            {mode === 'upcoming' && (
              <label className="admin-field">
                <span>Switch to "Past" this many hours before start</span>
                <input
                  type="number"
                  min="0"
                  value={details.upcomingCutoffHours}
                  onChange={(e) => updateField('upcomingCutoffHours', e.target.value)}
                  placeholder="0 (default — switches right at start time)"
                />
              </label>
            )}

            <label className="admin-field">
              <span>Location</span>
              <input
                type="text"
                value={details.location}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="e.g. Lucknow · Vijayant Khand"
              />
            </label>

            <label className="admin-field">
              <span>WhatsApp interest message</span>
              <input
                type="text"
                value={details.whatsappCtaText}
                onChange={(e) => updateField('whatsappCtaText', e.target.value)}
                placeholder={`e.g. I'm interested in ${details.title || '[event name]'}`}
              />
            </label>
          </>
        )}
      </section>

      {mode && (
        <section className="admin-form-section">
          <h2 className="admin-form-section-title">Media</h2>

          {mode === 'existing' ? (
            <p className="admin-form-section-hint">Add more photos or videos to this event's gallery.</p>
          ) : (
            <>
              <p className="admin-form-section-hint">
                Choose whether you're uploading the poster or gallery photos/videos.
              </p>
              <div className="admin-segmented">
                <button
                  type="button"
                  className={`admin-segmented-option ${mediaMode === 'poster' ? 'admin-segmented-option--active' : ''}`}
                  onClick={() => setMediaMode('poster')}
                >
                  Poster
                </button>
                <button
                  type="button"
                  className={`admin-segmented-option ${mediaMode === 'gallery' ? 'admin-segmented-option--active' : ''}`}
                  onClick={() => setMediaMode('gallery')}
                >
                  Gallery
                </button>
              </div>
            </>
          )}

          {mode !== 'existing' && mediaMode === 'poster' && (
            <div className="admin-media-panel">
              {poster ? (
                <div className="admin-poster-preview">
                  <img src={poster.previewUrl} alt="Poster preview" />
                  <button type="button" className="admin-remove-btn" onClick={removePoster}>
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="admin-upload-trigger"
                  onClick={() => posterInputRef.current?.click()}
                >
                  Choose poster image
                </button>
              )}
              <input
                ref={posterInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handlePosterChange}
              />
            </div>
          )}

          {(mode === 'existing' || mediaMode === 'gallery') && (
            <div className="admin-media-panel">
              <button
                type="button"
                className="admin-upload-trigger"
                onClick={() => galleryInputRef.current?.click()}
              >
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
                    <div key={`${item.file.name}-${index}`} className="admin-gallery-item">
                      {item.kind === 'image' ? (
                        <img src={item.previewUrl} alt={item.file.name} />
                      ) : (
                        <video src={item.previewUrl} muted />
                      )}
                      <button
                        type="button"
                        className="admin-remove-btn admin-remove-btn--overlay"
                        onClick={() => removeGalleryItem(index)}
                        aria-label={`Remove ${item.file.name}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {validationError && <p className="admin-error">{validationError}</p>}
      {savedNotice && <p className="admin-notice">{savedNotice}</p>}

      <button type="submit" className="admin-submit-btn" disabled={isSubmitting}>
        {isSubmitting ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}
