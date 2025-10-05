import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { searchTaskInputSchema } from '@/DB/zodschemas.ts';

interface Task {
  task_id: string;
  title: string;
}

const UV_SearchResults: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get('query') || '';

  const authToken = useAppStore(state => state.authentication_state.auth_token);

  const searchTasks = async (query: string): Promise<Task[]> => {
    const { data } = await axios.get<{ results: Task[] }>(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/tasks`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
        params: { query },
      }
    );
    return data.results;
  };

  const { data: tasks, isLoading, isError } = useQuery(['searchTasks', query], () => searchTasks(query), {
    enabled: !!query,
    staleTime: 60000,
    retry: 1,
  });

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Search Results</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
              {isLoading && (
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600"></div>
                </div>
              )}
              {isError && <p className="text-red-500">Failed to load search results.</p>}
              {tasks && tasks.length === 0 && !isLoading && (
                <p className="text-gray-500">No results found for your query.</p>
              )}
              {tasks && tasks.length > 0 && (
                <ul className="space-y-4">
                  {tasks.map(task => (
                    <li key={task.task_id} className="bg-white shadow overflow-hidden rounded-lg">
                      <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">{task.title}</h3>
                        <Link to={`/tasks/${task.task_id}`} className="text-blue-600 hover:underline">
                          View Task Details
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default UV_SearchResults;