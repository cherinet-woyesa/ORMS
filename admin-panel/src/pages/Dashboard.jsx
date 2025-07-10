import { useAuth } from "../context/AuthContext";
import { useEffect, useState, useCallback } from "react";
import { db } from "../firebase";
import { ALLOWED_ADMINS } from "../constants/admins";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { FiAlertCircle, FiCheckCircle, FiClock, FiDollarSign, FiShoppingBag } from "react-icons/fi";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pending: 0,
    completed: 0,
    revenue: 0
  });
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (currentUser === null) {
      navigate("/", { state: { error: "Please log in first" } });
    }
  }, [currentUser, navigate]);

  // Check admin status
  useEffect(() => {
    if (currentUser && !ALLOWED_ADMINS.includes(currentUser.email)) {
      navigate("/", { state: { error: "Access denied: not an admin" } });
    }
  }, [currentUser, navigate]);

  // Fetch orders and calculate stats
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
      
      // Calculate statistics
      const newStats = {
        totalOrders: ordersData.length,
        pending: ordersData.filter(o => o.status === "pending").length,
        completed: ordersData.filter(o => o.status === "completed").length,
        revenue: ordersData.reduce((sum, order) => sum + (order.total || 0), 0)
      };
      setStats(newStats);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const updateStatus = useCallback(async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Failed to update order status:", error);
      alert("Something went wrong. Try again.");
    }
  }, []);

  const getStatusBadge = useCallback((status) => {
    const base = "px-3 py-1 rounded-full text-xs font-medium flex items-center";
    switch (status) {
      case "pending":
        return `${base} bg-yellow-50 text-yellow-700 border border-yellow-200`;
      case "accepted":
        return `${base} bg-blue-50 text-blue-700 border border-blue-200`;
      case "completed":
        return `${base} bg-green-50 text-green-700 border border-green-200`;
      case "cancelled":
        return `${base} bg-red-50 text-red-700 border border-red-200`;
      default:
        return `${base} bg-gray-50 text-gray-700 border border-gray-200`;
    }
  }, []);

  const StatusIcon = ({ status }) => {
    switch (status) {
      case "pending": return <FiClock className="mr-1" />;
      case "accepted": return <FiCheckCircle className="mr-1" />;
      case "completed": return <FiCheckCircle className="mr-1" />;
      case "cancelled": return <FiAlertCircle className="mr-1" />;
      default: return <FiShoppingBag className="mr-1" />;
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="mt-2 text-sm text-gray-600">Manage and track all orders</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard 
              title="Total Orders" 
              value={stats.totalOrders} 
              icon={<FiShoppingBag className="h-6 w-6 text-blue-500" />}
              color="blue"
            />
            <StatCard 
              title="Pending" 
              value={stats.pending} 
              icon={<FiClock className="h-6 w-6 text-yellow-500" />}
              color="yellow"
            />
            <StatCard 
              title="Completed" 
              value={stats.completed} 
              icon={<FiCheckCircle className="h-6 w-6 text-green-500" />}
              color="green"
            />
            <StatCard 
              title="Total Revenue" 
              value={`$${stats.revenue.toFixed(2)}`} 
              icon={<FiDollarSign className="h-6 w-6 text-purple-500" />}
              color="purple"
            />
          </div>

          {/* Orders Section */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
              <div className="flex space-x-3">
                <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-sm hover:bg-gray-200">
                  Filter
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-10 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-3 text-gray-600">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="p-10 text-center">
                <FiShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No orders</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by accepting new orders.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <div key={order.id} className="px-6 py-5 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className={getStatusBadge(order.status)}>
                            <StatusIcon status={order.status} />
                            {order.status}
                          </span>
                          <span className="ml-3 text-sm font-medium text-gray-900">
                            Order #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              <span className="font-medium">${order.total?.toFixed(2)}</span>
                              <span className="hidden sm:block sm:mx-1">·</span>
                              <span>{order.items?.length} items</span>
                            </p>
                          </div>
                          <div className="mt-2 sm:mt-0">
                            <p className="text-sm text-gray-500">
                              {new Date(order.timestamp?.toDate()).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-0 sm:ml-4">
                        <div className="flex space-x-3">
                          {order.status === "pending" && (
                            <button
                              onClick={() => updateStatus(order.id, "accepted")}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                            >
                              Accept Order
                            </button>
                          )}
                          {order.status === "accepted" && (
                            <button
                              onClick={() => updateStatus(order.id, "completed")}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                            >
                              Mark Completed
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/orders/${order.id}`)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                    {order.items && (
                      <div className="mt-3">
                        <div className="text-sm text-gray-500">Items:</div>
                        <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center text-sm">
                              <span className="font-medium text-gray-700">{item.name}</span>
                              <span className="mx-2 text-gray-400">×</span>
                              <span className="text-gray-500">{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-800",
    yellow: "bg-yellow-100 text-yellow-800",
    green: "bg-green-100 text-green-800",
    purple: "bg-purple-100 text-purple-800",
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 h-12 w-12 rounded-full ${colorClasses[color]} flex items-center justify-center`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}