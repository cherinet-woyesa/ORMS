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
import { FiTruck, FiMapPin, FiPhone, FiClock, FiUser, FiPackage, FiCheckCircle, FiNavigation, FiMap, FiX } from "react-icons/fi";
import { subscribeToDriverLocation, getDeliveryEta } from "../services/driverService";

const DeliveryPage = () => {
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [filter, setFilter] = useState("all");
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [eta, setEta] = useState(null);

  useEffect(() => {
    const unsubOrders = onSnapshot(
      query(
        collection(db, "orders"),
        where("orderType", "==", "delivery"),
        orderBy("timestamp", "desc")
      ),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(data);
      }
    );

    const unsubDrivers = onSnapshot(
      query(collection(db, "staff"), where("role", "==", "driver")),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDrivers(data);
      }
    );

    return () => {
      unsubOrders();
      unsubDrivers();
    };
  }, []);

  const assignDriver = async () => {
    if (!selectedOrder || !selectedDriver) return;

    const driver = drivers.find((d) => d.id === selectedDriver);
    await updateDoc(doc(db, "orders", selectedOrder), {
      status: "outForDelivery",
      driverId: selectedDriver,
      driverName: driver?.name,
      driverPhone: driver?.phone,
      assignedAt: new Date(),
    });

    setSelectedOrder(null);
    setSelectedDriver("");
  };

  const updateStatus = async (orderId, newStatus) => {
    await updateDoc(doc(db, "orders", orderId), { status: newStatus });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "accepted": return "bg-primary-100 text-primary-800 border-primary-200";
      case "preparing": return "bg-orange-100 text-orange-800 border-orange-200";
      case "ready": return "bg-purple-100 text-purple-800 border-purple-200";
      case "outForDelivery": return "bg-green-100 text-green-800 border-green-200";
      case "delivered": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return "⏳";
      case "accepted": return "✓";
      case "preparing": return "👨‍🍳";
      case "ready": return "📦";
      case "outForDelivery": return "🚗";
      case "delivered": return "✅";
      default: return "📋";
    }
  };

  const filteredOrders = orders.filter(o => {
    if (filter === "all") return true;
    return o.status === filter;
  });

  const inProgressOrders = orders.filter(o => ["accepted", "preparing", "ready", "outForDelivery"].includes(o.status));
  const completedToday = orders.filter(o => o.status === "delivered");

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Delivery Management</h1>
          <p className="text-sm text-gray-600">Track and manage delivery orders in real-time</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">In Progress</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{inProgressOrders.length}</p>
            </div>
            <div className="bg-primary-100 p-2 rounded-lg">
              <FiTruck className="w-4 h-4 text-primary-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Delivered Today</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{completedToday.length}</p>
            </div>
            <div className="bg-green-100 p-2 rounded-lg">
              <FiCheckCircle className="w-4 h-4 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Ready for Pickup</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{orders.filter(o => o.status === "ready").length}</p>
            </div>
            <div className="bg-orange-100 p-2 rounded-lg">
              <FiPackage className="w-4 h-4 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Active Drivers</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{drivers.filter(d => d.active !== false).length}</p>
            </div>
            <div className="bg-primary-100 p-2 rounded-lg">
              <FiNavigation className="w-4 h-4 text-primary-600" />
            </div>
          </div>
        </div>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Orders List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-4">
              <div className="flex flex-wrap gap-2">
                {["all", "pending", "accepted", "preparing", "ready", "outForDelivery", "delivered"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${filter === status
                        ? "bg-primary-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    {status === "all" ? "All Orders" : status.charAt(0).toUpperCase() + status.slice(1).replace(/([A-Z])/g, ' $1')}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-lg p-8 text-center shadow-sm border border-gray-200">
                  <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FiTruck className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">No delivery orders</h3>
                  <p className="text-sm text-gray-500">Delivery orders will appear here when customers place orders</p>
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-gray-800">#{order.id.slice(-8).toUpperCase()}</span>
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)} {order.status.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-gray-900">
                          ETB {order.total?.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">{order.items?.length || 0} items</div>
                      </div>
                    </div>

                    {order.deliveryAddress && (
                      <div className="flex items-start gap-2 text-xs text-gray-600 mb-2 bg-gray-50 p-2 rounded">
                        <FiMapPin className="mt-0.5 flex-shrink-0" />
                        <span>{order.deliveryAddress}</span>
                      </div>
                    )}

                    {order.driverName && (
                      <div className="flex items-center gap-2 text-xs bg-green-50 p-2 rounded mb-2">
                        <FiTruck className="text-green-600" />
                        <span className="text-green-800">
                          {order.driverName} • {order.driverPhone}
                        </span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {!order.driverId && ["accepted", "preparing", "ready"].includes(order.status) && (
                        <button
                          onClick={() => setSelectedOrder(order.id)}
                          className="flex items-center px-3 py-1.5 bg-primary-600 text-white rounded text-xs hover:bg-primary-700"
                        >
                          <FiUser className="mr-1" /> Assign Driver
                        </button>
                      )}
                      {order.status === "outForDelivery" && (
                        <>
                          <button
                            onClick={() => { setTrackingOrder(order); }}
                            className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                          >
                            <FiNavigation className="mr-1" /> Track
                          </button>
                          <button
                            onClick={() => updateStatus(order.id, "delivered")}
                            className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                          >
                            <FiCheckCircle className="mr-1" /> Mark Delivered
                          </button>
                        </>
                      )}
                      {["pending", "accepted"].includes(order.status) && (
                        <button
                          onClick={() => updateStatus(order.id, order.status === "pending" ? "accepted" : "preparing")}
                          className="flex items-center px-3 py-1.5 bg-primary-600 text-white rounded text-xs hover:bg-primary-700"
                        >
                          {order.status === "pending" ? "Accept" : "Start Preparing"}
                        </button>
                      )}
                      {order.status === "preparing" && (
                        <button
                          onClick={() => updateStatus(order.id, "ready")}
                          className="flex items-center px-3 py-1.5 bg-orange-600 text-white rounded text-xs hover:bg-orange-700"
                        >
                          Mark Ready
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Drivers Panel */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-bold mb-4 flex items-center text-gray-800">
                <div className="bg-primary-100 p-1.5 rounded mr-2">
                  <FiTruck className="text-primary-600" size={14} />
                </div>
                Available Drivers
              </h3>
              <div className="space-y-2">
                {drivers.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <FiUser className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-xs">No drivers available</p>
                  </div>
                ) : (
                  drivers.map((driver) => (
                    <div
                      key={driver.id}
                      className={`p-3 rounded-lg border transition-all duration-200 ${driver.active !== false
                          ? "bg-green-50 border-green-200"
                          : "bg-gray-50 border-gray-200"
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${driver.active !== false
                            ? "bg-primary-600"
                            : "bg-gray-400"
                          }`}>
                          {driver.name?.charAt(0) || "D"}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-800">{driver.name}</p>
                          <p className="text-xs text-gray-600">{driver.phone || "No phone"}</p>
                        </div>
                        {driver.active !== false && (
                          <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            Active
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        {/* Driver Tracking Panel */}
        {trackingOrder && (
          <div className="fixed bottom-0 left-0 right-0 bg-white shadow-xl rounded-t-xl z-50 animate-slide-up max-h-[60vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <FiTruck className="text-primary-600" />
                  Live Tracking
                </h3>
                <button 
                  onClick={() => { setTrackingOrder(null); setDriverLocation(null); }}
                  className="p-1.5 hover:bg-gray-100 rounded"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
              
              {/* Map Placeholder */}
              <div className="bg-gray-100 rounded-lg h-36 mb-3 flex items-center justify-center relative overflow-hidden">
                <div className="text-center">
                  <FiMap className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                  <p className="text-gray-500 text-xs">Map View - Driver location tracking</p>
                </div>
                {driverLocation && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-primary-600 text-white p-1.5 rounded-full shadow">
                      <FiTruck className="w-4 h-4" />
                    </div>
                  </div>
                )}
              </div>

              {/* Delivery Info */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-green-600 text-xs font-semibold mb-1">Driver</p>
                  <p className="font-medium text-sm text-gray-800">{trackingOrder.driverName || 'Assigned Driver'}</p>
                  {trackingOrder.driverPhone && (
                    <a href={`tel:${trackingOrder.driverPhone}`} className="text-primary-600 text-xs flex items-center gap-1 mt-1">
                      <FiPhone size={10} /> {trackingOrder.driverPhone}
                    </a>
                  )}
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-blue-600 text-xs font-semibold mb-1">ETA</p>
                  <p className="font-medium text-sm text-gray-800">{eta ? `${eta.etaMinutes} min` : 'Calculating...'}</p>
                  {eta && <p className="text-blue-500 text-xs">{eta.distance} km away</p>}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500 text-xs mb-1">Order #{trackingOrder.id?.slice(0, 8).toUpperCase()}</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 text-xs font-medium">Out for Delivery</span>
                </div>
                {trackingOrder.deliveryAddress && (
                  <p className="text-gray-500 text-xs mt-1.5 flex items-center gap-1">
                    <FiMapPin size={10} /> {trackingOrder.deliveryAddress}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Assign Driver Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5">
              <h3 className="text-lg font-bold mb-4 text-gray-800">Assign Driver</h3>
              <select
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 mb-4 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select a driver</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name} - {driver.phone}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={assignDriver}
                  disabled={!selectedDriver}
                  className="flex-1 bg-primary-600 text-white py-2.5 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-all"
                >
                  Assign Driver
                </button>
                <button
                  onClick={() => { setSelectedOrder(null); setSelectedDriver(""); }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2.5 rounded-lg hover:bg-gray-300 font-medium text-sm transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryPage;
