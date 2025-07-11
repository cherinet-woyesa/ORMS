import React, { useEffect, useState, useCallback } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import AdminLayout from "../components/AdminLayout";
import { FiCalendar, FiClock, FiUsers, FiCheckCircle, FiXCircle, FiTrash2, FiLoader } from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, parseISO } from "date-fns";

const ReservationManagement = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    try {
      let q = query(collection(db, "reservations"), orderBy("date", "asc"));

      // Apply status filter
      if (filter !== "all") {
        q = query(q, where("status", "==", filter));
      }

      // Apply date filter
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

      // Apply search filter
      const filteredData = searchQuery
        ? data.filter(res =>
            res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            res.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            res.phone?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : data;

      setReservations(filteredData);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    } finally {
      setLoading(false);
    }
  }, [filter, dateFilter, searchQuery]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const updateStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, "reservations", id), { 
        status: newStatus,
        updatedAt: new Date() 
      });
      fetchReservations();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this reservation?")) return;
    try {
      await deleteDoc(doc(db, "reservations", id));
      fetchReservations();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const getStatusBadge = (status) => {
    const base = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "pending":
        return `${base} bg-yellow-100 text-yellow-800`;
      case "accepted":
        return `${base} bg-green-100 text-green-800`;
      case "rejected":
        return `${base} bg-red-100 text-red-800`;
      case "completed":
        return `${base} bg-blue-100 text-blue-800`;
      default:
        return `${base} bg-gray-100 text-gray-800`;
    }
  };

  const formatDateTime = (date) => {
    if (!date) return "N/A";
    return format(date, "MMM dd, yyyy 'at' h:mm a");
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Reservation Management</h2>
            <p className="text-sm text-gray-600">View and manage all reservations</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <DatePicker
              selected={dateFilter}
              onChange={(date) => setDateFilter(date)}
              placeholderText="Filter by date"
              className="border border-gray-300 rounded-md p-2 text-sm"
              isClearable
            />
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
              >
                <option value="all">All Reservations</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search by name, email or phone"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilter("all");
                  setDateFilter(null);
                  setSearchQuery("");
                }}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md text-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FiLoader className="animate-spin h-8 w-8 text-blue-500" />
          </div>
        ) : reservations.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No reservations found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter !== "all" || dateFilter || searchQuery
                ? "Try adjusting your filters"
                : "No reservations have been made yet"}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FiCalendar className="mr-1" /> Date & Time
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FiUsers className="mr-1" /> Guests
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reservations.map((res) => (
                    <tr key={res.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{res.name}</div>
                        <div className="text-sm text-gray-500">{res.phone || res.email}</div>
                        {res.notes && (
                          <div className="text-xs text-gray-400 mt-1">"{res.notes}"</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(res.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {res.people} {res.people === 1 ? "person" : "people"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(res.status)}>
                          {res.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {res.status !== "accepted" && (
                          <button
                            onClick={() => updateStatus(res.id, "accepted")}
                            className="text-green-600 hover:text-green-900"
                            title="Accept"
                          >
                            <FiCheckCircle size={18} />
                          </button>
                        )}
                        {res.status !== "rejected" && (
                          <button
                            onClick={() => updateStatus(res.id, "rejected")}
                            className="text-red-600 hover:text-red-900"
                            title="Reject"
                          >
                            <FiXCircle size={18} />
                          </button>
                        )}
                        {res.status !== "completed" && res.status === "accepted" && (
                          <button
                            onClick={() => updateStatus(res.id, "completed")}
                            className="text-blue-600 hover:text-blue-900"
                            title="Complete"
                          >
                            ✓
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(res.id)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Delete"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ReservationManagement;