import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Auth from './components/Auth';

const API_BASE_URL = 'http://localhost:8089/api/tasks';
const TEAM_MEMBERS = ['Gopal', 'Alex Johnson', 'Sarah Connor', 'Michael Scott'];

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userRole, setUserRole] = useState(localStorage.getItem('role'));
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('username'));

  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [assignedTo, setAssignedTo] = useState(TEAM_MEMBERS[0]);
  const [dueDate, setDueDate] = useState('');

  const [filterStatus, setFilterStatus] = useState('ALL');
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  // Setup Axios Interceptor
  axios.interceptors.request.use(
      (config) => {
        const jwt = localStorage.getItem('token');
        if (jwt) {
          config.headers.Authorization = `Bearer ${jwt}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
  );

  const fetchTasks = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/paged`, {
        params: {
          pageNo: currentPage,
          pageSize: 20,
          status: filterStatus === 'ALL' ? '' : filterStatus,
          keyword: keyword,
          sortBy: 'id',
          sortDir: 'desc'
        }
      });
      setTasks(response.data.tasks);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        handleLogout();
      }
    }
  };

  useEffect(() => {
    if (token) fetchTasks();
  }, [token, currentPage, filterStatus, keyword]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await axios.post(API_BASE_URL, {
        title,
        description,
        priority,
        status: 'PENDING',
        assignedTo,
        dueDate: dueDate || null
      });
      setTitle('');
      setDescription('');
      setDueDate('');
      fetchTasks();
    } catch (error) {
      alert('Failed to create task. Check backend server permissions.');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/${id}`, { status: newStatus });
      fetchTasks();
    } catch (error) {
      alert('Failed to update status.');
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/${id}`);
      fetchTasks();
    } catch (error) {
      alert('Access Denied: Only ADMIN accounts can delete tasks.');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setUserRole(null);
    setCurrentUser(null);
  };

  if (!token) {
    return (
        <Auth
            onLoginSuccess={() => {
              setToken(localStorage.getItem('token'));
              setUserRole(localStorage.getItem('role'));
              setCurrentUser(localStorage.getItem('username'));
            }}
        />
    );
  }

  // Filter tasks: ADMIN sees all tasks, standard USER only sees tasks assigned to them
  const displayedTasks = tasks.filter((task) => {
    if (userRole === 'ROLE_ADMIN') return true;
    return task.assignedTo?.toLowerCase() === currentUser?.toLowerCase();
  });

  return (
      <div className="min-h-screen bg-slate-100 p-6 text-slate-800 font-sans">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex justify-between items-center border-b pb-4 border-slate-200">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {userRole === 'ROLE_ADMIN' ? 'Admin Workload Dashboard' : 'My Assigned Tasks'}
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Logged in as: <strong>{currentUser}</strong> ({userRole})
              </p>
            </div>
            <button
                onClick={handleLogout}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold px-4 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>

          {/* Task Creation Form (ADMIN ONLY) */}
          {userRole === 'ROLE_ADMIN' && (
              <form onSubmit={handleCreateTask} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <h2 className="text-md font-bold text-slate-800">➕ Assign New Task</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                      type="text"
                      placeholder="Task Title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="p-2.5 border rounded-lg border-slate-300 outline-indigo-600 text-sm"
                      required
                  />
                  <input
                      type="text"
                      placeholder="Description..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="p-2.5 border rounded-lg border-slate-300 outline-indigo-600 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Assign To</label>
                    <select
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                        className="w-full p-2.5 border rounded-lg border-slate-300 text-sm bg-white"
                    >
                      {TEAM_MEMBERS.map((member) => (
                          <option key={member} value={member}>{member}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Priority</label>
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full p-2.5 border rounded-lg border-slate-300 text-sm bg-white"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Due Date</label>
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full p-2 border rounded-lg border-slate-300 text-sm"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold p-2.5 rounded-lg transition text-sm shadow-sm"
                    >
                      Assign Task
                    </button>
                  </div>
                </div>
              </form>
          )}

          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
            <input
                type="text"
                placeholder="Search by keyword..."
                value={keyword}
                onChange={(e) => { setKeyword(e.target.value); setCurrentPage(0); }}
                className="p-2 border border-slate-300 rounded-lg text-sm w-full md:w-72"
            />

            <div className="flex gap-2">
              {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
                  <button
                      key={status}
                      onClick={() => { setFilterStatus(status); setCurrentPage(0); }}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                          filterStatus === status ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                  >
                    {status}
                  </button>
              ))}
            </div>
          </div>

          {/* Task Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedTasks.length > 0 ? (
                displayedTasks.map((task) => (
                    <div key={task.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <h3 className="font-bold text-slate-900">{task.title}</h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              task.priority === 'HIGH' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                      {task.priority}
                    </span>
                        </div>
                        <p className="text-xs text-slate-500 mb-3">{task.description}</p>
                        <p className="text-xs font-medium text-slate-700">Assigned to: <strong>{task.assignedTo || 'Unassigned'}</strong></p>
                      </div>

                      <div className="flex items-center justify-between pt-2 text-xs border-t border-slate-100">
                        <span className="text-slate-400">📅 {task.dueDate || 'No Due Date'}</span>

                        <div className="flex items-center gap-2">
                          <select
                              value={task.status}
                              onChange={(e) => handleStatusChange(task.id, e.target.value)}
                              className="p-1 border rounded bg-slate-50 font-semibold text-slate-700"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="IN_PROGRESS">IN_PROGRESS</option>
                            <option value="COMPLETED">COMPLETED</option>
                          </select>

                          {userRole === 'ROLE_ADMIN' && (
                              <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="text-red-500 hover:text-red-700 font-bold p-1"
                                  title="Delete Task"
                              >
                                🗑️
                              </button>
                          )}
                        </div>
                      </div>
                    </div>
                ))
            ) : (
                <div className="col-span-full text-center py-12 text-slate-400 text-sm">
                  No tasks found for your account.
                </div>
            )}
          </div>

        </div>
      </div>
  );
}