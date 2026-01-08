import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/logo.jpg";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const response = await axios.post(`${API_URL}/api/token/`, {
        username,
        password,
      });

      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);
      navigate("/");
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    // RESPONSIVE: p-4 on mobile to prevent touching edges
    <div className="min-h-screen flex items-center justify-center bg-astro-dark p-4">
      <div className="bg-astro-card p-8 rounded-2xl shadow-2xl shadow-black/50 border border-gray-800 w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src={logo}
            alt="AstroSoft"
            className="w-20 mx-auto mb-4 rounded-full shadow-lg shadow-blue-500/20"
          />
          <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
          <p className="text-astro-text-muted text-sm mt-1">
            Sign in to manage your finances
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-astro-text-muted mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-astro-dark border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-astro-blue focus:ring-1 focus:ring-astro-blue transition-all"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-astro-text-muted mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-astro-dark border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-astro-blue focus:ring-1 focus:ring-astro-blue transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-astro-blue hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
