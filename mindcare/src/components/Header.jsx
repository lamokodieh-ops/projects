import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isServicesOpen, setIsServicesOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleServiceClick = (hash) => {
    setIsServicesOpen(false)
    setIsMenuOpen(false)
    if (location.pathname !== '/') {
      navigate('/')
      // Wait a bit for navigation, then set hash
      setTimeout(() => {
        window.location.hash = hash
      }, 100)
    } else {
      window.location.hash = hash
    }
  }

  const handleServicesClick = (e) => {
    if (location.pathname !== '/') {
      e.preventDefault()
      navigate('/')
      setTimeout(() => {
        window.location.hash = '#services'
      }, 100)
    }
  }

  const handleHomeClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
      // Clear any hash if present
      window.history.replaceState(null, '', '/')
    }
  }

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" onClick={handleHomeClick} className="flex items-center">
            <span className="text-2xl font-light text-gray-900 tracking-tight">MindCare</span>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center space-x-10">
            <li><Link to="/" onClick={handleHomeClick} className="text-gray-600 hover:text-gray-900 transition-colors font-light tracking-wide text-sm">Home</Link></li>
            <li 
              className="relative"
              onMouseEnter={() => setIsServicesOpen(true)}
              onMouseLeave={() => setIsServicesOpen(false)}
            >
              <a href="#services" onClick={handleServicesClick} className="text-gray-600 hover:text-gray-900 transition-colors font-light tracking-wide text-sm flex items-center py-2">
                Services
                <svg className={`ml-1 w-4 h-4 transition-transform ${isServicesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
              {isServicesOpen && (
                <div className="absolute top-full left-0 pt-2 w-64 bg-transparent z-50">
                  <div className="bg-white border border-gray-200 shadow-lg py-2">
                    <button onClick={() => handleServiceClick('#services-individual')} className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors font-light">
                      Individual Therapy
                    </button>
                    <button onClick={() => handleServiceClick('#services-couples')} className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors font-light">
                      Couples Therapy
                    </button>
                    <button onClick={() => handleServiceClick('#services-family')} className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors font-light">
                      Family Therapy
                    </button>
                    <button onClick={() => handleServiceClick('#services-anxiety')} className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors font-light">
                      Anxiety & Stress Management
                    </button>
                    <button onClick={() => handleServiceClick('#services-trauma')} className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors font-light">
                      Trauma-Informed Therapy
                    </button>
                    <button onClick={() => handleServiceClick('#services-transitions')} className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors font-light">
                      Life Transitions & Personal Growth
                    </button>
                  </div>
                </div>
              )}
            </li>
            <li><Link to="/about" className="text-gray-600 hover:text-gray-900 transition-colors font-light tracking-wide text-sm">About</Link></li>
            <li><Link to="/faq" className="text-gray-600 hover:text-gray-900 transition-colors font-light tracking-wide text-sm">FAQ</Link></li>
            <li><Link to="/contact" className="text-gray-600 hover:text-gray-900 transition-colors font-light tracking-wide text-sm">Contact</Link></li>
            <li><Link to="/book-appointment" className="btn-primary text-sm inline-block">Book Appointment</Link></li>
          </ul>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-600 focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <ul className="md:hidden mt-6 space-y-5 pb-6 border-t border-gray-100 pt-6">
            <li><Link to="/" onClick={(e) => { handleHomeClick(e); setIsMenuOpen(false); }} className="block text-gray-600 hover:text-gray-900 transition-colors font-light tracking-wide text-sm">Home</Link></li>
            <li>
              <button 
                onClick={() => setIsServicesOpen(!isServicesOpen)}
                className="flex items-center justify-between w-full text-gray-600 hover:text-gray-900 transition-colors font-light tracking-wide text-sm"
              >
                Services
                <svg className={`w-4 h-4 transition-transform ${isServicesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isServicesOpen && (
                <ul className="mt-2 ml-4 space-y-3">
                  <li><button onClick={() => handleServiceClick('#services-individual')} className="block w-full text-left text-gray-500 hover:text-gray-900 transition-colors font-light text-sm">Individual Therapy</button></li>
                  <li><button onClick={() => handleServiceClick('#services-couples')} className="block w-full text-left text-gray-500 hover:text-gray-900 transition-colors font-light text-sm">Couples Therapy</button></li>
                  <li><button onClick={() => handleServiceClick('#services-family')} className="block w-full text-left text-gray-500 hover:text-gray-900 transition-colors font-light text-sm">Family Therapy</button></li>
                  <li><button onClick={() => handleServiceClick('#services-anxiety')} className="block w-full text-left text-gray-500 hover:text-gray-900 transition-colors font-light text-sm">Anxiety & Stress Management</button></li>
                  <li><button onClick={() => handleServiceClick('#services-trauma')} className="block w-full text-left text-gray-500 hover:text-gray-900 transition-colors font-light text-sm">Trauma-Informed Therapy</button></li>
                  <li><button onClick={() => handleServiceClick('#services-transitions')} className="block w-full text-left text-gray-500 hover:text-gray-900 transition-colors font-light text-sm">Life Transitions & Personal Growth</button></li>
                </ul>
              )}
            </li>
            <li><Link to="/about" onClick={() => setIsMenuOpen(false)} className="block text-gray-600 hover:text-gray-900 transition-colors font-light tracking-wide text-sm">About</Link></li>
            <li><Link to="/faq" onClick={() => setIsMenuOpen(false)} className="block text-gray-600 hover:text-gray-900 transition-colors font-light tracking-wide text-sm">FAQ</Link></li>
            <li><Link to="/contact" onClick={() => setIsMenuOpen(false)} className="block text-gray-600 hover:text-gray-900 transition-colors font-light tracking-wide text-sm">Contact</Link></li>
            <li><Link to="/book-appointment" onClick={() => setIsMenuOpen(false)} className="btn-primary w-full text-sm text-center inline-block">Book Appointment</Link></li>
          </ul>
        )}
      </nav>
    </header>
  )
}

export default Header
