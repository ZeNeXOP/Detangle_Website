const img1 = "/assets/photo_6109390223658650549_w.jpg";
const img2 = "/assets/photo_6109390223658650550_w.jpg";
const img3 = "/assets/photo_6109390223658650551_w.jpg";
const img4 = "/assets/photo_6109390223658650552_w.jpg";
const img5 = "/assets/photo_6109390223658650553_w.jpg";
const img6 = "/assets/photo_6109390223658650554_w.jpg";
const img7 = "/assets/photo_6109390223658650557_w.jpg";
const img8 = "/assets/photo_6269179564168778030_y.jpg";
const img9 = "/assets/photo_6269179564168778031_y.jpg";

type PastWorkshopsSectionProps = {
  onOpenGallery: () => void;
};

export default function PastWorkshopsSection({
  onOpenGallery,
}: PastWorkshopsSectionProps) {
  // Images for the landing-page "Past Workshops" scroller (right-to-left)
  // Keep imports in this file so it stays easy to swap/add gallery images later.
  const images = [
    { src: img1, alt: "Detangle workshop photo 1" },
    { src: img2, alt: "Detangle workshop photo 2" },
    { src: img3, alt: "Detangle workshop photo 3" },
    { src: img4, alt: "Detangle workshop photo 4" },
    { src: img5, alt: "Detangle workshop photo 5" },
    { src: img6, alt: "Detangle workshop photo 6" },
    { src: img7, alt: "Detangle workshop photo 7" },
    { src: img8, alt: "Detangle workshop photo 8" },
    { src: img9, alt: "Detangle workshop photo 9" },
  ];

  return (
    <section className="section">
      <h2>Past Workshops</h2>
      <p className="section-intro">
        Detangle sessions are designed to be practical, reflective, and easy to
        apply in real life.
      </p>

      <div
        className="past-workshops-strip"
        aria-label="Past workshops gallery preview"
      >
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
  );
}
