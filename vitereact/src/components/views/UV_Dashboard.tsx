import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/store/main';
import axios from 'axios';

const UV_Dashboard: React.FC = () => {
  // Selectors from Zustand store
  const currentUser = useAppStore((state) => state.authentication_state.current_user);
  const auth_token = useAppStore((state) => state.authentication_state.auth_token);
  const logout_user = useAppStore((state) => state.logout_user);

  // Fetch task lists
  const fetchTaskLists = async () => {
    if (!currentUser) return;
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/task-lists`, {
      headers: {
        Authorization: `Bearer ${auth_token}`,
      },
      params: {
        user_id: currentUser.user_id,
      },
    });
    return response.data;
  };

  // Fetch tasks
  const fetchTasks = async () => {
    if (!currentUser) return;
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/tasks`, {
      headers: {
        Authorization: `Bearer ${auth_token}`,
      },
      params: {
        user_id: currentUser.user_id,
      },
    });
    return response.data;
  };

  // useQuery hooks to fetch data
  const { data: taskLists, isLoading: isTaskListsLoading, error: taskListsError } = useQuery(['taskLists', currentUser?.user_id], fetchTaskLists, {
    enabled: !!currentUser?.user_id,
    staleTime: 60000,
  });

  const { data: tasks, isLoading: isTasksLoading, error: tasksError } = useQuery(['tasks', currentUser?.user_id], fetchTasks, {
    enabled: !!currentUser?.user_id,
    staleTime: 60000,
  });

  const handleLogout = () => {
    logout_user();
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow">
          {/* Navigation */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
              {currentUser && (
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Welcome back, {currentUser.name}!
                  </h2>
                </div>
              )}
              {isTaskListsLoading || isTasksLoading ? (
                <div className="text-center">
                  <span className="text-gray-600">Loading your tasks...</span>
                </div>
              ) : (taskListsError || tasksError) ? (
                <div className="text-center text-red-600">
                  <span>Error loading your tasks. Please try again later.</span>
                </div>
              ) : (
                <div>
                  {taskLists?.length === 0 && tasks?.length === 0 ? (
                    <div className="text-center">
                      <span className="text-gray-600">No tasks found. Start by adding some!</span>
                      <Link to="/tasks/new" className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                        Add Task
                      </Link>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Your Task Lists</h3>
                      <ul className="mt-4 space-y-6">
                        {taskLists?.map((list: { list_id: string, name: string }) => (
                          <li key={list.list_id} className="bg-white shadow overflow-hidden rounded-lg">
                            <div className="px-4 py-5 sm:px-6">
                              <h4 className="text-lg font-medium text-gray-900">{list.name}</h4>
                            </div>
                            <ul className="divide-y divide-gray-200">
                              {tasks?.filter((task: { task_id: string, title: string, list_id: string, is_completed: boolean }) => task.list_id === list.list_id).map((task) => (
                                <li key={task.task_id} className="px-4 py-4 sm:px-6 flex justify-between items-center">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{task.title}</p>
                                    <p className="text-sm text-gray-500">{task.is_completed ? 'Completed' : 'Pending'}</p>
                                  </div>
                                  <Link to={`/tasks/${task.task_id}`} className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                                    View
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default UV_Dashboard;