import React, { useEffect, useState, useCallback } from "react";
import { collection, getDocs, query, orderBy, where, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiMail,
  FiUsers,
  FiAlertCircle,
  FiCheck,
  FiX,
  FiTrash2,
  FiSearch,
  FiPhone,
  FiMapPin
} from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, parseISO } from "date-fns";

const ReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    try {
      let q = query(collection(db, "reservations"), orderBy("date", "desc"));

      if (filter !== "all") {
        q = query(q, where("status", "==", filter));
      }

      if (dateFilter) {
        const startOfDay = new Date(dateFilter);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(dateFilter);
        endOfDay.setHours(23, 59, 59, 999);
        q = query(q, where("date", ">=", startOfDay), where("date", "<=", endOfDay));
      }

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate ? doc.data().date.toDate() : parseISO(doc.data().date)
      }));

      const filteredData = searchTerm
        ? data.filter(res =>
          res.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          res.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          res.phone?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : data;

      setReservations(filteredData);
    } catch (err) {
      console.error("Error fetching reservations:", err);
    } finally {
      setLoading(false);
    }
  }, [filter, dateFilter, searchTerm]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const updateStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, "reservations", id), { status });
      fetchReservations();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this reservation?")) {
      try {
        await deleteDoc(doc(db, "reservations", id));
        fetchReservations();
      } catch (err) {
        console.error("Failed to delete:", err);
      }
    }
  };

  const getStatusBadge = (status) => {
    const base = "px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5";
    switch (status) {
      case "pending":
        return `${base} bg-amber-100 text-amber-700 border border-amber-200`;
      case "confirmed":
        return `${base} bg-green-100 text-green-700 border border-green-200`;
      case "cancelled":
        return `${base} bg-red-100 text-red-700 border border-red-200`;
      case "completed":
        return `${base} bg-primary-100 text-primary-700 border border-primary-200`;
      default:
        return `${base} bg-gray-100 text-gray-700 border border-gray-200`;
    }
  };

  const formatDateTime = (date) => {
    if (!date) return "N/A";
    return format(date, "EEE, MMM d, yyyy 'at' h:mm a");
  };

  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === "pending").length,
    confirmed: reservations.filter(r => r.status === "confirmed").length,
    completed: reservations.filter(r => r.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reservation Management</h1>
          <p className="mt-1 text-sm text-gray-600">View and manage all booking requests</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Reservations"
          value={stats.total}
          icon={<FiCalendar className="w-6 h-6" />}
          gradient="from-primary-500 to-orange-600"
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={<FiClock className="w-6 h-6" />}
          gradient="from-amber-500 to-amber-600"
          badge={stats.pending > 0 ? "Needs Action" : null}
        />
        <StatCard
          title="Confirmed"
          value={stats.confirmed}
          icon={<FiCheck className="w-6 h-6" />}
          gradient="from-green-500 to-green-600"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={<FiCheck className="w-6 h-6" />}
          gradient="from-primary-500 to-primary-600"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search reservations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-medium"
          >
            <option value="all">All Reservations</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
          <DatePicker
            selected={dateFilter}
            onChange={(date) => setDateFilter(date)}
            placeholderText="Filter by date"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            isClearable
          />
        </div>
        {(filter !== "all" || dateFilter || searchTerm) && (
          <button
            onClick={() => {
              setFilter("all");
              setDateFilter(null);
              setSearchTerm("");
            }}
            className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Reservations List */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading reservations...</p>
        </div>
      ) : reservations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <FiCalendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No reservations found</h3>
          <p className="text-sm text-gray-500">
            {filter !== "all" || dateFilter || searchTerm
              ? "Try adjusting your filters"
              : "No reservations have been made yet"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Guests
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reservations.map((res) => (
                  <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-orange-500 flex items-center justify-center">
                          <FiUser className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{res.name}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <FiMail className="w-3 h-3" />
                            {res.email}
                          </div>
                          {res.phone && (
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <FiPhone className="w-3 h-3" />
                              {res.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <FiCalendar className="w-4 h-4 text-gray-400" />
                        {formatDateTime(res.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-900">
                        <FiUsers className="w-4 h-4 text-gray-400" />
                        {res.people} {res.people === 1 ? "guest" : "guests"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(res.status)}>
                        {res.status === "pending" && <FiAlertCircle className="w-3.5 h-3.5" />}
                        {res.status === "confirmed" && <FiCheck className="w-3.5 h-3.5" />}
                        {res.status === "cancelled" && <FiX className="w-3.5 h-3.5" />}
                        {res.status === "completed" && <FiCheck className="w-3.5 h-3.5" />}
                        {res.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {res.status === "pending" && (
                          <button
                            onClick={() => updateStatus(res.id, "confirmed")}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Confirm"
                          >
                            <FiCheck className="w-4 h-4" />
                          </button>
                        )}
                        {res.status === "confirmed" && (
                          <button
                            onClick={() => updateStatus(res.id, "completed")}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Complete"
                          >
                            <FiCheck className="w-4 h-4" />
                          </button>
                        )}
                        {res.status !== "cancelled" && res.status !== "completed" && (
                          <button
                            onClick={() => updateStatus(res.id, "cancelled")}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Cancel"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(res.id)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

function StatCard({ title, value, icon, gradient, badge }) {
  return (
    <div className="relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <div className="text-white">{icon}</div>
          </div>
          {badge && (
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full animate-pulse">
              {badge}
            </span>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
      <div className={`h-1 bg-gradient-to-r ${gradient}`}></div>
    </div>
  );
}

export default ReservationsPage;
