import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Hero from './pages/Hero'
import About from './pages/About'
import BookSession from './pages/BookSession'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'

const AdminApp = lazy(() => import('./admin/AdminApp'))

export default function AppRefactored() {
  const location = useLocation()
  const navigate = useNavigate()
  const [showNavBookingCta, setShowNavBookingCta] = useState(false)
  const heroBookingCtaRef = useRef<HTMLAnchorElement | null>(null)
  const isHome = location.pathname === '/'
  const isAdmin = location.pathname.startsWith('/admin')

  useEffect(() => {
    if (isAdmin) {
      return
    }

    const syncNavBookingCta = () => {
      if (!isHome) {
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
  }, [isHome, isAdmin])

  if (isAdmin) {
    return (
      <Suspense fallback={<div className="admin-loading">Loading admin…</div>}>
        <AdminApp />
      </Suspense>
    )
  }

  return (
    <div className="site-shell">
      <Navbar showBookingCta={showNavBookingCta} />

      <main className="page-main">
        <Routes>
          <Route
            path="/"
            element={<Hero heroBookingCtaRef={heroBookingCtaRef} onOpenEvents={() => navigate('/events')} />}
          />
          <Route path="/about" element={<About />} />
          <Route
            path="/events"
            element={
              <div className="content-shell">
                <Events />
              </div>
            }
          />
          <Route
            path="/events/:slug"
            element={
              <div className="content-shell">
                <EventDetail />
              </div>
            }
          />
          <Route
            path="/book"
            element={
              <div className="content-shell" style={{ paddingTop: '92px' }}>
                <BookSession />
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  )
}
