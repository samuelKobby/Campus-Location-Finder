import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';

export const HowItWorks: React.FC = () => (
  <section className="py-16 bg-white">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
      <div className="grid md:grid-cols-3 gap-8">
        <Step
          icon="Sparkles"
          title="Search Medication"
          description="Search for the medication you need using our easy-to-use search system."
        />
        <Step
          icon="Pill"
          title="Find Pharmacies"
          description="View a list of nearby pharmacies that have your medication in stock."
        />
        <Step
          icon="Beaker"
          title="Get Directions"
          description="Get directions and contact information for your chosen pharmacy."
        />
      </div>
      <div className="text-center mt-12">
        <Link
          to="/about"
          className="inline-block bg-gray-100 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Learn More
        </Link>
      </div>
    </div>
  </section>
);

interface StepProps {
  icon: "Sparkles" | "Pill" | "Beaker";
  title: string;
  description: string;
}

const Step: React.FC<StepProps> = ({ icon, title, description }) => (
  <div className="text-center">
    <div className="w-16 h-16 mx-auto mb-4 text-blue-500">
      <Icon name={icon} className="w-full h-full" />
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);