import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from '@/store/main';

/* Component Imports */
import GV_TopNav from '@/components/views/GV_TopNav.tsx';
import GV_Footer from '@/components/views/GV_Footer.tsx';
import UV_Landing from '@/components/views/UV_Landing.tsx';
import UV_SignUp from '@/components/views/UV_SignUp.tsx';
import UV_Login from '@/components/views/UV_Login.tsx';
import UV_PasswordRecovery from '@/components/views/UV_PasswordRecovery.tsx';
import UV_Dashboard from '@/components/views/UV_Dashboard.tsx';
import UV_TaskDetails from '@/components/views/UV_TaskDetails.tsx';
import UV_TaskEdit from '@/components/views/UV_TaskEdit.tsx';
import UV_SearchResults from '@/components/views/UV_SearchResults.tsx';
import UV_About from '@/components/views/UV_About.tsx';
import UV_Contact from '@/components/views/UV_Contact.tsx';
import UV_PrivacyPolicy from '@/components/views/UV_PrivacyPolicy.tsx';
import UV_TermsOfUse from '@/components/views/UV_TermsOfUse.tsx';

/* Initialize a QueryClient */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

/* Loading Spinner Component */
const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center min-h-screen bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600"></div>
  </div>
);

/* Protected Route Wrapper */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAppStore(state => state.authentication_state.authentication_status.is_authenticated);
  const isLoading = useAppStore(state => state.authentication_state.authentication_status.is_loading);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const initializeAuth = useAppStore(state => state.initialize_auth);
  const isAuthenticated = useAppStore(state => state.authentication_state.authentication_status.is_authenticated);
  const isLoading = useAppStore(state => state.authentication_state.authentication_status.is_loading);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen flex flex-col">
          {/* Render TopNav only when authenticated */}
          {isAuthenticated && <GV_TopNav />}
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<UV_Landing />} />
              <Route path="/signup" element={<UV_SignUp />} />
              <Route path="/login" element={<UV_Login />} />
              <Route path="/password-recovery" element={<UV_PasswordRecovery />} />
              <Route path="/about" element={<UV_About />} />
              <Route path="/contact" element={<UV_Contact />} />
              <Route path="/privacy-policy" element={<UV_PrivacyPolicy />} />
              <Route path="/terms-of-use" element={<UV_TermsOfUse />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><UV_Dashboard /></ProtectedRoute>} />
              <Route path="/tasks/:task_id" element={<ProtectedRoute><UV_TaskDetails /></ProtectedRoute>} />
              <Route path="/tasks/:task_id/edit" element={<ProtectedRoute><UV_TaskEdit /></ProtectedRoute>} />
              <Route path="/search" element={<ProtectedRoute><UV_SearchResults /></ProtectedRoute>} />

              {/* Catch all - redirect to dashboard if authenticated, else landing */}
              <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />} />
            </Routes>
          </main>
          {/* Footer is always present */}
          <GV_Footer />
        </div>
      </QueryClientProvider>
    </Router>
  );
};

export default App;