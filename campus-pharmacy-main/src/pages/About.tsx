import React, { useEffect, useRef } from 'react';

export const About: React.FC = () => {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        const scrolled = window.scrollY;
        parallaxRef.current.style.transform = `translateY(${scrolled * 0.5}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const teamMembers = [
    { name: 'Smith Duncan Hawa Micha', role: 'Team Lead & Frontend Developer' },
    { name: 'Samuel Gyasi Fordjour', role: 'Backend Developer' },
    { name: 'Kabutey Samuel Edem', role: 'Database Administrator' },
    { name: 'Baffah Matilda', role: 'UI/UX Designer' },
    { name: 'Julia Ofori-Mensah', role: 'Quality Assurance' },
    { name: 'James Tinkorang', role: 'Frontend Developer' },
    { name: 'Terrence Kedzi', role: 'Backend Developer' },
    { name: 'Owusu Ansah', role: 'Mobile Developer' },
    { name: 'Larry Dapaah', role: 'System Analyst' },
    { name: 'Neequaye Solomon', role: 'Content Manager' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Parallax */}
      <div className="relative h-[50vh] overflow-hidden">
        <div 
          ref={parallaxRef}
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1576671081837-49000212a370?auto=format&fit=crop&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: -1
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        <div className="relative h-full flex items-center justify-center text-white">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">About Us</h1>
            <p className="text-xl">Making Healthcare Accessible on Campus</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        {/* Who We Are Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Who We Are</h2>
          <p className="text-lg text-gray-700">
            We are a team dedicated to making it easier for students to find the medications 
            they need quickly and easily at campus pharmacies. Our goal is to streamline the 
            process of locating medications, saving time and effort for students on the go.
          </p>
        </section>

        {/* Mission Statement */}
        <section className="mb-16 bg-blue-50 p-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-lg text-gray-700">
            Our mission is to ensure that students always have access to accurate and up-to-date 
            information about medication availability at their campus pharmacies. We aim to create 
            a seamless experience where students can find and access the medications they need 
            without the hassle.
          </p>
        </section>

        {/* How It Works */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Search', description: 'Search for your medication' },
              { step: 2, title: 'Find', description: 'View available pharmacies' },
              { step: 3, title: 'Locate', description: 'Get directions and contact details' },
              { step: 4, title: 'Purchase', description: 'Buy directly from the pharmacy' }
            ].map(item => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 text-2xl font-bold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-center mb-2">{member.name}</h3>
                <p className="text-gray-600 text-center">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="mb-16 bg-gray-50 p-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-6">Why Choose Us?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-3">Real-Time Updates</h3>
              <p className="text-gray-600">Get instant updates on medication availability and pricing</p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-3">Easy Navigation</h3>
              <p className="text-gray-600">Find the nearest pharmacy with turn-by-turn directions</p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-3">Verified Information</h3>
              <p className="text-gray-600">All listed pharmacies and medications are verified</p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">What Our Users Are Saying</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600 italic mb-4">
                "I saved so much time by using this app to find the medication I needed at the campus pharmacy. It's so easy to use!"
              </p>
              <p className="font-semibold">- Sarah, Medical Student</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600 italic mb-4">
                "The real-time availability feature is a game-changer. No more walking to multiple pharmacies to find what I need."
              </p>
              <p className="font-semibold">- Michael, Graduate Student</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};