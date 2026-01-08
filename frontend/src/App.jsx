import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Income from "./pages/Income";
import Expenses from "./pages/Expenses";
import Liabilities from "./pages/Liabilities";
import Payroll from "./pages/Payroll";
import Customers from "./pages/Customers"; // Imported Customers page

// Protected Route Component
const PrivateRoute = ({ children }) => {
  // Ensure this matches the key you set in Login.jsx (usually "access" or "access_token")
  const token = localStorage.getItem("access_token");
  return token ? children : <Navigate to="/login" />;
};

function App() {
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
              <div className="flex bg-astro-dark min-h-screen">
                {/* Sidebar stays fixed on the left */}
                <Sidebar />

                {/* Main Content Area */}
                <main className="flex-1 ml-64 relative z-10">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/income" element={<Income />} />
                    <Route path="/expenses" element={<Expenses />} />
                    <Route path="/liabilities" element={<Liabilities />} />
                    <Route path="/payroll" element={<Payroll />} />
                    {/* New Customers Route */}
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
