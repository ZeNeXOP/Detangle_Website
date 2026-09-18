import type { RefObject } from "react";
import { Link } from "react-router-dom";

type LandingHeroProps = {
  heroBookingCtaRef: RefObject<HTMLAnchorElement | null>;
};

export default function LandingHero({ heroBookingCtaRef }: LandingHeroProps) {
  return (
    <section className="landing-hero">
      <h1 className="landing-title">Detangle</h1>
      <p className="landing-subtitle">By Noopur Asthana</p>
      <p className="landing-oneliner">
        Non-judgmental zone me aapka swagat hai!
      </p>
      <Link
        ref={heroBookingCtaRef}
        to="/book"
        className="button-primary landing-booking-cta"
      >
        Let&apos;s Detangle Together
      </Link>
    </section>
  );
}
