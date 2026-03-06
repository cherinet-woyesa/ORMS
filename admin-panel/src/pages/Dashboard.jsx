import { useAuth } from "../context/AuthContext";
import { useEffect, useState, useCallback } from "react";
import { db } from "../firebase";
import { Link } from "react-router-dom";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiShoppingBag,
  FiTrendingUp,
  FiUsers,
  FiPackage,
  FiArrowUp,
  FiArrowDown,
  FiActivity
} from "react-icons/fi";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pending: 0,
    completed: 0,
    revenue: 0,
    todayOrders: 0,
    avgOrderValue: 0
  });

  // Show login message if not authenticated
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Please log in</h2>
          <p className="text-gray-600 mt-2">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Fetch orders and calculate stats
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);

      // Calculate statistics
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayOrders = ordersData.filter(o => {
        const orderDate = o.timestamp?.toDate();
        return orderDate && orderDate >= today;
      });

      const totalRevenue = ordersData.reduce((sum, order) => sum + (order.total || 0), 0);

      const newStats = {
        totalOrders: ordersData.length,
        pending: ordersData.filter(o => o.status === "pending").length,
        completed: ordersData.filter(o => o.status === "completed").length,
        revenue: totalRevenue,
        todayOrders: todayOrders.length,
        avgOrderValue: ordersData.length > 0 ? totalRevenue / ordersData.length : 0
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
    const base = "px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition-all";
    switch (status) {
      case "pending":
        return `${base} bg-amber-100 text-amber-700 border border-amber-200`;
      case "accepted":
        return `${base} bg-primary-100 text-primary-700 border border-primary-200`;
      case "preparing":
        return `${base} bg-purple-100 text-purple-700 border border-purple-200`;
      case "completed":
        return `${base} bg-green-100 text-green-700 border border-green-200`;
      case "cancelled":
        return `${base} bg-red-100 text-red-700 border border-red-200`;
      default:
        return `${base} bg-gray-100 text-gray-700 border border-gray-200`;
    }
  }, []);

  const StatusIcon = ({ status }) => {
    switch (status) {
      case "pending": return <FiClock className="w-3.5 h-3.5" />;
      case "accepted": return <FiCheckCircle className="w-3.5 h-3.5" />;
      case "preparing": return <FiActivity className="w-3.5 h-3.5" />;
      case "completed": return <FiCheckCircle className="w-3.5 h-3.5" />;
      case "cancelled": return <FiAlertCircle className="w-3.5 h-3.5" />;
      default: return <FiShoppingBag className="w-3.5 h-3.5" />;
    }
  };

  const recentOrders = orders.slice(0, 8);

  return (
    <div className="page-container space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <div className="mt-3 sm:mt-0">
          <Link
            to="/orders"
            className="inline-flex items-center px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FiShoppingBag className="mr-1.5 w-4 h-4" />
            View All Orders
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Total Revenue"
          value={`ETB ${stats.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<FiDollarSign className="w-6 h-6" />}
          gradient="from-primary-500 to-orange-400"
          trend="+12.5%"
          trendUp={true}
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={<FiShoppingBag className="w-6 h-6" />}
          gradient="from-purple-500 to-purple-600"
          trend="+8.2%"
          trendUp={true}
        />
        <StatCard
          title="Pending Orders"
          value={stats.pending}
          icon={<FiClock className="w-6 h-6" />}
          gradient="from-amber-500 to-amber-600"
          badge={stats.pending > 0 ? "Needs Attention" : null}
        />
        <StatCard
          title="Avg Order Value"
          value={`ETB ${stats.avgOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<FiTrendingUp className="w-6 h-6" />}
          gradient="from-green-500 to-green-600"
          trend="+5.4%"
          trendUp={true}
        />
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickStatCard
          icon={<FiCheckCircle className="w-5 h-5 text-green-600" />}
          label="Completed Today"
          value={stats.todayOrders}
          bgColor="bg-green-50"
        />
        <QuickStatCard
          icon={<FiUsers className="w-5 h-5 text-primary-600" />}
          label="Active Customers"
          value="248"
          bgColor="bg-primary-50"
        />
        <QuickStatCard
          icon={<FiPackage className="w-5 h-5 text-purple-600" />}
          label="Menu Items"
          value="156"
          bgColor="bg-purple-50"
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Recent Orders</h2>
              <p className="text-xs text-gray-500 mt-0.5">Latest customer orders</p>
            </div>
            <Link
              to="/orders"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              View All →
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-50 mb-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            </div>
            <p className="text-gray-600 text-sm font-medium">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
              <FiShoppingBag className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-1">No orders yet</h3>
            <p className="text-sm text-gray-500">Orders will appear here once customers start placing them.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-orange-400 flex items-center justify-center">
                          <FiShoppingBag className="w-5 h-5 text-white" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(order.status)}>
                        <StatusIcon status={order.status} />
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {order.items?.length || 0} items
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        ETB {order.total?.toFixed(2) || '0.00'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.timestamp?.toDate().toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {order.status === "pending" && (
                          <button
                            onClick={() => updateStatus(order.id, "accepted")}
                            className="inline-flex items-center px-3 py-1.5 bg-primary-600 text-white text-xs font-medium rounded-lg hover:bg-primary-700 transition-colors"
                          >
                            Accept
                          </button>
                        )}
                        {order.status === "accepted" && (
                          <button
                            onClick={() => updateStatus(order.id, "preparing")}
                            className="inline-flex items-center px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            Prepare
                          </button>
                        )}
                        {order.status === "preparing" && (
                          <button
                            onClick={() => updateStatus(order.id, "completed")}
                            className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Complete
                          </button>
                        )}
                        <Link
                          to={`/orders`}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, gradient, trend, trendUp, badge }) {
  return (
    <div className="relative bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2.5 rounded-lg bg-gradient-to-br ${gradient} shadow-md`}>
            <div className="text-white">
              {icon}
            </div>
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-semibold ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
              {trendUp ? <FiArrowUp className="w-3 h-3" /> : <FiArrowDown className="w-3 h-3" />}
              {trend}
            </div>
          )}
          {badge && (
            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
              {badge}
            </span>
          )}
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 mb-0.5">{title}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
      <div className={`h-1 bg-gradient-to-r ${gradient}`}></div>
    </div>
  );
}

function QuickStatCard({ icon, label, value, bgColor }) {
  return (
    <div className={`${bgColor} rounded-xl p-4 border border-gray-100`}>
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
