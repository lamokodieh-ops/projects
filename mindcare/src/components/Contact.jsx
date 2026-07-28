import React, { useState } from 'react'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    contactMethod: 'email'
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form submitted:', formData)
    alert('Thank you for your message. We will contact you soon.')
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: '',
      contactMethod: 'email'
    })
  }

  return (
    <section id="contact" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 tracking-tight">
              Contact Us
            </h2>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-primary-400 to-transparent mx-auto mb-6"></div>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto font-light">
              Get in touch with us to schedule an appointment or learn more about our services
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Information */}
            <div>
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-light text-gray-900 mb-6 tracking-tight">Contact Information</h3>
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-gray-400 mr-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <div>
                        <div className="text-gray-900 font-light">Phone</div>
                        <a href="tel:+15551234567" className="text-gray-600 hover:text-gray-900 transition-colors font-light">(555) 123-4567</a>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-gray-400 mr-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <div className="text-gray-900 font-light">Email</div>
                        <a href="mailto:info@practiceemail.com" className="text-gray-600 hover:text-gray-900 transition-colors font-light">info@practiceemail.com</a>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-gray-400 mr-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        <div className="text-gray-900 font-light">Address</div>
                        <address className="text-gray-600 not-italic font-light">
                          123 Main Street, Suite 400<br />
                          City, State, ZIP
                        </address>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-200">
                  <h4 className="text-lg font-light text-gray-900 mb-4 tracking-tight">Office Hours</h4>
                  <div className="text-gray-600 font-light space-y-2">
                    <div>Monday–Friday: 9:00 AM – 6:00 PM</div>
                    <div>Saturday: By appointment only</div>
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-200">
                  <h4 className="text-lg font-light text-gray-900 mb-4 tracking-tight">Parking & Accessibility</h4>
                  <p className="text-gray-600 font-light">
                    Free on-site parking available. Wheelchair accessible entrance and restrooms.
                  </p>
                </div>

                <div className="pt-8 border-t border-gray-200">
                  <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-red-800">Emergency Information</h4>
                        <p className="mt-2 text-sm text-red-700 font-light">
                          If you are experiencing a medical or mental health emergency, please call <strong>911</strong> or your local emergency number immediately.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h3 className="text-xl font-light text-gray-900 mb-6 tracking-tight">Send Us a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-light text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 focus:border-gray-900 focus:outline-none transition-colors font-light"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-light text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 focus:border-gray-900 focus:outline-none transition-colors font-light"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-light text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-gray-900 focus:outline-none transition-colors font-light"
                  />
                </div>

                <div>
                  <label htmlFor="contactMethod" className="block text-sm font-light text-gray-700 mb-2">
                    Preferred Contact Method
                  </label>
                  <select
                    id="contactMethod"
                    name="contactMethod"
                    value={formData.contactMethod}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-gray-900 focus:outline-none transition-colors font-light bg-white"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-light text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-gray-900 focus:outline-none transition-colors font-light resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full text-base font-normal tracking-wide"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact

