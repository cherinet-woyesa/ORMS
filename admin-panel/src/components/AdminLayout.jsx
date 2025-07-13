import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { FiHome, FiMenu, FiUsers, FiCalendar, FiShoppingCart, FiSettings, FiLogOut, FiPieChart } from "react-icons/fi";
import { useState } from "react";

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Updated to match your actual page paths
  const navItems = [
    { path: "/admin", icon: <FiHome size={20} />, label: "Dashboard" },
    { path: "/orders", icon: <FiShoppingCart size={20} />, label: "Order" }, // Points to OrderPage.jsx
    { path: "/menu", icon: <FiMenu size={20} />, label: "Menu" }, // Points to MenuManagement.jsx
    { path: "/reservations", icon: <FiCalendar size={20} />, label: "Reservations" },
    { path: "/users", icon: <FiUsers size={20} />, label: "Users" },
    { path: "/analytics", icon: <FiPieChart size={20} />, label: "Analytics" },
    { path: "/settings", icon: <FiSettings size={20} />, label: "Settings" },
  ];

  const isActive = (path) => 
    location.pathname === path || 
    location.pathname.startsWith(`${path}/`);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="md:hidden bg-white shadow-sm p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-blue-600">Ogaden Admin</h2>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`${mobileMenuOpen ? "block" : "hidden"} md:block w-full md:w-64 bg-white shadow-md md:shadow-lg transition-all duration-300`}
      >
        <div className="p-6 space-y-8 h-full flex flex-col">
          {/* Branding */}
          <div className="hidden md:block">
            <h2 className="text-2xl font-bold text-blue-600 flex items-center">
              <span className="bg-blue-100 p-2 rounded-lg mr-3">
                <FiMenu size={24} className="text-blue-600" />
              </span>
              Ogaden Admin
            </h2>
            <p className="text-xs text-gray-500 mt-1">Restaurant Management System</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path) 
                    ? "bg-blue-50 text-blue-600 font-medium" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className={`mr-3 ${isActive(item.path) ? "text-blue-500" : "text-gray-400"}`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Footer/Logout */}
          <div className="mt-auto pt-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <FiLogOut size={20} className="mr-3 text-red-500" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        <div className="max-w-full mx-auto bg-white rounded-lg shadow-sm p-6">
          {children}
        </div>
      </main>
    </div>
  );
}