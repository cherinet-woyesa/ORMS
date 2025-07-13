import React, { useEffect, useState, useCallback } from "react";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "../firebase";
import AdminLayout from "../components/AdminLayout";
import { FiCalendar, FiClock, FiUser, FiMail, FiUsers, FiAlertCircle, FiCheck, FiX, FiTrash2, FiFilter, FiSearch } from "react-icons/fi";
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
      const filteredData = searchTerm
        ? data.filter(res =>
            res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            res.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const getStatusBadge = (status) => {
    const base = "px-2 py-1 rounded-full text-xs font-medium flex items-center";
    switch (status) {
      case "pending":
        return `${base} bg-yellow-50 text-yellow-700 border border-yellow-200`;
      case "confirmed":
        return `${base} bg-green-50 text-green-700 border border-green-200`;
      case "cancelled":
        return `${base} bg-red-50 text-red-700 border border-red-200`;
      case "completed":
        return `${base} bg-blue-50 text-blue-700 border border-blue-200`;
      default:
        return `${base} bg-gray-50 text-gray-700 border border-gray-200`;
    }
  };

  const formatDateTime = (date) => {
    if (!date) return "N/A";
    return format(date, "EEE, MMM d, yyyy 'at' h:mm a");
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Reservation Management</h2>
            <p className="text-sm text-gray-600">View and manage all booking requests</p>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search reservations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
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
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <DatePicker
                selected={dateFilter}
                onChange={(date) => setDateFilter(date)}
                placeholderText="Filter by date"
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                isClearable
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilter("all");
                  setDateFilter(null);
                  setSearchTerm("");
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
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : reservations.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No reservations found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter !== "all" || dateFilter || searchTerm
                ? "Try adjusting your filters"
                : "No reservations have been made yet"}
            </p>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FiCalendar className="mr-1" /> Date & Time
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FiUsers className="mr-1" /> Guests
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reservations.map((res) => (
                    <tr key={res.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <FiUser className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{res.name}</div>
                            <div className="text-sm text-gray-500">{res.email}</div>
                            {res.phone && <div className="text-xs text-gray-400">{res.phone}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDateTime(res.date)}</div>
                        <div className="text-xs text-gray-500">{res.time}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {res.people} {res.people === 1 ? "person" : "people"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(res.status)}>
                          {res.status === "pending" && <FiAlertCircle className="mr-1" />}
                          {res.status === "confirmed" && <FiCheck className="mr-1" />}
                          {res.status === "cancelled" && <FiX className="mr-1" />}
                          {res.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        {res.status !== "confirmed" && (
                          <button
                            onClick={() => updateStatus(res.id, "confirmed")}
                            className="text-green-600 hover:text-green-900"
                            title="Confirm"
                          >
                            <FiCheck size={18} />
                          </button>
                        )}
                        {res.status !== "cancelled" && (
                          <button
                            onClick={() => updateStatus(res.id, "cancelled")}
                            className="text-red-600 hover:text-red-900"
                            title="Cancel"
                          >
                            <FiX size={18} />
                          </button>
                        )}
                        {res.status === "confirmed" && (
                          <button
                            onClick={() => updateStatus(res.id, "completed")}
                            className="text-blue-600 hover:text-blue-900"
                            title="Complete"
                          >
                            ✓
                          </button>
                        )}
                        <button
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

export default ReservationsPage;