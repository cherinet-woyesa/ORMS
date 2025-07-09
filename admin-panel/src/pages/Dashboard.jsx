import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
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

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
    const navigate = useNavigate();
  useEffect(() => {
    if (currentUser && !ALLOWED_ADMINS.includes(currentUser.email)) {
      alert("Access denied: not an admin.");
      navigate("/");
    }
  }, [currentUser]);

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus,
      });
    } catch (error) {
      console.error("Failed to update order status:", error);
      alert("Something went wrong. Try again.");
    }
  };

  const getStatusBadge = (status) => {
    const base = "px-3 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "pending":
        return `${base} bg-yellow-100 text-yellow-800`;
      case "accepted":
        return `${base} bg-blue-100 text-blue-800`;
      case "completed":
        return `${base} bg-green-100 text-green-800`;
      default:
        return `${base} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <AdminLayout>
        <h1 className="text-3xl font-bold mb-6">Orders</h1>
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-10 text-center">
          🍽️ Ogaden Admin Dashboard
        </h1>

        {orders.length === 0 ? (
          <div className="text-center text-gray-500 text-lg">No orders yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold text-gray-700">
                    Order #{order.id.slice(0, 6)}
                  </h2>
                  <span className={getStatusBadge(order.status)}>
                    {order.status}
                  </span>
                </div>

                <p className="text-sm text-gray-500 mb-2">
                  Total: ${order.total?.toFixed(2)}
                </p>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-600 mb-1">Items:</p>
                  <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                    {order.items?.map((item, idx) => (
                      <li key={idx}>
                        {item.name} × {item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Status Actions */}
                <div className="mt-4 flex space-x-3">
                  {order.status === "pending" && (
                    <button
                      onClick={() => updateStatus(order.id, "accepted")}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
                    >
                      Accept
                    </button>
                  )}
                  {order.status === "accepted" && (
                    <button
                      onClick={() => updateStatus(order.id, "completed")}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
   </AdminLayout>);
}
