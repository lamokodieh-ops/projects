import React from 'react'

const About = () => {
  const values = [
    "Compassion and empathy",
    "Evidence-based practice",
    "Inclusivity and respect",
    "Client-centered care",
    "Confidentiality and trust"
  ]

  const teamMembers = [
    {
      name: "Dr. Jane Smith, PhD, LPC",
      credentials: "Licensed Professional Counselor (LPC)",
      specializations: "Anxiety, depression, trauma recovery",
      bio: "Dr. Smith has over 10 years of experience helping individuals navigate emotional challenges using evidence-based therapeutic approaches.",
      certifications: "Certified Trauma Therapist (CTT)"
    },
    {
      name: "John Doe, LMFT",
      credentials: "Licensed Marriage and Family Therapist",
      specializations: "Couples therapy, family dynamics, communication",
      bio: "John specializes in helping couples and families strengthen relationships and improve communication.",
      certifications: "Gottman Method Level 2"
    }
  ]

  return (
    <section id="about" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Mission Statement */}
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 tracking-tight">
            About Us
          </h2>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-primary-400 to-transparent mx-auto mb-8"></div>
          <p className="text-xl text-gray-600 mb-12 leading-relaxed font-light max-w-3xl mx-auto">
            Our mission is to provide compassionate, inclusive, and effective therapeutic care that empowers individuals and families to heal, grow, and thrive.
          </p>
        </div>

        {/* Values */}
        <div className="max-w-4xl mx-auto mb-24">
          <h3 className="text-2xl font-light text-gray-900 mb-8 text-center tracking-tight">Our Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <div key={index} className="flex items-start border-l-2 border-gray-200 pl-6 py-2">
                <span className="text-gray-600 font-light">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Approach */}
        <div className="max-w-4xl mx-auto mb-24">
          <h3 className="text-2xl font-light text-gray-900 mb-6 text-center tracking-tight">Our Approach</h3>
          <p className="text-lg text-gray-600 leading-relaxed font-light text-center max-w-3xl mx-auto">
            We use a collaborative, client-centered approach that integrates evidence-based modalities tailored to each individual's needs and goals.
          </p>
        </div>

        {/* Team Members */}
        <div className="max-w-5xl mx-auto">
          <h3 className="text-2xl font-light text-gray-900 mb-12 text-center tracking-tight">Our Team</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white p-8 border border-gray-100">
                <h4 className="text-xl font-normal text-gray-900 mb-2 tracking-tight">
                  {member.name}
                </h4>
                <p className="text-sm text-gray-500 mb-4 font-light">
                  {member.credentials}
                </p>
                <p className="text-sm text-gray-600 mb-4 font-light">
                  <span className="font-normal">Specializations: </span>
                  {member.specializations}
                </p>
                <p className="text-gray-600 leading-relaxed mb-4 font-light">
                  {member.bio}
                </p>
                <p className="text-sm text-gray-500 font-light">
                  <span className="font-normal">Certifications: </span>
                  {member.certifications}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        <div className="max-w-4xl mx-auto mt-24 text-center">
          <p className="text-lg text-gray-600 leading-relaxed font-light">
            Founded with the vision of offering accessible, high-quality mental health care, our practice provides a supportive and welcoming environment for healing and growth.
          </p>
        </div>
      </div>
    </section>
  )
}

export default About

