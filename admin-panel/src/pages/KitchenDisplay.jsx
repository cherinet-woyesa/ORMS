import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiActivity,
  FiPackage,
  FiTruck,
  FiVolume2,
  FiVolumeX
} from "react-icons/fi";

const KitchenDisplay = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      where("status", "in", ["pending", "accepted", "preparing", "ready"]),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(data);
    });

    return () => unsubscribe();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    await updateDoc(doc(db, "orders", orderId), {
      status: newStatus,
      updatedAt: new Date()
    });
  };

  const getTimeSinceOrder = (timestamp) => {
    if (!timestamp) return "--";
    const orderTime = timestamp.toDate();
    const diff = Math.floor((currentTime - orderTime) / 1000 / 60);
    if (diff < 1) return "Just now";
    if (diff === 1) return "1 min";
    if (diff < 60) return `${diff} min`;
    const hours = Math.floor(diff / 60);
    if (hours === 1) return "1 hr";
    return `${hours} hrs`;
  };

  const getUrgencyLevel = (timestamp) => {
    if (!timestamp) return "normal";
    const orderTime = timestamp.toDate();
    const diff = Math.floor((currentTime - orderTime) / 1000 / 60);
    if (diff > 15) return "critical";
    if (diff > 10) return "warning";
    return "normal";
  };

  const getUrgencyClass = (timestamp) => {
    const level = getUrgencyLevel(timestamp);
    if (level === "critical") return "bg-red-50 border-l-4 border-red-500";
    if (level === "warning") return "bg-yellow-50 border-l-4 border-yellow-500";
    return "bg-white border-l-4 border-green-500";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "accepted": return "bg-blue-100 text-blue-800 border-blue-200";
      case "preparing": return "bg-orange-100 text-orange-800 border-orange-200";
      case "ready": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return "⏳";
      case "accepted": return "✓";
      case "preparing": return "👨‍🍳";
      case "ready": return "📦";
      default: return "📋";
    }
  };

  const filteredOrders = filter === "all" ? orders : orders.filter(o => o.status === filter);

  const pendingOrders = orders.filter(o => o.status === "pending").length;
  const preparingOrders = orders.filter(o => o.status === "preparing").length;
  const readyOrders = orders.filter(o => o.status === "ready").length;

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            Kitchen Display
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {currentTime.toLocaleTimeString()} • {orders.length} Active Orders
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
              soundEnabled 
                ? "bg-green-100 text-green-700" 
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {soundEnabled ? <FiVolume2 size={16} /> : <FiVolumeX size={16} />}
            {soundEnabled ? "Sound On" : "Sound Off"}
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
            <div className="text-xs text-red-600">Critical</div>
            <div className="text-lg font-bold text-red-700">
              {orders.filter(o => getUrgencyLevel(o.timestamp) === "critical").length}
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
            <div className="text-xs text-amber-600">Warning</div>
            <div className="text-lg font-bold text-amber-700">
              {orders.filter(o => getUrgencyLevel(o.timestamp) === "warning").length}
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
            <div className="text-xs text-green-600">Normal</div>
            <div className="text-lg font-bold text-green-700">
              {orders.filter(o => getUrgencyLevel(o.timestamp) === "normal").length}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {["all", "pending", "accepted", "preparing", "ready"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === status
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)} ({status === "all" ? orders.length : orders.filter(o => o.status === status).length})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl p-12 text-center">
            <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders in kitchen</h3>
            <p className="text-gray-500">New orders will appear here automatically</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className={`rounded-xl shadow-sm border overflow-hidden ${getUrgencyClass(order.timestamp)}`}
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="font-mono font-bold text-lg">#{order.id.slice(-6).toUpperCase()}</span>
                    <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                      <FiClock size={14} />
                      {getTimeSinceOrder(order.timestamp)}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)} {order.status}
                  </span>
                </div>

                <div className="space-y-1 mb-4">
                  {order.items?.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="font-medium">{item.quantity}x {item.name}</span>
                      {item.notes && <span className="text-orange-600 text-xs">• {item.notes}</span>}
                    </div>
                  ))}
                  {order.items?.length > 5 && (
                    <div className="text-sm text-gray-500">+{order.items.length - 5} more items</div>
                  )}
                </div>

                {order.tableNumber && (
                  <div className="text-sm mb-3">
                    <span className="font-medium">Table {order.tableNumber}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  {order.status === "pending" && (
                    <button
                      onClick={() => updateStatus(order.id, "accepted")}
                      className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      Accept
                    </button>
                  )}
                  {order.status === "accepted" && (
                    <button
                      onClick={() => updateStatus(order.id, "preparing")}
                      className="flex-1 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700"
                    >
                      Start Preparing
                    </button>
                  )}
                  {order.status === "preparing" && (
                    <button
                      onClick={() => updateStatus(order.id, "ready")}
                      className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                    >
                      Mark Ready
                    </button>
                  )}
                  {order.status === "ready" && (
                    <button
                      onClick={() => updateStatus(order.id, order.orderType === "delivery" ? "outForDelivery" : "completed")}
                      className="flex-1 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
                    >
                      {order.orderType === "delivery" ? "Out for Delivery" : "Completed"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default KitchenDisplay;
