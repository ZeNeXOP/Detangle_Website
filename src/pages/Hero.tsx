import type { RefObject } from 'react'
import LandingHero from '../components/LandingHero'
import UpcomingEvent from '../components/UpcomingEvent'
import WelcomeSection from '../components/WelcomeSection'
import ServicesSection from '../components/ServicesSection'
import PastEventsSection from '../components/PastEventsSection'

type HeroPageProps = {
  heroBookingCtaRef: RefObject<HTMLAnchorElement | null>
  onOpenEvents: () => void
}

export default function Hero({ heroBookingCtaRef, onOpenEvents }: HeroPageProps) {
  return (
    <div className="home-stack">
      <LandingHero heroBookingCtaRef={heroBookingCtaRef} />
      <UpcomingEvent />
      <WelcomeSection />
      <ServicesSection />
      <PastEventsSection onOpenEvents={onOpenEvents} />
    </div>
  )
}
