import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { signOut } from "firebase/auth";
import {
  FiTruck,
  FiMapPin,
  FiPhone,
  FiClock,
  FiCheckCircle,
  FiNavigation,
  FiPower,
  FiPackage,
  FiDollarSign,
} from "react-icons/fi";

const DriverApp = () => {
  const [user, setUser] = useState(null);
  const [activeOrders, setActiveOrders] = useState([]);
  const [completedToday, setCompletedToday] = useState([]);
  const [online, setOnline] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        window.location.href = "/driver-login";
        return;
      }
      
      const userDoc = await getDoc(doc(db, "staff", user.uid));
      if (!userDoc.exists() || userDoc.data().role !== "driver") {
        signOut(auth);
        window.location.href = "/driver-login";
        return;
      }
      
      setUser({ uid: user.uid, ...userDoc.data() });
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "orders"),
      where("driverId", "==", user.uid),
      where("status", "in", ["ready", "outForDelivery"]),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setActiveOrders(orders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "orders"),
      where("driverId", "==", user.uid),
      where("status", "==", "delivered"),
      orderBy("timestamp", "desc")
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((o) => o.deliveredAt && o.deliveredAt.toDate() >= today);
      setCompletedToday(orders);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!online || !user) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: new Date(),
        };
        setCurrentLocation(loc);
        
        updateDoc(doc(db, "driverLocations", user.uid), {
          ...loc,
          online: true,
        });
      },
      (error) => console.error("Location error:", error),
      { enableHighAccuracy: true, timeout: 5000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      updateDoc(doc(db, "driverLocations", user.uid), { online: false });
    };
  }, [online, user]);

  const acceptOrder = async (orderId) => {
    await updateDoc(doc(db, "orders", orderId), {
      status: "outForDelivery",
      pickedUpAt: new Date(),
    });
  };

  const markDelivered = async (orderId) => {
    await updateDoc(doc(db, "orders", orderId), {
      status: "delivered",
      deliveredAt: new Date(),
    });
  };

  const callCustomer = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const toggleOnline = () => {
    setOnline(!online);
    if (user) {
      updateDoc(doc(db, "driverLocations", user.uid), { online: !online });
    }
  };

  const todayEarnings = completedToday.reduce((sum, o) => sum + (o.deliveryFee || 50), 0);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-orange-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <FiTruck size={20} />
            </div>
            <div>
              <p className="font-bold">{user.name}</p>
              <p className="text-xs text-orange-100">{user.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleOnline}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                online ? "bg-green-500" : "bg-gray-400"
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${online ? "bg-white animate-pulse" : "bg-gray-300"}`}></div>
              {online ? "Online" : "Offline"}
            </button>
            <button
              onClick={() => signOut(auth)}
              className="p-2 bg-white/10 rounded-lg"
            >
              <FiPower size={18} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{activeOrders.length}</p>
            <p className="text-xs text-orange-100">Active</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{completedToday.length}</p>
            <p className="text-xs text-orange-100">Today</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">ETB {todayEarnings}</p>
            <p className="text-xs text-orange-100">Earnings</p>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="p-4 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Delivery Requests</h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          </div>
        ) : activeOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No delivery requests</p>
            <p className="text-sm text-gray-400">Check back soon!</p>
          </div>
        ) : (
          activeOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-gray-900">Order #{order.id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-gray-500">{order.timestamp?.toDate?.()?.toLocaleTimeString()}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === "outForDelivery" 
                      ? "bg-blue-100 text-blue-700" 
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {order.status === "outForDelivery" ? "In Progress" : "Ready for Pickup"}
                  </span>
                </div>

                {/* Delivery Address */}
                {order.deliveryAddress && (
                  <div className="flex items-start gap-2 text-sm text-gray-600 mb-3 bg-gray-50 p-2 rounded-lg">
                    <FiMapPin className="mt-0.5 flex-shrink-0" />
                    <span>{order.deliveryAddress}</span>
                  </div>
                )}

                {/* Customer Info */}
                {order.customerName && (
                  <div className="flex items-center gap-2 text-sm mb-3">
                    <FiClock className="text-gray-400" />
                    <span>{order.customerName}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xl text-orange-600">ETB {order.total?.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{order.items?.length || 0} items</p>
                  </div>
                  <div className="flex gap-2">
                    {order.customerPhone && (
                      <button
                        onClick={() => callCustomer(order.customerPhone)}
                        className="p-2 bg-green-100 text-green-600 rounded-lg"
                      >
                        <FiPhone size={18} />
                      </button>
                    )}
                    {order.status === "ready" ? (
                      <button
                        onClick={() => acceptOrder(order.id)}
                        className="flex items-center gap-1 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium"
                      >
                        <FiTruck size={16} />
                        Accept
                      </button>
                    ) : (
                      <button
                        onClick={() => markDelivered(order.id)}
                        className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium"
                      >
                        <FiCheckCircle size={16} />
                        Delivered
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Earnings Section */}
      <div className="p-4">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Today's Summary</h2>
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Total Earnings</p>
              <p className="text-3xl font-bold">ETB {todayEarnings.toLocaleString()}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <FiDollarSign size={24} />
            </div>
          </div>
          <div className="mt-3 flex justify-between text-sm">
            <span className="text-orange-100">{completedToday.length} deliveries</span>
            <span className="text-orange-100">ETB {completedToday.length > 0 ? (todayEarnings / completedToday.length).toFixed(0) : 0} avg</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverApp;
