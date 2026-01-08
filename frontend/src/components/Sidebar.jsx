import React from "react";
import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  Landmark,
  LogOut,
  Users,
  Briefcase,
  X, // Import Close Icon
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";

// Accept isOpen and onClose props for mobile handling
const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Income", icon: Wallet, path: "/income" },
    { name: "Expenses", icon: CreditCard, path: "/expenses" },
    { name: "Liabilities", icon: Landmark, path: "/liabilities" },
    { name: "Clients", icon: Briefcase, path: "/customers" },
    { name: "Payroll", icon: Users, path: "/payroll" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Overlay (Dark background when menu is open) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar Container */}
      <div
        className={`
        fixed top-0 left-0 h-screen w-64 bg-astro-card border-r border-gray-800 flex flex-col z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0
      `}
      >
        {/* Logo Section */}
        <div className="p-8 flex flex-col items-center relative">
          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 md:hidden text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>

          <img
            src={logo}
            alt="AstroSoft"
            className="w-24 mb-3 rounded-full shadow-lg shadow-blue-900/20"
          />
          <h1 className="text-xl font-bold text-white">AstroSoft</h1>
          <p className="text-xs text-astro-light-blue font-medium tracking-wider">
            TECHNOLOGY
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => onClose()} // Close menu when a link is clicked on mobile
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-astro-blue text-white shadow-lg shadow-blue-900/20"
                    : "text-astro-text-muted hover:bg-gray-800/50 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={20}
                    className={
                      isActive
                        ? "text-white"
                        : "text-astro-text-muted group-hover:text-white"
                    }
                  />
                  <span className="font-medium">{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-astro-text-muted hover:text-red-500 hover:bg-red-500/10 w-full rounded-xl transition-all group"
          >
            <LogOut size={20} className="group-hover:text-red-500" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
