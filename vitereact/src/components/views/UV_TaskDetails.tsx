import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';

interface TaskDetailsData {
  title: string;
  description: string | null;
  priority: 'high' | 'medium' | 'low';
  due_date: string | null;
  task_id: string;
}

const UV_TaskDetails: React.FC = () => {
  const { task_id } = useParams<{ task_id: string }>();
  const auth_token = useAppStore(state => state.authentication_state.auth_token);

  // Fetch task details
  const { data, error, isLoading } = useQuery<TaskDetailsData>({
    queryKey: ['taskDetails', task_id],
    queryFn: async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/tasks/${task_id}`, {
        headers: {
          'Authorization': `Bearer ${auth_token}`,
        },
      });
      return response.data;
    },
    enabled: !!task_id && !!auth_token,
  });

  useEffect(() => {
    if (error) {
      console.error('Error fetching task details:', error);
    }
  }, [error]);

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-8">
        {isLoading && (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-700">
            Error fetching task details. Please try again later.
          </div>
        )}

        {data && (
          <div className="bg-white shadow-xl rounded-lg p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{data.title}</h2>
              <p className="text-gray-600">{data.description}</p>
            </div>

            <div className="flex space-x-4">
              <span className={`px-3 py-1 rounded-full text-white ${
                data.priority === 'high' ? 'bg-red-600' : data.priority === 'medium' ? 'bg-yellow-600' : 'bg-green-600'
              }`}>
                {data.priority.charAt(0).toUpperCase() + data.priority.slice(1)} Priority
              </span>
              {data.due_date && (
                <span className="text-gray-700">
                  Due: {new Date(data.due_date).toLocaleDateString()}
                </span>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Link to={`/tasks/${data.task_id}/edit`} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200">
                Edit Task
              </Link>
              <Link to="/dashboard" className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg border border-gray-300">
                Back to Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UV_TaskDetails;