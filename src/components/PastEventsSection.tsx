const img1 = "/assets/photo_6109390223658650549_w.jpg";
const img2 = "/assets/photo_6109390223658650550_w.jpg";
const img3 = "/assets/photo_6109390223658650551_w.jpg";
const img4 = "/assets/photo_6109390223658650552_w.jpg";
const img5 = "/assets/photo_6109390223658650553_w.jpg";
const img6 = "/assets/photo_6109390223658650554_w.jpg";
const img7 = "/assets/photo_6109390223658650557_w.jpg";
const img8 = "/assets/photo_6269179564168778030_y.jpg";
const img9 = "/assets/photo_6269179564168778031_y.jpg";

type PastEventsSectionProps = {
  onOpenEvents: () => void;
};

export default function PastEventsSection({
  onOpenEvents,
}: PastEventsSectionProps) {
  // Images for the landing-page "Past Events" scroller (right-to-left)
  // Keep imports in this file so it stays easy to swap/add gallery images later.
  const images = [
    { src: img1, alt: "Detangle event photo 1" },
    { src: img2, alt: "Detangle event photo 2" },
    { src: img3, alt: "Detangle event photo 3" },
    { src: img4, alt: "Detangle event photo 4" },
    { src: img5, alt: "Detangle event photo 5" },
    { src: img6, alt: "Detangle event photo 6" },
    { src: img7, alt: "Detangle event photo 7" },
    { src: img8, alt: "Detangle event photo 8" },
    { src: img9, alt: "Detangle event photo 9" },
  ];

  return (
    <section className="section">
      <h2>Past Events</h2>
      <p className="section-intro">
        Detangle sessions are designed to be practical, reflective, and easy to
        apply in real life.
      </p>

      <div
        className="past-events-strip"
        aria-label="Past events preview"
      >
        <div className="past-events-marquee">
          {[...images, ...images].map((img, idx) => (
            <button
              key={`${img.alt}-${idx}`}
              className="past-events-thumb"
              type="button"
              onClick={onOpenEvents}
              aria-label={`Open events archive (${img.alt})`}
            >
              <img src={img.src} alt={img.alt} loading="lazy" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
