import React from 'react';
import { Link } from 'react-router-dom';

const UV_About: React.FC = () => {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full">
          <h1 className="text-center text-4xl font-bold text-gray-900 leading-tight mb-10">
            About TodoMaster
          </h1>
          <div className="bg-white p-8 rounded-xl shadow-lg shadow-gray-200/50">
            <p className="text-base text-gray-600 leading-relaxed mb-6">
              Welcome to TodoMaster, the comprehensive solution for all your task management needs. Our mission is to enhance productivity and organization by providing an intuitive, user-friendly platform that allows users to manage their tasks effectively.
            </p>
            <p className="text-base text-gray-600 leading-relaxed mb-6">
              The team behind TodoMaster believes in empowering individuals and teams to harness their full potential through better management and collaboration. Whether you're planning your day or coordinating with a team on a large project, TodoMaster is designed to support you every step of the way.
            </p>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Our Mission
            </h2>
            <p className="text-base text-gray-600 leading-relaxed mb-6">
              Our mission is simple: to help you manage tasks better, achieve your goals, and focus on what truly matters. We are continually evolving TodoMaster with new features and improvements to ensure it meets your needs.
            </p>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Meet the Team
            </h2>
            <p className="text-base text-gray-600 leading-relaxed mb-6">
              TodoMaster is developed by a dedicated team of professionals passionate about productivity and efficiency. Our diverse team combines expertise in software development, design, and user experience to bring you a seamless task management tool.
            </p>
            <div className="flex justify-between mt-8">
              <Link to="/contact" className="text-blue-600 hover:text-blue-800 font-medium">
                Contact Us
              </Link>
              <Link to="/privacy-policy" className="text-blue-600 hover:text-blue-800 font-medium">
                Privacy Policy
              </Link>
              <Link to="/terms-of-use" className="text-blue-600 hover:text-blue-800 font-medium">
                Terms of Use
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_About;