import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Menu } from "lucide-react"; // Import Menu Icon
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Income from "./pages/Income";
import Expenses from "./pages/Expenses";
import Liabilities from "./pages/Liabilities";
import Payroll from "./pages/Payroll";
import Customers from "./pages/Customers";

// Protected Route Component
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("access_token");
  return token ? children : <Navigate to="/login" />;
};

function App() {
  // State to manage sidebar on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      <Routes>
        {/* Public Route: Login */}
        <Route path="/login" element={<Login />} />

        {/* Private Routes Wrapper */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <div className="flex bg-astro-dark min-h-screen relative">
                {/* Mobile Header (Only visible on small screens) */}
                <div className="md:hidden fixed top-0 left-0 w-full bg-astro-card border-b border-gray-800 p-4 z-30 flex items-center justify-between">
                  <div className="font-bold text-white text-lg">AstroSoft</div>
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="text-white p-2 bg-gray-800 rounded-lg"
                  >
                    <Menu size={24} />
                  </button>
                </div>

                {/* Sidebar (Pass state and close function) */}
                <Sidebar
                  isOpen={isSidebarOpen}
                  onClose={() => setIsSidebarOpen(false)}
                />

                {/* Main Content Area */}
                <main className="flex-1 md:ml-64 relative z-10 pt-20 md:pt-0 transition-all">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/income" element={<Income />} />
                    <Route path="/expenses" element={<Expenses />} />
                    <Route path="/liabilities" element={<Liabilities />} />
                    <Route path="/payroll" element={<Payroll />} />
                    <Route path="/customers" element={<Customers />} />
                  </Routes>
                </main>
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
