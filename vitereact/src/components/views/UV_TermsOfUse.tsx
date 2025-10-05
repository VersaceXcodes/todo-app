import React from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/main';

const UV_TermsOfUse: React.FC = () => {
  // Global store access
  const isAuthenticated = useAppStore(state => state.authentication_state.authentication_status.is_authenticated);

  // Placeholder static content for terms of use
  const termsOfUseText = `
    Welcome to TodoMaster!
    By using this application, you agree to the following terms and conditions.
    Please read these terms carefully before using the application. If you do not agree to these terms, you may not use the application.
    
    1. **General Conditions**: 
       - You must not misuse the service provided by TodoMaster.
       - You must abide by all applicable local, state, national, and international laws and regulations.

    2. **User Responsibilities**: 
       - You are responsible for maintaining the confidentiality of your login credentials.
       - You are responsible for all activities that occur under your account.

    3. **Termination**: 
       - TodoMaster reserves the right to terminate your access to the service at any time, without notice, for conduct that violates these Terms or is harmful to other users of the service.

    4. **Modifications to the Service**: 
       - TodoMaster reserves the right to modify or discontinue, temporarily or permanently, the service (or any part thereof) with or without notice.

    Please revisit the terms page periodically to ensure awareness of any updates or changes.
  `;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center items-center py-12">
        <div className="max-w-3xl mx-auto p-8 bg-white rounded-xl shadow-lg space-y-6">
          <h1 className="text-4xl font-bold text-center text-gray-900">
            Terms of Use
          </h1>
          <p className="text-base text-gray-700 leading-relaxed">
            {termsOfUseText}
          </p>
          <div className="text-center mt-6">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-all duration-200"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/signup"
                className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-all duration-200"
              >
                Sign Up
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_TermsOfUse;