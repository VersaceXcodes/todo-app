import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAppStore } from '@/store/main';

const UV_Landing: React.FC = () => {
  const isAuthenticated = useAppStore(
    (state) => state.authentication_state.authentication_status.is_authenticated
  );

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center items-center">
        <div className="max-w-3xl p-6 bg-white shadow-lg rounded-xl">
          <h1 className="text-4xl font-bold text-gray-900 text-center mb-6">
            Welcome to TodoMaster
          </h1>
          <p className="text-base leading-relaxed text-gray-600 text-center mb-8">
            Your go-to app for managing tasks efficiently and collaboratively.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/signup"
              className="px-6 py-3 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Sign Up
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-lg font-medium text-gray-900 bg-gray-100 hover:bg-gray-200 transition-all duration-200 border border-gray-300"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_Landing;