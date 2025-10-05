import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';

const GV_TopNav: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const logoutUser = useAppStore(state => state.logout_user);

  const handleSearch = async () => {
    if (!searchQuery) return [];

    const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/tasks`, {
      headers: {
        Authorization: `Bearer ${useAppStore.getState().authentication_state.auth_token}`, // Directly fetch token from Zustand state
      },
      params: {
        query: searchQuery,
      },
    });

    return data.map((task: any) => ({
      task_id: task.task_id,
      title: task.title,
      description: task.description,
      is_completed: task.is_completed,
      priority: task.priority,
      due_date: new Date(task.due_date),
    }));
  };

  const { data: searchResults, refetch: performSearch } = useQuery({
    queryFn: handleSearch,
    queryKey: ['tasks', searchQuery],
    enabled: false, // Disable automatic fetching; only execute on user action
  });

  const handleLogout = () => {
    logoutUser();
  };

  return (
    <>
      <nav className="bg-white shadow fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/dashboard" className="flex items-center">
                <img 
                  src="/logo.svg" 
                  alt="Logo" 
                  className="h-8 w-auto"
                />
                <span className="ml-2 text-xl text-gray-900 font-bold">TodoMaster</span>
              </Link>
              <div className="ml-6">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Tasks..."
                  className="py-2 px-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
                <button
                  onClick={performSearch}
                  className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition"
                >
                  Search
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {currentUser && (
                <>
                  <span className="text-gray-700 hidden md:block">
                    Welcome, {currentUser.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <div className="h-16"></div> {/* Spacer to prevent content from being hidden under fixed navbar */}
    </>
  );
};

export default GV_TopNav;