import React from 'react';
import { Link } from 'react-router-dom';

const GV_Footer: React.FC = () => {

  return (
    <>
      <footer className="bg-white shadow-lg shadow-gray-200/50 border-t border-gray-200 text-gray-700 fixed bottom-0 w-full">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex space-x-6">
            <Link to="/about" className="hover:text-blue-700 transition-colors">
              About Us
            </Link>
            <Link to="/contact" className="hover:text-blue-700 transition-colors">
              Contact Support
            </Link>
            <Link to="/privacy-policy" className="hover:text-blue-700 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-of-use" className="hover:text-blue-700 transition-colors">
              Terms of Use
            </Link>
          </div>
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} TodoMaster. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
};

export default GV_Footer;