import React from 'react';

export const Privacy: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
          <p className="mb-4">
            At Campus Pharmacy Finder, we take your privacy seriously. This Privacy Policy outlines how we collect, 
            use, and protect your personal information when you use our platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Basic user information (name, email) for contact purposes</li>
            <li>Search queries to improve our service</li>
            <li>Location data (only when explicitly shared) to find nearby pharmacies</li>
            <li>Pharmacy registration information for verification purposes</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To provide and improve our pharmacy finding service</li>
            <li>To communicate important updates and responses to inquiries</li>
            <li>To verify pharmacy registrations and maintain service quality</li>
            <li>To analyze usage patterns and improve user experience</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Protection</h2>
          <p className="mb-4">
            We implement various security measures to protect your personal information:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Secure data storage and encryption</li>
            <li>Regular security audits and updates</li>
            <li>Limited access to personal information</li>
            <li>Strict data handling procedures</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
          <p className="mb-4">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access your personal information</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Opt-out of marketing communications</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="mb-4">
            If you have any questions about our Privacy Policy, please contact us at:
            <br />
            Email: privacy@campuspharmacy.com
            <br />
            Address: University of Ghana, Legon Campus
          </p>
        </section>

        <div className="text-sm text-gray-600">
          Last updated: December 13, 2024
        </div>
      </div>
    </div>
  );
};
