import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';

const UV_TaskEdit: React.FC = () => {
  const { task_id } = useParams<{ task_id: string }>();
  const navigate = useNavigate();
  
  const authToken = useAppStore(state => state.authentication_state.auth_token);

  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string | null>(null);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [dueDate, setDueDate] = useState<string | null>(null);

  const { data: taskData } = useQuery({
    queryKey: ['task', task_id],
    queryFn: async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/tasks/${task_id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      return response.data;
    },
    enabled: !!task_id,
  });

  const updateTaskMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.put(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/tasks/${task_id}`, {
        title,
        description,
        priority,
        due_date: dueDate,
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      navigate(`/tasks/${task_id}`);
    },
    onError: (error: any) => {
      console.error("Task update failed:", error);
    },
  });

  useEffect(() => {
    if (taskData) {
      setTitle(taskData.title);
      setDescription(taskData.description || null);
      setPriority(taskData.priority || 'medium');
      setDueDate(taskData.due_date || null);
    }
  }, [taskData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTaskMutation.mutate();
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Edit Task</h2>
          {updateTaskMutation.isError && (
            <p className="bg-red-50 text-red-600 p-4 mb-4 border border-red-200 rounded-md">
              Error updating task. Please try again.
            </p>
          )}
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="block w-full p-3 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={description || ''}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="block w-full p-3 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low')}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <input
                type="date"
                id="due_date"
                value={dueDate || ''}
                onChange={(e) => setDueDate(e.target.value)}
                className="block w-full p-3 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end">
              <Link to={`/tasks/${task_id}`} className="text-gray-600 hover:text-gray-800 px-4 py-2 mr-4">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={updateTaskMutation.isPending}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                {updateTaskMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default UV_TaskEdit;