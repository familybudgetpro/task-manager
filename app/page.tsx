'use client';

import { useState, useEffect } from 'react';
import { addTask, getTasks, toggleTask, updateTask, updateRemarks, deleteTask } from './actions';

interface Task {
  id: string;
  text: string;
  remarks: string;
  completed: boolean;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [newRemarks, setNewRemarks] = useState('');
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load from DB on mount
  useEffect(() => {
    setMounted(true);
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await getTasks();
      setTasks(data as Task[]);
    } catch (e) {
      console.error('Failed to load tasks', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    try {
      const task = await addTask(newTask, newRemarks);
      setTasks([task as Task, ...tasks]);
      setNewTask('');
      setNewRemarks('');
    } catch (e) {
      console.error('Failed to add task', e);
      alert('Error adding task. Check DB connection.');
    }
  };

  const handleToggleTask = async (id: string, completed: boolean) => {
    try {
      // Optimistic update
      setTasks(tasks.map(t => t.id === id ? { ...t, completed: !completed } : t));
      await toggleTask(id, !completed);
    } catch (e) {
      console.error('Failed to toggle task', e);
      // Revert on error
      fetchTasks();
    }
  };

  const handleUpdateTask = async (id: string, text: string) => {
    try {
      setTasks(tasks.map(t => t.id === id ? { ...t, text } : t));
      await updateTask(id, text);
    } catch (e) {
      console.error('Failed to update task', e);
    }
  };

  const handleUpdateRemarks = async (id: string, remarks: string) => {
    try {
      setTasks(tasks.map(t => t.id === id ? { ...t, remarks } : t));
      await updateRemarks(id, remarks);
    } catch (e) {
      console.error('Failed to update remarks', e);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      setTasks(tasks.filter(t => t.id !== id));
      await deleteTask(id);
    } catch (e) {
      console.error('Failed to delete task', e);
      fetchTasks();
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-8 font-sans text-black">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Data Entry</h1>
          <p className="text-gray-500">Enter and manage your tasks. Now powered by PostgreSQL.</p>
        </div>

        {/* Data Entry Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">New Entry</h2>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Description</label>
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                placeholder="e.g., Review project proposal"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks / Notes</label>
              <textarea
                value={newRemarks}
                onChange={(e) => setNewRemarks(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAddTask())}
                placeholder="e.g., Deadline is Friday..."
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black resize-none"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleAddTask}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-medium shadow-sm active:transform active:scale-95 transition-all"
              >
                Save Record
              </button>
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Records Log ({tasks.length})</h2>
            {loading && <span className="text-sm text-blue-600 animate-pulse">Syncing...</span>}
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-200">
                  <th className="p-4 w-16 text-center">Status</th>
                  <th className="p-4 w-1/3">Task</th>
                  <th className="p-4">Remarks</th>
                  <th className="p-4 w-16 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tasks.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-400">
                      No records found. Use the form above to add data.
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr key={task.id} className={`group hover:bg-gray-50 transition-colors ${task.completed ? 'bg-gray-50/50' : ''}`}>
                      <td className="p-4 text-center align-top">
                        <button
                          onClick={() => handleToggleTask(task.id, task.completed)}
                          title={task.completed ? "Mark as Incomplete" : "Mark as Complete"}
                          className={`w-6 h-6 rounded border inline-flex items-center justify-center transition-colors ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-blue-500 bg-white'}`}
                        >
                          {task.completed && (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      </td>
                      <td className="p-4 align-top">
                        <input
                          type="text"
                          value={task.text}
                          onChange={(e) => handleUpdateTask(task.id, e.target.value)}
                          className={`w-full bg-transparent focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-200 rounded px-1 -ml-1 ${task.completed ? 'text-gray-400 line-through' : 'text-gray-900 font-medium'}`}
                        />
                      </td>
                      <td className="p-4 align-top">
                        <input
                          type="text"
                          value={task.remarks}
                          onChange={(e) => handleUpdateRemarks(task.id, e.target.value)}
                          className={`w-full bg-transparent focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-200 rounded px-1 -ml-1 text-sm ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}
                        />
                      </td>
                      <td className="p-4 text-center align-top">
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-gray-300 hover:text-red-500 p-1 transition-colors"
                          title="Delete Record"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
