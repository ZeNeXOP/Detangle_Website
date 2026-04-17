import { useEffect, useState } from "react";

const registrationUrl = "https://forms.gle/MUzD1EnHe2M9hGAK6";
const posterSrc = "/assets/poster.jpeg";

export default function UpcomingEvent() {
  const [isPosterOpen, setIsPosterOpen] = useState(false);

  useEffect(() => {
    if (!isPosterOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsPosterOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPosterOpen]);

  return (
    <>
      <section className="event-section">
        <div className="event-inner">
          {/* Left: event poster */}
          <button
            type="button"
            className="event-poster-slot event-poster-trigger"
            aria-label="Open event poster"
            onClick={() => setIsPosterOpen(true)}
          >
            <div className="event-poster-placeholder">
              <img
                src={posterSrc}
                alt="From Procrastination to Action workshop poster"
                className="event-poster-image"
              />
            </div>
          </button>

          {/* Right: event details */}
          <div className="event-details">
            <p className="event-eyebrow">Upcoming Workshop · 26 April 2026</p>

            <h2 className="event-title">
              From Procrastination
              <br />
              to Action<span className="event-title-accent">:</span> Focus Reset
            </h2>

            <p className="event-subhead">
              An immersive, activity-based workshop to help you stop
              overthinking and start doing.
            </p>

            <ul className="event-highlights">
              <li>
                <span className="event-highlight-icon">🎨</span>
                Kit with all materials included
              </li>
              <li>
                <span className="event-highlight-icon">👥</span>
                Limited group · intimate experience
              </li>
              <li>
                <span className="event-highlight-icon">🕑</span>2 pm – 4 pm · 2
                hours
              </li>
              <li>
                <span className="event-highlight-icon">📍</span>
                Lucknow · Vijayant khand
              </li>
            </ul>

            <div className="event-meta">
              <span className="event-price">
                ₹599 <span className="event-price-sub">per person</span>
              </span>
            </div>

            <div className="event-cta-row">
              <a
                href={registrationUrl}
                target="_blank"
                rel="noreferrer"
                className="event-register-btn"
              >
                Register Now
              </a>
              <span className="event-facilitator">
                Hosted by <strong>Detangle</strong> · Noopur Asthana
              </span>
            </div>
          </div>
        </div>
      </section>

      {isPosterOpen && (
        <div
          className="poster-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Workshop poster preview"
          onClick={() => setIsPosterOpen(false)}
        >
          <div
            className="poster-lightbox-content"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="poster-lightbox-close"
              aria-label="Close poster preview"
              onClick={() => setIsPosterOpen(false)}
            >
              ×
            </button>
            <img
              src={posterSrc}
              alt="From Procrastination to Action workshop poster"
              className="poster-lightbox-image"
            />
          </div>
        </div>
      )}
    </>
  );
}
