"use client"

import type React from "react"

import { useState } from "react"

export default function ContactFormSection() {
  const [formData, setFormData] = useState({
    name: "",
    represent: "BASIC",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRepresentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, represent: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false)
        setFormData({
          name: "",
          represent: "BASIC",
          message: "",
        })
      }, 3000)
    }, 1000)
  }

  return (
    <section className="py-16 bg-[#fffef0]" id="contact">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          {/* FAQ Section */}
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact us</h2>
            <p className="text-gray-600 mb-8 max-w-md">
              Have questions about our investment plans or need personalized advice? Our team of experts is here to help
              you make informed investment decisions.
            </p>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Phone Support</h3>
                  <p className="text-gray-600">+91 1234 567 890</p>
                  <p className="text-gray-500 text-sm">Mon-Fri: 9:00 AM - 6:00 PM</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Email</h3>
                  <p className="text-gray-600">support@RangaOnefinance.com</p>
                  <p className="text-gray-500 text-sm">We'll respond within 24 hours</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Office</h3>
                  <p className="text-gray-600">123 Financial District, Mumbai, India</p>
                  <p className="text-gray-500 text-sm">Visit us for in-person consultation</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-[#0f1d59] text-[#FFFFF0] rounded-xl p-6 md:p-8 shadow-lg">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <p className="text-lg mb-4">Hi 👋 My name is...</p>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name..."
                  className="w-full bg-[#1a2a6c] border border-[#2a3a7c] rounded-md p-3 text-[#FFFFF0] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-6">
                <p className="text-lg mb-4">and I represent</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRepresentChange("BASIC")}
                    className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      formData.represent === "BASIC"
                        ? "bg-white text-[#0f1d59]"
                        : "bg-[#1a2a6c] text-[#FFFFF0] hover:bg-[#2a3a7c]"
                    }`}
                  >
                    BASIC
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRepresentChange("PREMIUM")}
                    className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      formData.represent === "PREMIUM"
                        ? "bg-white text-[#0f1d59]"
                        : "bg-[#1a2a6c] text-[#FFFFF0] hover:bg-[#2a3a7c]"
                    }`}
                  >
                    PREMIUM
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRepresentChange("MODEL PORTFOLIO")}
                    className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      formData.represent === "MODEL PORTFOLIO"
                        ? "bg-white text-[#0f1d59]"
                        : "bg-[#1a2a6c] text-[#FFFFF0] hover:bg-[#2a3a7c]"
                    }`}
                  >
                    MODEL PORTFOLIO
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-lg mb-4">I'd love to ask about...</p>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your question..."
                  rows={4}
                  className="w-full bg-[#1a2a6c] border border-[#2a3a7c] rounded-md p-3 text-[#FFFFF0] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isSubmitted}
                className="w-full bg-white text-[#0f1d59] py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
              >
                {isSubmitting ? "Submitting..." : isSubmitted ? "Submitted!" : "Submit"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
