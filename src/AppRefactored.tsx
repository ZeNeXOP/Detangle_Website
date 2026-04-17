import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import Hero from './pages/Hero'
import About from './pages/About'
import Registration from './pages/Registration'
import Gallery from './pages/Gallery'
import { workshops } from './data/workshops'
import type { Page } from './types'

const bookingSessionUrl = 'https://forms.gle/6CcMTZwz3zCo6Nre8'
const logoImage = '/assets/IMG_3208.PNG'

export default function AppRefactored() {
  const [page, setPage] = useState<Page>('home')
  const [showNavBookingCta, setShowNavBookingCta] = useState(false)
  const heroBookingCtaRef = useRef<HTMLAnchorElement | null>(null)

  const apiBaseUrl = useMemo(
    () => import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000',
    [],
  )

  useEffect(() => {
    const syncNavBookingCta = () => {
      if (page !== 'home') {
        setShowNavBookingCta(true)
        return
      }

      const heroBookingCta = heroBookingCtaRef.current
      if (!heroBookingCta) {
        setShowNavBookingCta(false)
        return
      }

      const { bottom } = heroBookingCta.getBoundingClientRect()
      setShowNavBookingCta(bottom <= 84)
    }

    syncNavBookingCta()
    window.addEventListener('scroll', syncNavBookingCta, { passive: true })
    window.addEventListener('resize', syncNavBookingCta)

    return () => {
      window.removeEventListener('scroll', syncNavBookingCta)
      window.removeEventListener('resize', syncNavBookingCta)
    }
  }, [page])

  return (
    <div className="site-shell">
      <Navbar
        page={page}
        onNavigate={setPage}
        bookingSessionUrl={bookingSessionUrl}
        logoImage={logoImage}
        showBookingCta={showNavBookingCta}
      />

      <main className="page-main">
        {page === 'home' && (
          <Hero
            bookingSessionUrl={bookingSessionUrl}
            heroBookingCtaRef={heroBookingCtaRef}
            onOpenGallery={() => setPage('gallery')}
          />
        )}

        {page === 'about' && <About bookingSessionUrl={bookingSessionUrl} />}

        {page === 'gallery' && (
          <div className="content-shell">
            <Gallery />
          </div>
        )}

        {page === 'register' && (
          <div className="content-shell" style={{ paddingTop: '92px' }}>
            <Registration workshops={workshops} bookingSessionUrl={bookingSessionUrl} apiBaseUrl={apiBaseUrl} />
          </div>
        )}
      </main>
    </div>
  )
}

