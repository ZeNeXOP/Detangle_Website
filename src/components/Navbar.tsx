import type { Page } from '../types'

type NavbarProps = {
  page: Page
  onNavigate: (nextPage: Page) => void
  bookingSessionUrl: string
  logoImage: string
  showBookingCta: boolean
}

export default function Navbar({
  page,
  onNavigate,
  bookingSessionUrl,
  logoImage,
  showBookingCta,
}: NavbarProps) {
  return (
    <header className="site-header">
      <button
        className="logo-mark"
        onClick={() => onNavigate('home')}
        type="button"
        aria-label="Go to home"
      >
        <img src={logoImage} alt="Detangle logo" />
      </button>

      <div className="brand-copy">
        <p
          className={`brand-name ${
            showBookingCta ? 'brand-name--visible' : 'brand-name--hidden'
          }`}
          aria-hidden={!showBookingCta}
        >
          Detangle
        </p>
      </div>

      <nav className="site-nav">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          aria-current={page === 'home' ? 'page' : undefined}
        >
          Home
        </button>
        <button
          type="button"
          onClick={() => onNavigate('about')}
          aria-current={page === 'about' ? 'page' : undefined}
        >
          About
        </button>
        <button
          type="button"
          onClick={() => onNavigate('gallery')}
          aria-current={page === 'gallery' ? 'page' : undefined}
        >
          Gallery
        </button>
        {showBookingCta && (
          <a href={bookingSessionUrl} target="_blank" rel="noreferrer" className="button-primary">
            Book a Session
          </a>
        )}
      </nav>
    </header>
  )
}

