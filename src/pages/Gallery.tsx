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
  return (
    <section className="section gallery-section">
      <h2>Gallery</h2>
      <p className="section-intro">A glimpse of past workshops and expressive sessions.</p>

      <div className="gallery-grid">
        {galleryImages.map((src, idx) => (
          <div key={`${src}-${idx}`} className="gallery-tile">
            <img src={src} alt={`Detangle gallery image ${idx + 1}`} loading="lazy" />
          </div>
        ))}
      </div>
    </section>
  )
}

