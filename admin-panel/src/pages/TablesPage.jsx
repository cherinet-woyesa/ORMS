import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiUsers, 
  FiGrid, 
  FiCoffee, 
  FiStar,
  FiX,
  FiCheck,
  FiLayout
} from "react-icons/fi";

const TablesPage = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ number: "", capacity: "2", location: "main" });
  const [editId, setEditId] = useState(null);
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "tables"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTables(data.sort((a, b) => (a.number || 0) - (b.number || 0)));
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tableData = {
      number: parseInt(form.number),
      capacity: parseInt(form.capacity) || 2,
      location: form.location,
      status: "available",
    };
    try {
      if (editId) {
        await updateDoc(doc(db, "tables", editId), tableData);
      } else {
        await addDoc(collection(db, "tables"), tableData);
      }
      resetForm();
    } catch (err) {
      console.error("Error saving table:", err);
    }
  };

  const updateStatus = async (tableId, status) => {
    await updateDoc(doc(db, "tables", tableId), { status });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this table?")) {
      await deleteDoc(doc(db, "tables", id));
      if (selectedTable?.id === id) setSelectedTable(null);
    }
  };

  const handleEdit = (table) => {
    setForm({ 
      number: table.number?.toString() || "", 
      capacity: table.capacity?.toString() || "2", 
      location: table.location || "main" 
    });
    setEditId(table.id);
    setShowForm(true);
    setSelectedTable(null);
  };

  const resetForm = () => {
    setForm({ number: "", capacity: "2", location: "main" });
    setEditId(null);
    setShowForm(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "occupied": return "bg-red-500";
      case "reserved": return "bg-amber-500";
      case "cleaning": return "bg-orange-500";
      default: return "bg-green-500";
    }
  };

  const getLocationIcon = (location) => {
    switch (location) {
      case "outdoor": return <FiCoffee className="w-5 h-5" />;
      case "vip": return <FiStar className="w-5 h-5" />;
      case "bar": return "🍺";
      default: return <FiGrid className="w-5 h-5" />;
    }
  };

  const getLocationColor = (location) => {
    switch (location) {
      case "outdoor": return "from-green-400 to-green-500";
      case "vip": return "from-purple-400 to-purple-500";
      case "bar": return "from-orange-400 to-orange-500";
      default: return "from-primary-400 to-orange-500";
    }
  };

  const stats = {
    total: tables.length,
    available: tables.filter((t) => t.status === "available").length,
    occupied: tables.filter((t) => t.status === "occupied").length,
    reserved: tables.filter((t) => t.status === "reserved").length,
  };
  const totalCapacity = tables.reduce((sum, t) => sum + (t.capacity || 0), 0);

  return (
    <div className="page-container space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Table Management</h1>
          <p className="mt-1 text-sm text-gray-600">Manage tables and seating</p>
        </div>
        <div className="flex items-center gap-2 mt-3 sm:mt-0">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded transition-all ${viewMode === "grid" ? "bg-white shadow text-purple-600" : "text-gray-500"}`}
              title="Grid View"
            >
              <FiGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("floor")}
              className={`p-1.5 rounded transition-all ${viewMode === "floor" ? "bg-white shadow text-purple-600" : "text-gray-500"}`}
              title="Floor Plan"
            >
              <FiLayout className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="inline-flex items-center px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
          >
            {showForm ? <FiX className="mr-1" /> : <FiPlus className="mr-1" />}
            {showForm ? "Cancel" : "Add"}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard
          title="Total"
          value={stats.total}
          icon={<FiGrid className="w-5 h-5" />}
          gradient="from-primary-500 to-orange-600"
        />
        <StatCard
          title="Available"
          value={stats.available}
          icon={<FiCheck className="w-6 h-6" />}
          gradient="from-green-500 to-green-600"
        />
        <StatCard
          title="Occupied"
          value={stats.occupied}
          icon={<FiUsers className="w-6 h-6" />}
          gradient="from-red-500 to-red-600"
        />
        <StatCard
          title="Reserved"
          value={stats.reserved}
          icon={<FiStar className="w-6 h-6" />}
          gradient="from-amber-500 to-amber-600"
        />
        <StatCard
          title="Total Seats"
          value={totalCapacity}
          icon={<FiUsers className="w-6 h-6" />}
          gradient="from-purple-500 to-purple-600"
        />
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-slide-down">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            {editId ? <FiEdit2 className="w-5 h-5" /> : <FiPlus className="w-5 h-5" />}
            {editId ? "Edit Table" : "Add New Table"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Table Number <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number" 
                  value={form.number} 
                  onChange={(e) => setForm({ ...form, number: e.target.value })} 
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" 
                  required 
                  placeholder="e.g., 1"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Capacity <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number" 
                  value={form.capacity} 
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })} 
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" 
                  required 
                  placeholder="e.g., 4"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <select 
                  value={form.location} 
                  onChange={(e) => setForm({ ...form, location: e.target.value })} 
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                >
                  <option value="main">Main Floor</option>
                  <option value="outdoor">Outdoor</option>
                  <option value="vip">VIP</option>
                  <option value="bar">Bar Area</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button 
                type="submit" 
                className="inline-flex items-center px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-sm"
              >
                <FiCheck className="mr-2" />
                {editId ? "Update" : "Add"} Table
              </button>
              <button 
                type="button" 
                onClick={resetForm} 
                className="inline-flex items-center px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                <FiX className="mr-2" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tables View - Grid or Floor Plan */}
      {tables.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <FiGrid className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No tables yet</h3>
          <p className="text-sm text-gray-500">Add your first table to get started</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {tables.map((table) => (
            <div 
              key={table.id} 
              onClick={() => setSelectedTable(table)} 
              className={`relative p-5 rounded-xl shadow-sm cursor-pointer transition-all hover:shadow-md hover:scale-105 ${
                selectedTable?.id === table.id 
                  ? "ring-2 ring-purple-500 bg-purple-50" 
                  : "bg-white"
              }`}
            >
              <div className={`absolute top-3 right-3 w-3 h-3 rounded-full ${getStatusColor(table.status)} shadow-lg`} />
              <div className="text-center">
                <div className={`flex justify-center mb-3 p-3 rounded-xl bg-gradient-to-br ${getLocationColor(table.location)} text-white mx-auto w-fit`}>
                  {getLocationIcon(table.location)}
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">T{table.number}</div>
                <div className="text-sm text-gray-600 flex items-center justify-center gap-1 mb-1">
                  <FiUsers className="w-3.5 h-3.5" /> 
                  {table.capacity} seats
                </div>
                <div className="text-xs text-gray-500 capitalize">{table.location}</div>
                <div className={`mt-2 text-xs font-semibold capitalize px-2 py-1 rounded-full ${
                  table.status === "available" ? "bg-green-100 text-green-700" :
                  table.status === "occupied" ? "bg-red-100 text-red-700" :
                  table.status === "reserved" ? "bg-amber-100 text-amber-700" :
                  "bg-orange-100 text-orange-700"
                }`}>
                  {table.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Floor Plan View */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="mb-6 flex flex-wrap gap-4">
            {["Main Hall", "Outdoor", "VIP Room", "Bar"].map(loc => (
              <div key={loc} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full ${
                  loc === "Main Hall" ? "bg-purple-500" : 
                  loc === "Outdoor" ? "bg-green-500" :
                  loc === "VIP Room" ? "bg-amber-500" : "bg-orange-500"
                }`} />
                <span className="text-sm text-gray-600">{loc}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 ml-auto">
              <div className="w-4 h-4 rounded-full bg-green-500" />
              <span className="text-sm text-gray-600">Available</span>
              <div className="w-4 h-4 rounded-full bg-red-500 ml-2" />
              <span className="text-sm text-gray-600">Occupied</span>
            </div>
          </div>
          
          {/* Floor Plan Grid */}
          <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
            {tables.map((table) => (
              <button
                key={table.id}
                onClick={() => setSelectedTable(table)}
                className={`
                  relative p-4 rounded-xl border-2 transition-all hover:scale-105
                  ${selectedTable?.id === table.id ? "border-purple-500 ring-2 ring-purple-200" : "border-dashed border-gray-300"}
                  ${table.status === "occupied" ? "bg-red-50 border-red-300" : 
                    table.status === "reserved" ? "bg-amber-50 border-amber-300" :
                    table.status === "cleaning" ? "bg-orange-50 border-orange-300" :
                    "bg-green-50 border-green-300"}
                `}
              >
                <div className="text-2xl font-bold text-gray-700">T{table.number}</div>
                <div className="text-xs text-gray-500 mt-1">{table.capacity} seats</div>
                <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
                  table.status === "occupied" ? "bg-red-500" :
                  table.status === "reserved" ? "bg-amber-500" :
                  table.status === "cleaning" ? "bg-orange-500" :
                  "bg-green-500"
                }`} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Table Detail Modal */}
      {selectedTable && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Table {selectedTable.number}</h3>
              <button 
                onClick={() => setSelectedTable(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Status</label>
              <div className="grid grid-cols-2 gap-2">
                {["available", "occupied", "reserved", "cleaning"].map((status) => (
                  <button 
                    key={status} 
                    onClick={() => { 
                      updateStatus(selectedTable.id, status); 
                      setSelectedTable({ ...selectedTable, status }); 
                    }} 
                    className={`py-2.5 rounded-lg text-sm font-medium capitalize transition-all ${
                      selectedTable.status === status 
                        ? "bg-purple-600 text-white shadow-md" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-6 grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="text-xs text-gray-500 mb-1">Capacity</div>
                <div className="text-lg font-bold text-gray-900 flex items-center gap-1">
                  <FiUsers className="w-4 h-4" />
                  {selectedTable.capacity} seats
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="text-xs text-gray-500 mb-1">Location</div>
                <div className="text-lg font-bold text-gray-900 capitalize flex items-center gap-1">
                  {getLocationIcon(selectedTable.location)}
                  {selectedTable.location}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => handleEdit(selectedTable)} 
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 font-medium transition-colors"
              >
                <FiEdit2 className="w-4 h-4" /> Edit
              </button>
              <button 
                onClick={() => handleDelete(selectedTable.id)} 
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-colors"
              >
                <FiTrash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function StatCard({ title, value, icon, gradient }) {
  return (
    <div className="relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <div className="text-white">{icon}</div>
          </div>
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

export default TablesPage;
