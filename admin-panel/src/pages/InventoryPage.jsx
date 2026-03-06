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
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiAlertTriangle, FiPackage, FiDollarSign, FiShoppingCart } from "react-icons/fi";

const CATEGORIES = ["Produce", "Meat", "Dairy", "Beverages", "Spices", "Packaging", "Cleaning", "Other"];

const InventoryPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "Other",
    quantity: "",
    unit: "pcs",
    minStock: "5",
    price: "",
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "inventory"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const itemData = {
      name: form.name,
      category: form.category,
      quantity: parseFloat(form.quantity) || 0,
      unit: form.unit,
      minStock: parseFloat(form.minStock) || 0,
      price: parseFloat(form.price) || 0,
      updatedAt: new Date(),
      ...(editId ? {} : { createdAt: new Date() }),
    };

    try {
      if (editId) {
        await updateDoc(doc(db, "inventory", editId), itemData);
      } else {
        await addDoc(collection(db, "inventory"), itemData);
      }
      resetForm();
    } catch (err) {
      console.error("Error saving item:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this item?")) {
      await deleteDoc(doc(db, "inventory", id));
    }
  };

  const handleEdit = (item) => {
    setForm({
      name: item.name,
      category: item.category || "Other",
      quantity: item.quantity?.toString() || "",
      unit: item.unit || "pcs",
      minStock: item.minStock?.toString() || "5",
      price: item.price?.toString() || "",
    });
    setEditId(item.id);
    setShowForm(true);
  };

  const updateQuantity = async (id, change) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const newQuantity = Math.max(0, item.quantity + change);
    await updateDoc(doc(db, "inventory", id), {
      quantity: newQuantity,
      updatedAt: new Date(),
    });
  };

  const resetForm = () => {
    setForm({
      name: "",
      category: "Other",
      quantity: "",
      unit: "pcs",
      minStock: "5",
      price: "",
    });
    setEditId(null);
    setShowForm(false);
  };

  const getStockStatus = (item) => {
    if (item.quantity <= 0) return { status: "out", color: "bg-red-100 text-red-800", icon: "🔴", text: "Out of Stock" };
    if (item.quantity <= item.minStock) return { status: "low", color: "bg-yellow-100 text-yellow-800", icon: "⚠️", text: "Low Stock" };
    return { status: "ok", color: "bg-green-100 text-green-800", icon: "✅", text: "In Stock" };
  };

  const filteredItems = items
    .filter((item) => {
      const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === "all" ||
        (filter === "low" && item.quantity <= item.minStock && item.quantity > 0) ||
        (filter === "out" && item.quantity <= 0) ||
        item.category === filter;
      return matchesSearch && matchesFilter;
    });

  const getTotalValue = () => items.reduce((sum, item) => sum + (item.quantity * (item.price || 0)), 0);
  const getLowStockCount = () => items.filter((i) => i.quantity <= i.minStock && i.quantity > 0).length;
  const getOutOfStockCount = () => items.filter((i) => i.quantity <= 0).length;

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Inventory Management</h2>
          <p className="text-sm text-gray-600">Track and manage your stock levels</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="mt-4 md:mt-0 flex items-center px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700"
        >
          <FiPlus className="mr-1.5" />
          {showForm ? "Cancel" : "Add Item"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Items</p>
              <p className="text-lg font-bold text-gray-900">{items.length}</p>
            </div>
            <div className="bg-primary-100 p-2 rounded">
              <FiPackage className="w-4 h-4 text-primary-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Low Stock</p>
              <p className="text-lg font-bold text-gray-900">{getLowStockCount()}</p>
            </div>
            <div className="bg-yellow-100 p-2 rounded">
              <FiAlertTriangle className="w-4 h-4 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Out of Stock</p>
              <p className="text-lg font-bold text-gray-900">{getOutOfStockCount()}</p>
            </div>
            <div className="bg-red-100 p-2 rounded">
              <FiShoppingCart className="w-4 h-4 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Value</p>
              <p className="text-lg font-bold text-gray-900">ETB {(getTotalValue() / 1000).toFixed(1)}K</p>
            </div>
            <div className="bg-green-100 p-2 rounded">
              <FiDollarSign className="w-4 h-4 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-semibold mb-3">{editId ? "Edit Inventory Item" : "Add New Inventory Item"}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Item Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg">
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Quantity *</label>
              <input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
              <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg">
                <option value="pcs">Pieces</option>
                <option value="kg">Kilograms</option>
                <option value="g">Grams</option>
                <option value="L">Liters</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Min Stock</label>
              <input type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Unit Price</label>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg" />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button type="submit" className="px-4 py-1.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">
              {editId ? "Update" : "Add"} Item
            </button>
            {editId && <button type="button" onClick={resetForm} className="px-4 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Cancel</button>}
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-2.5 top-2.5 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Search inventory..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg" />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 rounded-lg">
            <option value="all">All Items</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-600 uppercase">Item</th>
              <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-600 uppercase">Category</th>
              <th className="px-3 py-2.5 text-center text-xs font-bold text-gray-600 uppercase">Quantity</th>
              <th className="px-3 py-2.5 text-center text-xs font-bold text-gray-600 uppercase">Status</th>
              <th className="px-3 py-2.5 text-right text-xs font-bold text-gray-600 uppercase">Price</th>
              <th className="px-3 py-2.5 text-right text-xs font-bold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredItems.map((item) => {
              const stockStatus = getStockStatus(item);
              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2.5"><p className="font-medium text-sm text-gray-800">{item.name}</p></td>
                  <td className="px-3 py-2.5"><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{item.category || "Other"}</span></td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 bg-gray-100 rounded hover:bg-gray-200 flex items-center justify-center text-sm">-</button>
                      <span className="w-12 text-center text-sm font-mono font-medium">{item.quantity} {item.unit}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 bg-gray-100 rounded hover:bg-gray-200 flex items-center justify-center text-sm">+</button>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                      {stockStatus.icon} {stockStatus.text}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right text-sm font-medium">ETB {item.price?.toFixed(2) || "0.00"}</td>
                  <td className="px-3 py-2.5 text-right">
                    <button onClick={() => handleEdit(item)} className="p-1.5 text-primary-600 hover:bg-primary-50 rounded mr-1"><FiEdit2 size={14} /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><FiTrash2 size={14} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryPage;
