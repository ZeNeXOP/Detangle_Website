import img1 from '../assets/photo_6109390223658650549_w.jpg'
import img2 from '../assets/photo_6109390223658650550_w.jpg'
import img3 from '../assets/photo_6109390223658650551_w.jpg'
import img4 from '../assets/photo_6109390223658650552_w.jpg'
import img5 from '../assets/photo_6109390223658650553_w.jpg'
import img6 from '../assets/photo_6109390223658650554_w.jpg'
import img7 from '../assets/photo_6109390223658650557_w.jpg'
import img8 from '../assets/photo_6269179564168778030_y.jpg'
import img9 from '../assets/photo_6269179564168778031_y.jpg'

const galleryImages = [img1, img2, img3, img4, img5, img6, img7, img8, img9]

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

