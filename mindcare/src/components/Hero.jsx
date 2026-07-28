import React from 'react'
import { Link } from 'react-router-dom'

const Hero = () => {
  return (
    <>
      <section id="home" className="relative min-h-[80vh] md:min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-gray-100"
          style={{
            backgroundImage: `url(${import.meta.env.BASE_URL}hero-image.png)`
          }}
        >
          {/* Overlay for better text readability - lighter overlay like in screenshot */}
          <div className="absolute inset-0 bg-white/50"></div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-6 tracking-tight leading-tight">
              Compassionate Care for
              <span className="block font-normal mt-2">
                Healing, Growth, and Lasting Change
              </span>
            </h1>
            <p className="text-base md:text-lg text-gray-700 mb-10 leading-relaxed max-w-3xl mx-auto font-light">
              We provide personalized, evidence-based therapy to help individuals navigate life's challenges, build resilience, and move toward a healthier, more fulfilling future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/book-appointment" className="btn-primary text-base font-normal tracking-wide px-8 py-3.5">
                Start Your Journey
              </Link>
              <a href="#services" className="btn-secondary text-base font-normal tracking-wide px-8 py-3.5">
                Learn More About Our Services
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Separate below the hero image */}
      <div className="bg-white py-16 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-extralight text-gray-900 mb-3 tracking-tight">10+</div>
              <div className="text-gray-500 font-light tracking-wide text-sm leading-relaxed">Years of Professional Experience</div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-extralight text-gray-900 mb-3 tracking-tight">1,000+</div>
              <div className="text-gray-500 font-light tracking-wide text-sm leading-relaxed">Clients Supported</div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-extralight text-gray-900 mb-3 tracking-tight">95%</div>
              <div className="text-gray-500 font-light tracking-wide text-sm leading-relaxed">Client Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-extralight text-gray-900 mb-3 tracking-tight">✓</div>
              <div className="text-gray-500 font-light tracking-wide text-sm leading-relaxed">Flexible In-Person & Virtual Sessions Available</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Hero
