import React, { useState } from 'react';
import axios from 'axios';

const AUTH_API = 'http://localhost:8089/api/auth';

export default function Auth({ onLoginSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('ROLE_USER');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (isLogin) {
                const response = await axios.post(`${AUTH_API}/login`, { username, password });
                const { accessToken, role: userRole } = response.data;

                // Store JWT token and role in localStorage
                localStorage.setItem('token', accessToken);
                localStorage.setItem('username', username);
                localStorage.setItem('role', userRole);

                onLoginSuccess();
            } else {
                await axios.post(`${AUTH_API}/signup`, { username, password, role });
                setIsLogin(true);
                alert('Registration successful! Please log in.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed. Please check credentials.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200 w-full max-w-md space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">{isLogin ? 'Sign In' : 'Create Account'}</h2>
                    <p className="text-slate-500 text-sm mt-1">Access the Team Workload Dashboard</p>
                </div>

                {error && <div className="p-3 text-xs bg-red-100 text-red-600 rounded-lg">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Username</label>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-2.5 border rounded-lg border-slate-300 outline-indigo-600 text-sm"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2.5 border rounded-lg border-slate-300 outline-indigo-600 text-sm"
                        />
                    </div>

                    {!isLogin && (
                        <div>
                            <label className="text-xs font-semibold text-slate-600 block mb-1">Role</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full p-2.5 border rounded-lg border-slate-300 text-sm bg-white"
                            >
                                <option value="ROLE_USER">User (Standard Access)</option>
                                <option value="ROLE_ADMIN">Admin (Full Control)</option>
                            </select>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold p-2.5 rounded-lg transition text-sm shadow-sm"
                    >
                        {isLogin ? 'Log In' : 'Sign Up'}
                    </button>
                </form>

                <div className="text-center pt-2">
                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-xs text-indigo-600 hover:underline font-medium"
                    >
                        {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
                    </button>
                </div>
            </div>
        </div>
    );
}