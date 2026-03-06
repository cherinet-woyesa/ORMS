import React, { useEffect, useState, useCallback } from "react";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "../firebase";
import { FiCalendar, FiClock, FiUsers, FiCheckCircle, FiXCircle, FiTrash2 } from "react-icons/fi";

const ReservationManagement = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    try {
      let q = query(collection(db, "reservations"), orderBy("date", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReservations(data);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReservations(); }, [fetchReservations]);

  const getStatusBadge = (status) => {
    const base = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "pending": return `${base} bg-yellow-100 text-yellow-800`;
      case "accepted": return `${base} bg-green-100 text-green-800`;
      case "rejected": return `${base} bg-red-100 text-red-800`;
      case "completed": return `${base} bg-primary-100 text-primary-800`;
      default: return `${base} bg-gray-100 text-gray-800`;
    }
  };

  const filteredReservations = filter === "all" ? reservations : reservations.filter(r => r.status === filter);

  const pendingCount = reservations.filter(r => r.status === "pending").length;
  const acceptedCount = reservations.filter(r => r.status === "accepted").length;

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Reservation Management</h1>
          <p className="text-sm text-gray-600">View and manage all reservations</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-xl font-bold text-gray-900">{reservations.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Confirmed</p>
          <p className="text-xl font-bold text-green-600">{acceptedCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Today</p>
          <p className="text-xl font-bold text-gray-900">{reservations.filter(r => r.date?.toDate?.().toDateString() === new Date().toDateString()).length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 rounded-lg">
          <option value="all">All Reservations</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-600 uppercase">Customer</th>
              <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-600 uppercase">Date & Time</th>
              <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-600 uppercase">Guests</th>
              <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-600 uppercase">Status</th>
              <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-600 uppercase">Phone</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredReservations.map((reservation) => (
              <tr key={reservation.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-sm text-gray-800">{reservation.name || "Guest"}</p>
                  <p className="text-xs text-gray-500">{reservation.email}</p>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {reservation.date?.toDate?.()?.toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{reservation.guests || reservation.people || 2}</td>
                <td className="px-4 py-3">
                  <span className={getStatusBadge(reservation.status)}>{reservation.status}</span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{reservation.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReservationManagement;
