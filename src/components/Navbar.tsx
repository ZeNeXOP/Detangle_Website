import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import logo from '../assets/IMG_3208.jpg'

type NavbarProps = {
  showBookingCta: boolean
}

export default function Navbar({ showBookingCta }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  // Close the mobile menu whenever the route changes (e.g. back/forward nav).
  const [lastPathname, setLastPathname] = useState(location.pathname)
  if (location.pathname !== lastPathname) {
    setLastPathname(location.pathname)
    setMenuOpen(false)
  }

  return (
    <header className="site-header">
      <div className="site-header-bar">
        <NavLink className="logo-mark" to="/" aria-label="Go to home" onClick={() => setMenuOpen(false)}>
          <img src={logo} alt="Detangle logo" />
        </NavLink>

        <div className="brand-copy">
          <p
            className={`brand-name ${showBookingCta ? 'brand-name--visible' : 'brand-name--hidden'}`}
            aria-hidden={!showBookingCta}
          >
            Detangle
          </p>
        </div>

        <nav className="site-nav site-nav--desktop" aria-label="Primary">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/blog">Blog</NavLink>
          <NavLink to="/events">Events</NavLink>
          {showBookingCta && (
            <Link to="/book" className="button-primary">
              Book a Session
            </Link>
          )}
        </nav>

        <button
          type="button"
          className="nav-toggle"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="site-nav-mobile"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <line x1="1" y1="1" x2="15" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="15" y1="1" x2="1" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
              <rect width="18" height="2.4" rx="1.2" fill="currentColor" />
              <rect y="5.8" width="18" height="2.4" rx="1.2" fill="currentColor" />
              <rect y="11.6" width="18" height="2.4" rx="1.2" fill="currentColor" />
            </svg>
          )}
        </button>
      </div>

      <nav
        id="site-nav-mobile"
        className={`site-nav-mobile ${menuOpen ? 'site-nav-mobile--open' : ''}`}
        aria-label="Mobile"
        aria-hidden={!menuOpen}
      >
        <NavLink to="/" end onClick={() => setMenuOpen(false)}>
          Home
        </NavLink>
        <NavLink to="/about" onClick={() => setMenuOpen(false)}>
          About
        </NavLink>
        <NavLink to="/blog" onClick={() => setMenuOpen(false)}>
          Blog
        </NavLink>
        <NavLink to="/events" onClick={() => setMenuOpen(false)}>
          Events
        </NavLink>
        <Link to="/book" className="button-primary site-nav-mobile-cta" onClick={() => setMenuOpen(false)}>
          Book a Session
        </Link>
      </nav>
    </header>
  )
}
