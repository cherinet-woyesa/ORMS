import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase";

const ScheduledOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("upcoming");
  const now = new Date();

  useEffect(() => {
    const q = query(collection(db, "orders"), where("scheduledFor", "!=", null), orderBy("scheduledFor", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const upcomingOrders = orders.filter(o => o.scheduledFor?.toDate?.() > now);
  const pastOrders = orders.filter(o => o.scheduledFor?.toDate?.() <= now);
  const displayedOrders = filter === "upcoming" ? upcomingOrders : pastOrders;

  const getTimeUntil = (scheduledFor) => {
    if (!scheduledFor) return "--";
    const diff = scheduledFor.toDate?.() - now;
    if (diff < 0) return "Past";
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hr`;
  };

  const getUrgencyClass = (scheduledFor) => {
    if (!scheduledFor?.toDate?.() || scheduledFor.toDate() <= now) return "border-gray-300 bg-gray-50";
    const diff = scheduledFor.toDate() - now;
    const minutes = diff / 60000;
    if (minutes < 30) return "border-red-500 bg-red-50";
    if (minutes < 60) return "border-yellow-500 bg-yellow-50";
    return "border-green-500 bg-white";
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Scheduled Orders</h1>
          <p className="text-sm text-gray-600">Manage pre-scheduled customer orders</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <p className="text-xs text-gray-500 font-medium">Total Scheduled</p>
          <p className="text-lg font-bold text-gray-900 mt-1">{orders.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <p className="text-xs text-gray-500 font-medium">Upcoming</p>
          <p className="text-lg font-bold text-gray-900 mt-1">{upcomingOrders.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <p className="text-xs text-gray-500 font-medium">Past Orders</p>
          <p className="text-lg font-bold text-gray-900 mt-1">{pastOrders.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <p className="text-xs text-gray-500 font-medium">Total Value</p>
          <p className="text-lg font-bold text-gray-900 mt-1">ETB {orders.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("upcoming")}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
              filter === "upcoming" ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Upcoming ({upcomingOrders.length})
          </button>
          <button
            onClick={() => setFilter("past")}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
              filter === "past" ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Past ({pastOrders.length})
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {displayedOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No {filter} scheduled orders</h3>
            <p className="text-gray-500">Scheduled orders will appear here</p>
          </div>
        ) : (
          displayedOrders.map((order) => (
            <div key={order.id} className={`bg-white rounded-xl shadow-sm border-l-4 p-4 ${getUrgencyClass(order.scheduledFor)}`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono font-bold text-lg">#{order.id.slice(-6).toUpperCase()}</span>
                  <span className="ml-2 text-sm text-gray-500">{order.restaurantName || "Restaurant"}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xl text-primary-600">ETB {order.total?.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">{order.items?.length || 0} items</div>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <span className="font-medium">Scheduled for:</span> {order.scheduledFor?.toDate?.().toLocaleString()}
              </div>
              <div className="mt-1 text-sm">
                <span className="font-medium">Status:</span> {getTimeUntil(order.scheduledFor)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ScheduledOrdersPage;
