import { useEffect, useState } from 'react'

const galleryImages = [
  '/assets/photo_6109390223658650549_w.jpg',
  '/assets/photo_6109390223658650550_w.jpg',
  '/assets/photo_6109390223658650551_w.jpg',
  '/assets/photo_6109390223658650552_w.jpg',
  '/assets/photo_6109390223658650553_w.jpg',
  '/assets/photo_6109390223658650554_w.jpg',
  '/assets/photo_6109390223658650557_w.jpg',
  '/assets/photo_6269179564168778030_y.jpg',
  '/assets/photo_6269179564168778031_y.jpg',
]

export default function Gallery() {
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null)

  useEffect(() => {
    if (activeImageIndex === null) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveImageIndex(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeImageIndex])

  const activeImageSrc = activeImageIndex !== null ? galleryImages[activeImageIndex] : null

  return (
    <>
      <section className="section gallery-section">
        <h2>Gallery</h2>
        <p className="section-intro">A glimpse of past workshops and expressive sessions.</p>

        <div className="gallery-grid">
          {galleryImages.map((src, idx) => (
            <button
              key={`${src}-${idx}`}
              type="button"
              className="gallery-tile"
              onClick={() => setActiveImageIndex(idx)}
              aria-label={`Open Detangle gallery image ${idx + 1}`}
            >
              <img src={src} alt={`Detangle gallery image ${idx + 1}`} loading="lazy" />
            </button>
          ))}
        </div>
      </section>

      {activeImageSrc && (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Preview for Detangle gallery image ${activeImageIndex! + 1}`}
          onClick={() => setActiveImageIndex(null)}
        >
          <div className="gallery-lightbox-content" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="gallery-lightbox-close"
              aria-label="Close gallery image preview"
              onClick={() => setActiveImageIndex(null)}
            >
              ×
            </button>
            <img
              src={activeImageSrc}
              alt={`Detangle gallery image ${activeImageIndex! + 1}`}
              className="gallery-lightbox-image"
            />
          </div>
        </div>
      )}
    </>
  )
}

