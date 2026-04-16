import type { RefObject } from 'react'
import LandingHero from '../components/LandingHero'
import UpcomingEvent from '../components/UpcomingEvent'
import WelcomeSection from '../components/WelcomeSection'
import ServicesSection from '../components/ServicesSection'
import PastWorkshopsSection from '../components/PastWorkshopsSection'

type HeroPageProps = {
  bookingSessionUrl: string
  heroBookingCtaRef: RefObject<HTMLAnchorElement | null>
  onRegister: () => void
  onOpenGallery: () => void
}

export default function Hero({
  bookingSessionUrl,
  heroBookingCtaRef,
  onRegister,
  onOpenGallery,
}: HeroPageProps) {
  return (
    <div className="home-stack">
      <LandingHero bookingSessionUrl={bookingSessionUrl} heroBookingCtaRef={heroBookingCtaRef} />
      <UpcomingEvent />
      <WelcomeSection />
      <ServicesSection />
      <PastWorkshopsSection onRegister={onRegister} onOpenGallery={onOpenGallery} />
    </div>
  )
}

