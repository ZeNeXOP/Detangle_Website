type PastWorkshopsSectionProps = {
  onOpenGallery: () => void
}

export default function PastWorkshopsSection({
  onOpenGallery,
}: PastWorkshopsSectionProps) {
  // Images for the landing-page "Past Workshops" scroller (right-to-left)
  // Keep imports in this file so it stays easy to swap/add gallery images later.
  const images = [
    { src: '/assets/workshop-1.jpg', alt: 'Detangle workshop photo 1' },
    { src: '/assets/workshop-2.jpg', alt: 'Detangle workshop photo 2' },
    { src: '/assets/workshop-3.jpg', alt: 'Detangle workshop photo 3' },
    { src: '/assets/workshop-4.jpg', alt: 'Detangle workshop photo 4' },
    { src: '/assets/workshop-5.jpg', alt: 'Detangle workshop photo 5' },
    { src: '/assets/workshop-6.jpg', alt: 'Detangle workshop photo 6' },
    { src: '/assets/workshop-7.jpg', alt: 'Detangle workshop photo 7' },
    { src: '/assets/workshop-8.jpg', alt: 'Detangle workshop photo 8' },
    { src: '/assets/workshop-9.jpg', alt: 'Detangle workshop photo 9' },
  ]

  return (
    <section className="section">
      <h2>Past Workshops</h2>
      <p className="section-intro">
        Detangle sessions are designed to be practical, reflective, and easy to apply in real life.
      </p>

      <div className="past-workshops-strip" aria-label="Past workshops gallery preview">
        <div className="past-workshops-marquee">
          {[...images, ...images].map((img, idx) => (
            <button
              key={`${img.alt}-${idx}`}
              className="past-workshops-thumb"
              type="button"
              onClick={onOpenGallery}
              aria-label={`Open gallery (${img.alt})`}
            >
              <img src={img.src} alt={img.alt} loading="lazy" />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

