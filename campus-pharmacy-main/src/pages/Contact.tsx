import React, { useState } from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaAmbulance } from 'react-icons/fa';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement contact form submission
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">Contact Us</h1>
          <p className="text-xl text-center max-w-3xl mx-auto">
            We're here to help with any questions about Campus Pharmacy Finder
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-gray-800">Get in Touch</h2>
                <p className="text-gray-600 mb-8">
                  Have questions, suggestions, or encountered any issues? We're here to help! 
                  Our team is dedicated to improving your experience with Campus Pharmacy Finder.
                </p>
              </div>

              {/* Contact Cards */}
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center mb-4">
                    <FaMapMarkerAlt className="text-blue-600 text-2xl mr-4" />
                    <h3 className="text-xl font-semibold">Project Office</h3>
                  </div>
                  <p className="text-gray-600 ml-10">
                    Department of Computer Science<br />
                    University of Ghana, Legon<br />
                    Greater Accra Region
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center mb-4">
                    <FaEnvelope className="text-blue-600 text-2xl mr-4" />
                    <h3 className="text-xl font-semibold">Email Us</h3>
                  </div>
                  <div className="text-gray-600 ml-10 space-y-2">
                    <p>Technical Support: support@campuspharmacy.ug.edu.gh</p>
                    <p>Pharmacy Partners: pharmacies@campuspharmacy.ug.edu.gh</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center mb-4">
                    <FaClock className="text-blue-600 text-2xl mr-4" />
                    <h3 className="text-xl font-semibold">Working Hours</h3>
                  </div>
                  <div className="text-gray-600 ml-10 space-y-2">
                    <p>Monday - Friday: 8:00 AM - 5:00 PM</p>
                    <p>Weekend support available via email</p>
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg shadow-md p-6">
                  <div className="flex items-center mb-4">
                    <FaAmbulance className="text-red-600 text-2xl mr-4" />
                    <h3 className="text-xl font-semibold text-red-600">Emergency Contacts</h3>
                  </div>
                  <div className="text-gray-600 ml-10 space-y-2">
                    <p>University Hospital: +233 20 000 0002</p>
                    <p>Campus Security: +233 20 000 0003</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Send Us a Message</h2>
              
              {isSubmitted && (
                <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-lg">
                  Thank you for your message! We'll get back to you soon.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>

          {/* Feedback Section */}
          <div className="mt-16 bg-gray-50 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">We Value Your Feedback</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              As a student-led project, we're constantly working to improve Campus Pharmacy Finder. 
              Your feedback helps us better serve the University of Ghana community.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};