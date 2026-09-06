import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8089/api/tasks';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch tasks on initial mount or when filter changes
  useEffect(() => {
    fetchTasks();
  }, [filterStatus]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const url = filterStatus ? `${API_BASE_URL}?status=${filterStatus}` : API_BASE_URL;
      const response = await axios.get(url);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const newTask = {
        title,
        description,
        priority,
        status: 'PENDING',
      };
      await axios.post(API_BASE_URL, newTask);
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/${id}/status?status=${newStatus}`);
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/${id}`);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'HIGH':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'LOW':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusBadge = (s) => {
    switch (s) {
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
      <div className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Header */}
          <div className="border-b border-slate-200 pb-5">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Workload & Task Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Manage priorities, track work statuses, and organize tasks across your team.
            </p>
          </div>

          {/* Task Creation Form */}
          <form onSubmit={handleCreateTask} className="bg-white shadow-sm border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-indigo-600" /> Create New Task
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-3">
                <input
                    type="text"
                    placeholder="Task title..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Task description (optional)..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="flex flex-col justify-between space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Priority</label>
                  <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-sm"
                  >
                    <option value="LOW">Low Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="HIGH">High Priority</option>
                  </select>
                </div>
                <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white font-medium py-2 rounded-lg hover:bg-indigo-700 transition duration-150 text-sm shadow"
                >
                  Add Task
                </button>
              </div>
            </div>
          </form>

          {/* Filter Controls */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-600">Filter Status:</span>
              {['', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
                  <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          filterStatus === status
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                  >
                    {status || 'ALL'}
                  </button>
              ))}
            </div>
            <span className="text-xs text-slate-500 font-medium">
            Total Tasks: {tasks.length}
          </span>
          </div>

          {/* Task List */}
          {loading ? (
              <div className="text-center py-10 text-slate-500">Loading tasks...</div>
          ) : tasks.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-600 text-sm">No tasks found in this view.</p>
              </div>
          ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-800">{task.title}</h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-full ${getPriorityBadge(task.priority)}`}>
                      {task.priority}
                    </span>
                        </div>
                        {task.description && (
                            <p className="text-sm text-slate-600">{task.description}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none cursor-pointer ${getStatusBadge(task.status)}`}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="IN_PROGRESS">IN PROGRESS</option>
                          <option value="COMPLETED">COMPLETED</option>
                        </select>

                        <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                ))}
              </div>
          )}
        </div>
      </div>
  );
}
