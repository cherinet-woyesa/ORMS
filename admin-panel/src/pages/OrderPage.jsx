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
import axios from "axios"; // For FCM later (you’ll need this for push)

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const data = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const order = { id: docSnap.id, ...docSnap.data() };
          if (order.userId) {
            const userDoc = await getDoc(doc(db, "users", order.userId));
            order.userInfo = userDoc.exists() ? userDoc.data() : {};
          }
          return order;
        })
      );
      setOrders(data);
    });

    return () => unsubscribe();
  }, []);

  const updateStatus = async (id, newStatus, order) => {
    const ref = doc(db, "orders", id);

    if (newStatus === "completed") {
      // Auto-archive completed orders
      await addDoc(collection(db, "archived_orders"), {
        ...order,
        archivedAt: new Date(),
        status: "completed",
      });
      await deleteDoc(ref);
    } else {
      await updateDoc(ref, { status: newStatus });
    }

    // Optional: Send push notification
    if (order.userInfo?.fcmToken) {
      sendPushNotification(order.userInfo.fcmToken, newStatus);
    }
  };

  const sendPushNotification = async (token, newStatus) => {
    const payload = {
      to: token,
      notification: {
        title: "Order Update",
        body: `Your order status changed to ${newStatus.toUpperCase()}`,
      },
    };

    try {
      await axios.post("https://fcm.googleapis.com/fcm/send", payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "key=YOUR_FCM_SERVER_KEY", // Replace with your server key
        },
      });
    } catch (err) {
      console.error("Failed to send push:", err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this order permanently?")) {
      await deleteDoc(doc(db, "orders", id));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-600";
      case "accepted":
        return "text-blue-600";
      case "preparing":
        return "text-orange-600";
      case "delivering":
        return "text-purple-600";
      case "completed":
        return "text-green-600";
      case "cancelled":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">🧾 Incoming Orders</h2>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {["all", "pending", "accepted", "preparing", "delivering", "completed", "cancelled"].map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded border ${
                filter === status ? "bg-purple-600 text-white" : "bg-white text-gray-800"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          )
        )}
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {orders
          .filter((o) => filter === "all" || o.status === filter)
          .map((order) => (
            <div key={order.id} className="border p-4 rounded bg-white shadow-md">
              <h3 className="text-lg font-bold mb-1">Order ID: {order.id}</h3>
              <p>
                👤 <strong>User:</strong> {order.userId ?? "Unknown"}
              </p>
              {order.userInfo && (
                <div className="text-sm text-gray-600 mb-2">
                  📱 {order.userInfo.phone ?? "No phone"} <br />
                  ✉️ {order.userInfo.email ?? "No email"}
                </div>
              )}
              <p>
                💰 <strong>Total:</strong> ETB {order.total}
              </p>
              <p>
                🕒 <strong>Time:</strong>{" "}
                {order.timestamp?.toDate().toLocaleString() ?? "N/A"}
              </p>
              <p className={`mt-1 ${getStatusColor(order.status)}`}>
                🧩 <strong>Status:</strong> {order.status}
              </p>

              {/* Status Dropdown */}
              <div className="mt-2">
                <label className="text-sm block">🔁 Change Status</label>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value, order)}
                  className="border p-2 rounded w-full"
                >
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="preparing">Preparing</option>
                  <option value="delivering">Delivering</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Order Items */}
              {order.items && (
                <div className="mt-3">
                  <strong>📦 Items:</strong>
                  <ul className="list-disc ml-5 text-sm">
                    {order.items.map((item, idx) => (
                      <li key={idx}>
                        {item.name} x {item.quantity} – ETB {item.total}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Delete Option */}
              <button
                onClick={() => handleDelete(order.id)}
                className="text-red-600 hover:underline text-sm mt-4"
              >
                🗑 Delete Order
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default OrderPage;
