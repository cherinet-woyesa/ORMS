import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import {
  FiHome, FiMenu, FiUsers, FiCalendar, FiShoppingCart, FiLogOut,
  FiPieChart, FiGrid, FiStar, FiGift, FiTruck, FiClock, FiDollarSign,
  FiCamera, FiPackage, FiUserCheck, FiList, FiCreditCard, FiShoppingBag,
  FiLayout, FiBell, FiSearch, FiPlus, FiChevronDown, FiMessageSquare,
  FiSettings, FiBarChart2, FiMail, FiX
} from "react-icons/fi";

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navItems = [
    { path: "/admin", icon: <FiHome size={20} />, label: "Dashboard", category: "main" },
    { path: "/orders", icon: <FiShoppingCart size={20} />, label: "Orders", category: "main" },
    { path: "/kitchen", icon: <FiGrid size={20} />, label: "Kitchen", category: "main" },
    { path: "/menu", icon: <FiMenu size={20} />, label: "Menu", category: "main" },
    { path: "/qr-generator", icon: <FiCamera size={20} />, label: "QR Codes", category: "main" },
    { path: "/restaurants", icon: <FiShoppingBag size={20} />, label: "Restaurants", category: "manage" },
    { path: "/customers", icon: <FiUsers size={20} />, label: "Customers", category: "manage" },
    { path: "/staff", icon: <FiUserCheck size={20} />, label: "Staff", category: "manage" },
    { path: "/tables", icon: <FiLayout size={20} />, label: "Tables", category: "manage" },
    { path: "/waitlist", icon: <FiList size={20} />, label: "Waitlist", category: "service" },
    { path: "/reservations", icon: <FiCalendar size={20} />, label: "Reservations", category: "service" },
    { path: "/delivery", icon: <FiTruck size={20} />, label: "Delivery", category: "service" },
    { path: "/scheduled-orders", icon: <FiClock size={20} />, label: "Scheduled", category: "service" },
    { path: "/inventory", icon: <FiPackage size={20} />, label: "Inventory", category: "service" },
    { path: "/reviews", icon: <FiStar size={20} />, label: "Reviews", category: "marketing" },
    { path: "/promotions", icon: <FiGift size={20} />, label: "Promotions", category: "marketing" },
    { path: "/gift-cards", icon: <FiCreditCard size={20} />, label: "Gift Cards", category: "marketing" },
    { path: "/revenue", icon: <FiDollarSign size={20} />, label: "Revenue", category: "reports" },
    { path: "/analytics", icon: <FiPieChart size={20} />, label: "Analytics", category: "reports" },
    { path: "/settings", icon: <FiSettings size={20} />, label: "Settings", category: "main" },
  ];

  const categories = [
    { id: "main", label: "Main" },
    { id: "manage", label: "Management" },
    { id: "service", label: "Service" },
    { id: "marketing", label: "Marketing" },
    { id: "reports", label: "Reports" },
  ];

  const quickActions = [
    { path: "/orders", icon: <FiShoppingCart size={18} />, label: "New Order" },
    { path: "/menu", icon: <FiPlus size={18} />, label: "Add Menu Item" },
    { path: "/reservations", icon: <FiCalendar size={18} />, label: "Reservation" },
  ];

  const notifications = [
    { id: 1, title: "New Order #1234", message: "Table 5 - $45.00", time: "2 min ago", icon: <FiShoppingCart size={16} />, color: "bg-green-100 text-green-600" },
    { id: 2, title: "Reservation", message: "Ahmed - 7:00 PM today", time: "15 min ago", icon: <FiCalendar size={16} />, color: "bg-blue-100 text-blue-600" },
    { id: 3, title: "Low Stock Alert", message: "Burger buns running low", time: "1 hour ago", icon: <FiPackage size={16} />, color: "bg-red-100 text-red-600" },
    { id: 4, title: "New Review", message: "5 stars from Mohamed", time: "2 hours ago", icon: <FiStar size={16} />, color: "bg-yellow-100 text-yellow-600" },
  ];

  const getItemsByCategory = (categoryId) => navItems.filter(item => item.category === categoryId);

  const isActive = (path) =>
    location.pathname === path ||
    location.pathname.startsWith(`${path}/`);

  const getPageTitle = () => {
    const item = navItems.find(i => isActive(i.path));
    return item ? item.label : "Dashboard";
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <aside className={`
        fixed lg:relative z-50 lg:z-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${collapsed ? 'lg:w-20' : 'w-64'} 
        bg-white shadow-lg border-r border-gray-200 
        transition-all duration-300 flex flex-col
        h-full
      `}>
        {/* Toggle Button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          {!collapsed && (
            <h2 className="text-xl font-bold text-orange-600 flex items-center">
              <span className="bg-orange-50 p-2 rounded-lg">
                <FiShoppingBag size={20} className="text-orange-600" />
              </span>
              <span className="ml-3">Ogaden</span>
            </h2>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
          >
            <FiMenu size={20} />
          </button>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto py-4">
          {categories.map(cat => (
            <div key={cat.id} className="mb-2">
              {!collapsed && (
                <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {cat.label}
                </div>
              )}
              {getItemsByCategory(cat.id).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 mx-2 rounded-lg transition-colors ${
                    isActive(item.path) 
                      ? "bg-orange-50 text-orange-600 font-medium" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  title={collapsed ? item.label : ''}
                >
                  <span className={isActive(item.path) ? "text-orange-500" : "text-gray-400"}>
                    {item.icon}
                  </span>
                  {!collapsed && <span className="ml-3 text-sm">{item.label}</span>}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? "Logout" : ''}
          >
            <FiLogOut size={20} />
            {!collapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-50 shadow-sm h-16 flex items-center justify-between px-4 lg:px-6 border-b border-gray-200">
          {/* Left - Menu Toggle & Page Title */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              <FiMenu size={20} />
            </button>
            <h1 className="text-lg lg:text-xl font-bold text-gray-800">{getPageTitle()}</h1>
          </div>
          
          {/* Right - Quick Actions, Search, Notifications, User */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Quick Actions - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-2">
              {quickActions.map((action) => (
                <Link
                  key={action.path}
                  to={action.path}
                  className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  {action.icon}
                  <span className="ml-2 hidden lg:inline">{action.label}</span>
                </Link>
              ))}
            </div>

            {/* Search - Hidden on small screens */}
            <div className="relative hidden lg:block">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 w-56"
              />
            </div>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg relative"
              >
                <FiBell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50">
                  <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                    <span className="font-semibold text-gray-800">Notifications</span>
                    <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600">
                      <FiX size={18} />
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 cursor-pointer">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${notif.color}`}>
                            {notif.icon}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">{notif.title}</p>
                            <p className="text-xs text-gray-500">{notif.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="relative">
              <button 
                onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
                className="flex items-center space-x-2 p-1.5 hover:bg-gray-100 rounded-lg"
              >
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {currentUser?.email?.charAt(0).toUpperCase() || 'A'}
                </div>
                <FiChevronDown size={16} className="text-gray-400 hidden lg:block" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800">Admin</p>
                    <p className="text-xs text-gray-500 truncate">{currentUser?.email || 'admin@ogaden.com'}</p>
                  </div>
                  <div className="py-2">
                    <Link to="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <FiSettings size={16} className="mr-3 text-gray-400" />
                      Settings
                    </Link>
                    <Link to="/analytics" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <FiBarChart2 size={16} className="mr-3 text-gray-400" />
                      Analytics
                    </Link>
                  </div>
                  <div className="py-2 border-t border-gray-100">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <FiLogOut size={16} className="mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
