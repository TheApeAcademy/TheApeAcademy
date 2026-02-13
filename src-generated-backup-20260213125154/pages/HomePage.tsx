import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Common/Button';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">ApeAcademy</h1>
          <div className="space-x-4">
            <Link to="/login">
              <Button variant="secondary">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button variant="primary">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">Premium Assignment Solutions</h2>
          <p className="text-xl text-gray-600 mb-8">
            Submit your academic assignments and get expert solutions delivered on time
          </p>

          <div className="space-x-4">
            <Link to="/signup">
              <Button variant="primary" size="lg" className="inline-block">
                Start Free Trial
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg" className="inline-block">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Easy Submission',
              description: 'Submit assignments with clear instructions and file uploads',
              icon: '📝',
            },
            {
              title: 'Secure Payments',
              description: 'Safe and secure payment processing with Flutterwave',
              icon: '💳',
            },
            {
              title: 'Expert Delivery',
              description: 'Get solutions delivered via email, WhatsApp, or your preferred platform',
              icon: '✅',
            },
          ].map((feature) => (
            <div key={feature.title} className="bg-white rounded-lg shadow p-6">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
