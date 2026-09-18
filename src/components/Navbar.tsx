import { Link, NavLink } from 'react-router-dom'
import logo from '../assets/IMG_3208.jpg'


type NavbarProps = {
  showBookingCta: boolean
}

export default function Navbar({ showBookingCta }: NavbarProps) {
  return (
    <header className="site-header">
      <NavLink className="logo-mark" to="/" aria-label="Go to home">
        <img src={logo} alt="Detangle logo" />
      </NavLink>

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
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/events">Events</NavLink>
        {showBookingCta && (
          <Link to="/book" className="button-primary">
            Book a Session
          </Link>
        )}
      </nav>
    </header>
  )
}
