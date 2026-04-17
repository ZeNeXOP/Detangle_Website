import type { RefObject } from "react";

type LandingHeroProps = {
  bookingSessionUrl: string;
  heroBookingCtaRef: RefObject<HTMLAnchorElement | null>;
};

export default function LandingHero({
  bookingSessionUrl,
  heroBookingCtaRef,
}: LandingHeroProps) {
  return (
    <section className="landing-hero">
      <h1 className="landing-title">Detangle</h1>
      <p className="landing-subtitle">By Noopur Asthana</p>
      <p className="landing-oneliner">
        Non-judgmental zone me aapka swagat hai!
      </p>
      <a
        ref={heroBookingCtaRef}
        href={bookingSessionUrl}
        target="_blank"
        rel="noreferrer"
        className="button-primary landing-booking-cta"
      >
        Let&apos;s Detangle Together
      </a>
    </section>
  );
}
