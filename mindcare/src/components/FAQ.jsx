import React, { useState } from 'react'

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      question: "What should I expect in my first session?",
      answer: "Your first session is an opportunity for you and your therapist to get to know each other. We'll discuss your goals, concerns, and what brings you to therapy. This initial session helps us understand your needs and develop a personalized treatment plan."
    },
    {
      question: "Do you offer virtual appointments?",
      answer: "Yes, we offer flexible in-person and virtual sessions to accommodate your preferences and schedule. Virtual sessions are conducted through secure, HIPAA-compliant platforms."
    },
    {
      question: "How do I know which service is right for me?",
      answer: "During your initial consultation, we'll discuss your specific needs and goals. Based on this conversation, we'll recommend the most appropriate service or combination of services. You can also review our service descriptions or contact us directly to discuss your options."
    },
    {
      question: "Do you accept insurance?",
      answer: "We accept most major insurance providers. Please contact us to verify coverage and discuss your specific insurance plan. We'll work with you to understand your benefits and any out-of-pocket costs."
    },
    {
      question: "What is your cancellation policy?",
      answer: "We require at least 24 hours' notice for cancellations to avoid a cancellation fee. This allows us to offer the appointment time to other clients who may be waiting. Please contact us as soon as possible if you need to reschedule."
    },
    {
      question: "How long are therapy sessions?",
      answer: "Session length varies by service type. Individual therapy sessions are typically 50 minutes, while couples and family therapy sessions are 60-75 minutes. We'll confirm the exact duration when you schedule your appointment."
    }
  ]

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 tracking-tight">
              Frequently Asked Questions
            </h2>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-primary-400 to-transparent mx-auto mb-6"></div>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto font-light">
              Common questions about our services and process
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg font-light text-gray-900 pr-8">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-gray-500 flex-shrink-0 transform transition-transform ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-5">
                    <p className="text-gray-600 font-light leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default FAQ

