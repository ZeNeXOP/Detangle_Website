import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type { EventType } from '../types'
import { EVENT_TYPE_LABELS } from '../lib/formatEventDate'
import { slugify, uploadFile } from './lib/uploadFile'
import { useExistingEvents } from './hooks/useExistingEvents'

type EventStatus = 'upcoming' | 'past'

type GalleryItem = {
  file: File
  previewUrl: string
  kind: 'image' | 'video'
}

type EventDetailsForm = {
  title: string
  slug: string
  status: EventStatus | ''
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
  status: '',
  type: '',
  description: '',
  startDateTime: '',
  upcomingCutoffHours: '',
  location: '',
  price: '',
  whatsappCtaText: '',
}

export default function AddEventSection() {
  const { upcomingCount, refetch } = useExistingEvents()
  const [details, setDetails] = useState<EventDetailsForm>(EMPTY_DETAILS)
  const [slugTouched, setSlugTouched] = useState(false)

  const [mediaMode, setMediaMode] = useState<'poster' | 'gallery'>('poster')
  const [poster, setPoster] = useState<{ file: File; previewUrl: string } | null>(null)
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [validationError, setValidationError] = useState('')
  const [savedNotice, setSavedNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const posterInputRef = useRef<HTMLInputElement | null>(null)
  const galleryInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    return () => {
      if (poster) {
        URL.revokeObjectURL(poster.previewUrl)
      }
      galleryItems.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    setDetails(EMPTY_DETAILS)
    setSlugTouched(false)
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

    if (!details.status) {
      setValidationError('Choose Upcoming or Past.')
      return
    }
    if (!details.title.trim()) {
      setValidationError('Name is required.')
      return
    }

    setIsSubmitting(true)
    try {
      let posterUrl: string | null = null
      if (poster) {
        posterUrl = (await uploadFile(poster.file)).url
      }

      const uploadedGallery = await Promise.all(galleryItems.map((item) => uploadFile(item.file)))
      const galleryImageUrls = uploadedGallery.filter((u) => u.resource_type === 'image').map((u) => u.url)
      const galleryVideoUrls = uploadedGallery.filter((u) => u.resource_type === 'video').map((u) => u.url)

      const startDateTimeIso = details.startDateTime ? new Date(details.startDateTime).toISOString() : undefined

      const response = await fetch('/api/admin/events', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: details.slug || slugify(details.title),
          title: details.title.trim(),
          status: details.status,
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
      resetForm()
      refetch()
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="admin-event-form" onSubmit={handleSubmit}>
      <section className="admin-form-section">
        <h2 className="admin-form-section-title">Event Details</h2>
        <p className="admin-form-section-hint">Everything here is optional except Name and Upcoming/Past.</p>

        <label className="admin-field">
          <span>
            Upcoming or Past <span className="admin-required">*</span>
          </span>
          <div className="admin-segmented">
            <button
              type="button"
              className={`admin-segmented-option ${details.status === 'upcoming' ? 'admin-segmented-option--active' : ''}`}
              onClick={() => updateField('status', 'upcoming')}
            >
              Upcoming
            </button>
            <button
              type="button"
              className={`admin-segmented-option ${details.status === 'past' ? 'admin-segmented-option--active' : ''}`}
              onClick={() => updateField('status', 'past')}
            >
              Past
            </button>
          </div>
          {details.status === 'upcoming' && (
            <p className="admin-form-section-hint">
              {upcomingCount === 0
                ? 'No upcoming events right now — this will be the only one shown on the homepage.'
                : upcomingCount === 1
                  ? 'There is already 1 upcoming event. Adding this one will switch the homepage to the two-event side-by-side layout.'
                  : `There are already ${upcomingCount} upcoming events.`}
            </p>
          )}
        </label>

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

        {details.status === 'upcoming' && (
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
      </section>

      <section className="admin-form-section">
        <h2 className="admin-form-section-title">Media</h2>
        <p className="admin-form-section-hint">Choose whether you're uploading the poster or gallery photos/videos.</p>

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

        {mediaMode === 'poster' && (
          <div className="admin-media-panel">
            {poster ? (
              <div className="admin-poster-preview">
                <img src={poster.previewUrl} alt="Poster preview" />
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
        )}

        {mediaMode === 'gallery' && (
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

      {validationError && <p className="admin-error">{validationError}</p>}
      {savedNotice && <p className="admin-notice">{savedNotice}</p>}

      <button type="submit" className="admin-submit-btn" disabled={isSubmitting}>
        {isSubmitting ? 'Saving…' : 'Save Event'}
      </button>
    </form>
  )
}
