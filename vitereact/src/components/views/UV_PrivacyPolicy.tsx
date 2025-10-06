import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

const UV_PrivacyPolicy: React.FC = () => {

  const fetchPrivacyPolicy = async () => {
    // Placeholder for API call to fetch privacy policy text
    return Promise.resolve("This is the privacy policy text. Replace this with actual content from your API.");
  };

  const { data: privacyPolicyText, isLoading } = useQuery({
    queryKey: ['fetchPrivacyPolicy'],
    queryFn: fetchPrivacyPolicy,
    staleTime: 60000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="flex-grow container mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">Privacy Policy</h1>
          {isLoading ? (
            <div className="flex justify-center items-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div></div>
          ) : (
            <div className="bg-white shadow-lg rounded-xl p-8 text-gray-800">
              <p>{privacyPolicyText}</p>
            </div>
          )}
        </div>
        <footer className="bg-gray-100 mt-auto py-4">
          <div className="container mx-auto text-center">
            <Link to="/" className="text-blue-600 hover:underline mx-4">Home</Link>
            <Link to="/contact" className="text-blue-600 hover:underline mx-4">Contact Us</Link>
            <Link to="/terms-of-use" className="text-blue-600 hover:underline mx-4">Terms of Use</Link>
          </div>
        </footer>
      </div>
    </>
  );
};

export default UV_PrivacyPolicy;