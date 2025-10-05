import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { Link } from 'react-router-dom';

const UV_PasswordRecovery: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const clearAuthError = useAppStore((state) => state.clear_auth_error);
  const errorMessage = useAppStore((state) => state.authentication_state.error_message);

  const mutation = useMutation(
    async (email: string) => {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/auth/password-recovery`,
        { email },
        { headers: { 'Content-Type': 'application/json' } }
      );
      return response.data;
    },
    {
      onSuccess: () => {
        setMessage('Password recovery email sent successfully.');
        setEmail('');
      },
      onError: (error: any) => {
        console.error('Recovery error:', error);
        const errorMessage = error.response?.data?.message || 'Password recovery failed';
        setMessage(errorMessage);
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    if (!mutation.isLoading) {
      mutation.mutate(email);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Password Recovery</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter your email to receive a password reset link.
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {message && (
              <div aria-live="polite" className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
                <p className="text-sm">{message}</p>
              </div>
            )}
            {errorMessage && !message && (
              <div aria-live="polite" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                <p className="text-sm">{errorMessage}</p>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={mutation.isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mutation.isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending email...
                  </span>
                ) : (
                  'Send recovery email'
                )}
              </button>
            </div>
            <div className="text-center">
              <Link to="/login" className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                Return to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default UV_PasswordRecovery;