import React, { useState } from 'react';
import { z } from 'zod';
import { Link } from 'react-router-dom';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(1, 'Message is required'),
});

const UV_Contact: React.FC = () => {
  // Local state for form management
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Validate and submit the form
  const submitContactForm = async (e: React.FormEvent) => {
    e.preventDefault();

    // Use the imported contactSchema for validation

    try {
      // Validate form inputs
      contactSchema.parse({ name, email, message });
      setError(null);

      // Logic to handle form submission (e.g., sending data to backend)
      console.log('Form submitted successfully', { name, email, message });

      // Reset form fields after successful submission
      setName('');
      setEmail('');
      setMessage('');

    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        setError(validationError.errors[0]?.message || 'Validation failed');
      }
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="text-center text-3xl font-extrabold text-gray-900">Contact Us</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              We are here to help you! Just send us a message.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={submitContactForm}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md" aria-live="polite">
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="sr-only">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => { setError(null); setName(e.target.value); }}
                  placeholder="Full Name"
                  className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setError(null); setEmail(e.target.value); }}
                  placeholder="Email address"
                  className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="message" className="sr-only">Message</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  value={message}
                  onChange={(e) => { setError(null); setMessage(e.target.value); }}
                  placeholder="Your message"
                  className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  rows={4}
                ></textarea>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Send Message
              </button>
            </div>
          </form>

          <div className="text-center pt-4">
            <Link to="/" className="text-blue-600 hover:text-blue-500 text-sm font-medium">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_Contact;