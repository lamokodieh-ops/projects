import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'

const Services = () => {
  const [selectedService, setSelectedService] = useState(null)

  const services = useMemo(() => [
    {
      id: "individual",
      title: "Individual Therapy",
      image: "/individual.png",
      shortDescription: "One-on-one therapy sessions focused on helping individuals explore personal challenges, develop coping strategies, and achieve meaningful personal growth in a supportive, confidential environment.",
      overview: "Individual therapy provides a confidential, one-on-one space to explore personal challenges, gain insight, and develop tools for emotional well-being. Sessions are tailored to your unique goals, experiences, and pace.",
      focusAreas: [
        "Anxiety and stress",
        "Depression and low mood",
        "Self-esteem and confidence",
        "Life transitions and decision-making",
        "Relationship challenges",
        "Personal growth and self-awareness"
      ],
      approach: "We use evidence-based, client-centered techniques that focus on understanding your experiences while building practical coping strategies you can use in everyday life.",
      duration: "50-minute sessions",
      format: "In-person or virtual options available",
      pricing: "Starting at $120 per session",
      audience: "Adults seeking individualized support, personal insight, and long-term emotional well-being.",
      number: "01"
    },
    {
      id: "couples",
      title: "Couples Therapy",
      image: "/couples.png",
      shortDescription: "Therapy designed to help couples improve communication, resolve conflict, and strengthen emotional connection.",
      overview: "Couples therapy is designed to help partners strengthen communication, rebuild trust, and better understand each other's needs in a supportive and neutral environment.",
      focusAreas: [
        "Communication breakdowns",
        "Conflict resolution",
        "Trust and intimacy concerns",
        "Life transitions or stressors",
        "Premarital or relationship check-ins"
      ],
      approach: "Sessions focus on helping both partners feel heard while developing healthier patterns of communication and connection.",
      duration: "60-minute sessions",
      format: "In-person or virtual options available",
      pricing: "Starting at $150 per session",
      audience: "Couples at any stage of their relationship who want to improve connection, understanding, or navigate challenges together.",
      number: "02"
    },
    {
      id: "family",
      title: "Family Therapy",
      image: "/family.png",
      shortDescription: "Collaborative therapy focused on improving family dynamics, communication, and mutual understanding.",
      overview: "Family therapy supports families in improving communication, resolving conflict, and strengthening relationships by addressing patterns that affect the entire family system.",
      focusAreas: [
        "Parent-child conflict",
        "Blended family transitions",
        "Behavioral concerns",
        "Major life changes",
        "Improving communication and understanding"
      ],
      approach: "We take a collaborative, family-centered approach that honors each member's perspective while working toward shared goals.",
      duration: "60–75 minute sessions",
      format: "In-person or virtual options available",
      pricing: "Starting at $170 per session",
      audience: "Families seeking support during challenging periods or wanting to build healthier relationships.",
      number: "03"
    },
    {
      id: "anxiety",
      title: "Anxiety & Stress Management",
      image: "/anxiety.png",
      shortDescription: "Targeted therapy to help clients manage anxiety, stress, and overwhelm using practical tools and evidence-based approaches.",
      overview: "This service focuses on helping individuals understand and manage anxiety, stress, and overwhelm using practical, evidence-based tools.",
      focusAreas: [
        "Chronic stress or burnout",
        "Generalized anxiety",
        "Panic symptoms",
        "Work-life balance challenges",
        "Overwhelm and racing thoughts"
      ],
      approach: "We focus on identifying triggers, developing coping strategies, and building skills to manage stress more effectively in daily life.",
      duration: "50-minute sessions",
      format: "In-person or virtual options available",
      pricing: "Included in individual therapy pricing",
      audience: "Individuals experiencing anxiety or stress who want practical tools and emotional support.",
      number: "04"
    },
    {
      id: "trauma",
      title: "Trauma-Informed Therapy",
      image: "/trauma.png",
      shortDescription: "Specialized therapy designed to help individuals safely process and heal from past trauma.",
      overview: "Trauma-informed therapy provides a safe, supportive space to process and heal from past trauma at a pace that feels right for you.",
      focusAreas: [
        "Past traumatic experiences",
        "Emotional regulation",
        "Building a sense of safety",
        "Reducing trauma-related symptoms",
        "Restoring trust and self-empowerment"
      ],
      approach: "We prioritize safety, choice, and collaboration, using trauma-informed, evidence-based practices that respect your boundaries and readiness.",
      duration: "50–60 minute sessions",
      format: "In-person or virtual options available",
      pricing: "Starting at $140 per session",
      audience: "Individuals seeking compassionate support for trauma recovery and emotional healing.",
      number: "05"
    },
    {
      id: "transitions",
      title: "Life Transitions & Personal Growth",
      image: "/transitions.png",
      shortDescription: "Therapy to support individuals navigating major life changes, identity exploration, or personal development goals.",
      overview: "This service supports individuals navigating major life changes, identity exploration, or personal development goals.",
      focusAreas: [
        "Career or academic transitions",
        "Relationship changes",
        "Identity exploration",
        "Personal goal setting",
        "Finding direction and clarity"
      ],
      approach: "Sessions are goal-oriented and reflective, helping you gain insight, build confidence, and move forward with intention.",
      duration: "50-minute sessions",
      format: "In-person or virtual options available",
      pricing: "Included in individual therapy pricing",
      audience: "Individuals seeking guidance, clarity, or support during periods of change or growth.",
      number: "06"
    }
  ], [])

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash.startsWith('#services-')) {
        const serviceId = hash.replace('#services-', '')
        const service = services.find(s => s.id === serviceId)
        if (service) {
          setSelectedService(service)
          // Scroll to services section (only if we're on the home page)
          const servicesElement = document.getElementById('services')
          if (servicesElement) {
            servicesElement.scrollIntoView({ behavior: 'smooth' })
          }
        }
      }
    }

    // Check hash on mount with a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      handleHashChange()
    }, 100)

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange)
    
    // Also listen for popstate (back/forward navigation)
    window.addEventListener('popstate', handleHashChange)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('hashchange', handleHashChange)
      window.removeEventListener('popstate', handleHashChange)
    }
  }, [services])

  const closeModal = () => {
    setSelectedService(null)
    // Clear hash when closing
    if (window.location.hash.startsWith('#services-')) {
      window.history.replaceState(null, '', window.location.pathname)
    }
  }

  return (
    <>
      <section id="services" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 tracking-tight">
              Our Services
            </h2>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-primary-400 to-transparent mx-auto mb-6"></div>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto font-light">
              Comprehensive mental health care designed to support your journey to wellness
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {services.map((service) => (
              <div
                key={service.id}
                className="group relative"
              >
                <div className="absolute -left-0 top-0 text-7xl font-extralight text-gray-300 group-hover:text-primary-50 transition-colors duration-300 z-10">
                  {service.number}
                </div>
                {/* Background Image */}
                {service.image && (
                  <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 group-hover:opacity-50 transition-opacity duration-300"
                    style={{
                      backgroundImage: `url(${service.image})`
                    }}
                  ></div>
                )}
                <div className="relative pt-8 border-t border-gray-200 group-hover:border-primary-300 transition-colors duration-300 z-10">
                  <h3 className="text-2xl font-light text-gray-900 mb-4 mt-8 tracking-tight">
                    {service.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed mb-4 font-light">
                    {service.shortDescription}
                  </p>
                  <div className="mb-4 space-y-2">
                    <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">{service.duration}</div>
                    <div className="text-sm text-gray-600 font-light">{service.pricing}</div>
                  </div>
                  <button 
                    onClick={() => setSelectedService(service)}
                    className="inline-flex items-center text-sm font-medium text-gray-900 hover:text-primary-600 transition-colors group/link cursor-pointer"
                  >
                    Learn more
                    <svg className="ml-2 w-4 h-4 transform group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Detail Modal */}
      {selectedService && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div 
            className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-start">
              <h2 className="text-3xl font-light text-gray-900 tracking-tight">
                {selectedService.title}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-8 py-8 space-y-8">
              {/* Overview */}
              <div>
                <h3 className="text-xl font-light text-gray-900 mb-3 tracking-tight">Overview</h3>
                <p className="text-gray-600 leading-relaxed font-light">
                  {selectedService.overview}
                </p>
              </div>

              {/* Focus Areas */}
              <div>
                <h3 className="text-xl font-light text-gray-900 mb-4 tracking-tight">
                  {selectedService.id === "individual" || selectedService.id === "anxiety" || selectedService.id === "trauma" || selectedService.id === "transitions" 
                    ? "What We Work On" 
                    : selectedService.id === "couples" 
                    ? "Common Focus Areas" 
                    : "Common Focus Areas"}
                </h3>
                <ul className="space-y-2">
                  {selectedService.focusAreas.map((area, index) => (
                    <li key={index} className="flex items-start text-gray-600 font-light">
                      <span className="mr-3 mt-1">•</span>
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Approach */}
              <div>
                <h3 className="text-xl font-light text-gray-900 mb-3 tracking-tight">Our Approach</h3>
                <p className="text-gray-600 leading-relaxed font-light">
                  {selectedService.approach}
                </p>
              </div>

              {/* Session Details */}
              <div>
                <h3 className="text-xl font-light text-gray-900 mb-4 tracking-tight">Session Length & Format</h3>
                <ul className="space-y-2 text-gray-600 font-light">
                  <li className="flex items-start">
                    <span className="mr-3 mt-1">•</span>
                    <span>{selectedService.duration}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 mt-1">•</span>
                    <span>{selectedService.format}</span>
                  </li>
                </ul>
              </div>

              {/* Pricing */}
              <div>
                <h3 className="text-xl font-light text-gray-900 mb-3 tracking-tight">Pricing</h3>
                <p className="text-gray-600 font-light">
                  {selectedService.pricing}
                </p>
              </div>

              {/* Who This Is For */}
              <div>
                <h3 className="text-xl font-light text-gray-900 mb-3 tracking-tight">Who This Is For</h3>
                <p className="text-gray-600 leading-relaxed font-light">
                  {selectedService.audience}
                </p>
              </div>

              {/* Next Steps */}
              <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-4">
                <Link to="/book-appointment" onClick={closeModal} className="btn-primary text-center">
                  Book an Appointment
                </Link>
                <Link to="/contact" onClick={closeModal} className="btn-secondary text-center">
                  Contact Us to Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Services
