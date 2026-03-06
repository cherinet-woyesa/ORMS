import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
  deleteDoc,
  addDoc,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../firebase";
import { printReceipt, printKitchenTicket } from "../services/printService";
import { notifyOrderStatus } from "../services/smsService";
import {
  FiShoppingBag,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiDollarSign,
  FiTruck,
  FiSearch,
  FiTrendingUp,
  FiActivity,
  FiPackage,
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiAlertCircle,
  FiPrinter,
  FiSend
} from "react-icons/fi";

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, revenue: 0 });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const data = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const order = { id: docSnap.id, ...docSnap.data() };
          if (order.userId) {
            try {
              const userDoc = await getDoc(doc(db, "users", order.userId));
              order.userInfo = userDoc.exists() ? userDoc.data() : {};
            } catch (e) {
              order.userInfo = {};
            }
          }
          return order;
        })
      );
      setOrders(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const newStats = orders.reduce((acc, order) => {
      acc.total++;
      acc.revenue += order.total || 0;
      if (order.status === "pending") acc.pending++;
      if (order.status === "completed") acc.completed++;
      return acc;
    }, { total: 0, pending: 0, completed: 0, revenue: 0 });
    setStats(newStats);
  }, [orders]);

  const updateStatus = async (id, newStatus, order) => {
    const ref = doc(db, "orders", id);

    if (newStatus === "completed") {
      await addDoc(collection(db, "archived_orders"), {
        ...order,
        archivedAt: new Date(),
        status: "completed",
      });
      await deleteDoc(ref);
    } else {
      await updateDoc(ref, { status: newStatus, updatedAt: new Date() });
    }
    
    // Send SMS notification to customer
    try {
      await notifyOrderStatus({ ...order, id }, newStatus);
    } catch (smsError) {
      console.log("SMS notification failed:", smsError);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this order permanently?")) {
      await deleteDoc(doc(db, "orders", id));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-amber-100 text-amber-700 border-amber-200";
      case "accepted": return "bg-primary-100 text-primary-700 border-primary-200";
      case "preparing": return "bg-purple-100 text-purple-700 border-purple-200";
      case "ready": return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "delivering": return "bg-cyan-100 text-cyan-700 border-cyan-200";
      case "completed": return "bg-green-100 text-green-700 border-green-200";
      case "cancelled": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return <FiClock className="w-4 h-4" />;
      case "accepted": return <FiCheckCircle className="w-4 h-4" />;
      case "preparing": return <FiActivity className="w-4 h-4" />;
      case "ready": return <FiPackage className="w-4 h-4" />;
      case "delivering": return <FiTruck className="w-4 h-4" />;
      case "completed": return <FiCheckCircle className="w-4 h-4" />;
      case "cancelled": return <FiXCircle className="w-4 h-4" />;
      default: return <FiClock className="w-4 h-4" />;
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesFilter = filter === "all" || o.status === filter;
    const matchesSearch = !searchTerm ||
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.userInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.userInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  const getTimeSince = (timestamp) => {
    if (!timestamp) return "Unknown";
    const now = new Date();
    const orderTime = timestamp.toDate();
    const diff = Math.floor((now - orderTime) / 1000 / 60);

    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <div className="page-container space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Order Management</h1>
          <p className="mt-1 text-sm text-gray-600">Track and manage all customer orders</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Total Orders"
          value={stats.total}
          icon={<FiShoppingBag className="w-5 h-5" />}
          gradient="from-primary-500 to-orange-600"
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={<FiClock className="w-5 h-5" />}
          gradient="from-amber-500 to-amber-600"
          badge={stats.pending > 0 ? "Action Needed" : null}
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={<FiCheckCircle className="w-5 h-5" />}
          gradient="from-green-500 to-green-600"
        />
        <StatCard
          title="Revenue"
          value={`ETB ${stats.revenue.toLocaleString()}`}
          icon={<FiDollarSign className="w-5 h-5" />}
          gradient="from-primary-500 to-primary-600"
        />
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by order ID or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          <FilterPill
            label="All"
            count={stats.total}
            active={filter === "all"}
            onClick={() => setFilter("all")}
          />
          {["pending", "accepted", "preparing", "ready", "delivering", "completed", "cancelled"].map((status) => (
            <FilterPill
              key={status}
              label={status.charAt(0).toUpperCase() + status.slice(1)}
              count={statusCounts[status] || 0}
              active={filter === status}
              onClick={() => setFilter(status)}
            />
          ))}
        </div>
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <FiShoppingBag className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No orders found</h3>
          <p className="text-sm text-gray-500">Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusChange={updateStatus}
              onDelete={handleDelete}
              onViewDetails={setSelectedOrder}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
              getTimeSince={getTimeSince}
            />
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={updateStatus}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
        />
      )}
    </div>
  );
};

function StatCard({ title, value, icon, gradient, badge }) {
  return (
    <div className="relative bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2.5 rounded-lg bg-gradient-to-br ${gradient} shadow-md`}>
            <div className="text-white">{icon}</div>
          </div>
          {badge && (
            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full animate-pulse">
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

function FilterPill({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${active
          ? "bg-primary-600 text-white shadow-md"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
    >
      {label} <span className={`ml-1 ${active ? 'opacity-80' : 'opacity-60'}`}>({count})</span>
    </button>
  );
}

function OrderCard({ order, onStatusChange, onDelete, onViewDetails, getStatusColor, getStatusIcon, getTimeSince }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-orange-600 flex items-center justify-center shadow-lg">
              <FiShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</h3>
              <p className="text-xs text-gray-500">{getTimeSince(order.timestamp)}</p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
            {getStatusIcon(order.status)}
            {order.status}
          </span>
        </div>
      </div>

      {/* Customer Info */}
      {order.userInfo && (
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-orange-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">
                {order.userInfo.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{order.userInfo.name || "Unknown Customer"}</p>
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                <FiMail className="w-3 h-3" />
                <span className="truncate">{order.userInfo.email || "No email"}</span>
              </div>
              {order.userInfo.phone && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                  <FiPhone className="w-3 h-3" />
                  <span>{order.userInfo.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="p-4">
        <div className="space-y-2 mb-4">
          {order.items?.slice(0, 3).map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">
                  {item.quantity}
                </span>
                <span className="text-gray-700 font-medium">{item.name}</span>
              </div>
              <span className="text-gray-900 font-semibold">ETB {(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          {order.items?.length > 3 && (
            <p className="text-xs text-gray-500 pl-8">+{order.items.length - 3} more items</p>
          )}
        </div>

        {/* Total */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100 mb-4">
          <span className="text-sm font-medium text-gray-600">Total Amount</span>
          <span className="text-xl font-bold text-gray-900">ETB {order.total?.toLocaleString()}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <select
            value={order.status}
            onChange={(e) => onStatusChange(order.id, e.target.value, order)}
            className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-medium"
          >
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="delivering">Delivering</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={() => onViewDetails(order)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderDetailsModal({ order, onClose, onStatusChange, getStatusColor, getStatusIcon }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-orange-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">Order Details</h2>
              <p className="text-primary-100 mt-1">#{order.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Print Buttons */}
              <button
                onClick={() => printReceipt(order)}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                title="Print Receipt"
              >
                <FiPrinter className="w-5 h-5" />
              </button>
              <button
                onClick={() => printKitchenTicket(order)}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                title="Print Kitchen Ticket"
              >
                <FiPackage className="w-5 h-5" />
              </button>
              {/* Send SMS */}
              <button
                onClick={() => notifyOrderStatus(order, order.status)}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                title="Send SMS Update"
              >
                <FiSend className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <FiXCircle className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Order Status</label>
            <select
              value={order.status}
              onChange={(e) => onStatusChange(order.id, e.target.value, order)}
              className="w-full text-sm border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-medium"
            >
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="delivering">Delivering</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Customer Info */}
          {order.userInfo && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiUser className="w-4 h-4" />
                Customer Information
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium text-gray-700">Name:</span> {order.userInfo.name || "N/A"}</p>
                <p><span className="font-medium text-gray-700">Email:</span> {order.userInfo.email || "N/A"}</p>
                <p><span className="font-medium text-gray-700">Phone:</span> {order.userInfo.phone || "N/A"}</p>
              </div>
            </div>
          )}

          {/* Items */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FiPackage className="w-4 h-4" />
              Order Items
            </h3>
            <div className="space-y-2">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-sm font-bold flex items-center justify-center">
                      {item.quantity}
                    </span>
                    <span className="font-medium text-gray-900">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">ETB {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="bg-gradient-to-r from-primary-50 to-orange-50 rounded-xl p-4 border-2 border-primary-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total Amount</span>
              <span className="text-2xl font-bold text-primary-600">ETB {order.total?.toLocaleString()}</span>
            </div>
          </div>

          {/* Timestamp */}
          <div className="text-sm text-gray-500 text-center">
            Order placed: {order.timestamp?.toDate().toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderPage;
