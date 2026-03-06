import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import { FiPlus, FiTag, FiEdit2, FiTrash2, FiGift, FiCalendar, FiPercent, FiDollarSign, FiToggleLeft, FiToggleRight, FiCopy } from "react-icons/fi";

const PromotionsPage = () => {
  const [promotions, setPromotions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    minOrder: "",
    maxUses: "",
    startDate: "",
    endDate: "",
    active: true,
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "promotions"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPromotions(data);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const promoData = {
      code: form.code.toUpperCase(),
      description: form.description,
      discountType: form.discountType,
      discountValue: parseFloat(form.discountValue) || 0,
      minOrder: parseFloat(form.minOrder) || 0,
      maxUses: form.maxUses ? parseInt(form.maxUses) : null,
      currentUses: editId ? promotions.find((p) => p.id === editId)?.currentUses || 0 : 0,
      startDate: form.startDate ? new Date(form.startDate) : new Date(),
      endDate: form.endDate ? new Date(form.endDate) : null,
      active: form.active,
      createdAt: new Date(),
    };

    try {
      if (editId) {
        await updateDoc(doc(db, "promotions", editId), promoData);
      } else {
        await addDoc(collection(db, "promotions"), promoData);
      }
      resetForm();
    } catch (err) {
      console.error("Error saving promotion:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this promotion?")) {
      await deleteDoc(doc(db, "promotions", id));
    }
  };

  const handleEdit = (promo) => {
    setForm({
      code: promo.code,
      description: promo.description || "",
      discountType: promo.discountType || "percentage",
      discountValue: promo.discountValue?.toString() || "",
      minOrder: promo.minOrder?.toString() || "",
      maxUses: promo.maxUses?.toString() || "",
      startDate: promo.startDate?.toDate?.().toISOString().split("T")[0] || "",
      endDate: promo.endDate?.toDate?.().toISOString().split("T")[0] || "",
      active: promo.active,
    });
    setEditId(promo.id);
    setShowForm(true);
  };

  const toggleActive = async (promo) => {
    await updateDoc(doc(db, "promotions", promo.id), { active: !promo.active });
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Copied: ${code}`);
  };

  const resetForm = () => {
    setForm({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      minOrder: "",
      maxUses: "",
      startDate: "",
      endDate: "",
      active: true,
    });
    setEditId(null);
    setShowForm(false);
  };

  const isValid = (promo) => {
    const now = new Date();
    const start = promo.startDate?.toDate?.() || now;
    const end = promo.endDate?.toDate?.();

    if (now < start) return false;
    if (end && now > end) return false;
    if (promo.maxUses && promo.currentUses >= promo.maxUses) return false;
    return promo.active;
  };

  const getStatus = (promo) => {
    const now = new Date();
    const start = promo.startDate?.toDate?.() || now;
    const end = promo.endDate?.toDate?.();

    if (!promo.active) return { status: "inactive", label: "Inactive", color: "bg-gray-100 text-gray-800" };
    if (now < start) return { status: "scheduled", label: "Scheduled", color: "bg-primary-100 text-primary-800" };
    if (end && now > end) return { status: "expired", label: "Expired", color: "bg-red-100 text-red-800" };
    if (promo.maxUses && promo.currentUses >= promo.maxUses) return { status: "maxed", label: "Maxed Out", color: "bg-orange-100 text-orange-800" };
    return { status: "active", label: "Active", color: "bg-green-100 text-green-800" };
  };

  const activePromos = promotions.filter(p => isValid(p));
  const totalSavings = promotions.reduce((sum, p) => sum + (p.currentUses || 0), 0);

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Promotions Management</h2>
          <p className="text-sm text-gray-600">Create and manage discount codes</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="mt-4 md:mt-0 flex items-center px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700"
        >
          <FiPlus className="mr-1.5" />
          {showForm ? "Cancel" : "New Promotion"}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Total Promotions</p>
          <p className="text-lg font-bold text-gray-900">{promotions.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Active Now</p>
          <p className="text-lg font-bold text-green-600">{activePromos.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Total Uses</p>
          <p className="text-lg font-bold text-gray-900">{totalSavings}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Expired</p>
          <p className="text-lg font-bold text-gray-900">{promotions.filter(p => getStatus(p).status === "expired").length}</p>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-semibold mb-3">{editId ? "Edit Promotion" : "Create New Promotion"}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Promo Code *</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., SUMMER20"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Discount Type</label>
              <select
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (ETB)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Discount Value *</label>
              <input
                type="number"
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder={form.discountType === "percentage" ? "20" : "100"}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Min Order (ETB)</label>
              <input
                type="number"
                value={form.minOrder}
                onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Max Uses</label>
              <input
                type="number"
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Unlimited"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>
            </div>
            <div className="md:col-span-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Summer sale - 20% off all orders"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button type="submit" className="px-4 py-1.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">
              {editId ? "Update" : "Create"} Promotion
            </button>
            {editId && (
              <button type="button" onClick={resetForm} className="px-4 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {/* Promotions Grid */}
      {promotions.length === 0 ? (
        <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
          <FiGift className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-gray-900">No promotions yet</h3>
          <p className="text-xs text-gray-500">Create your first promotion to attract customers</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {promotions.map((promo) => {
            const status = getStatus(promo);
            return (
              <div key={promo.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base font-bold font-mono bg-gray-100 px-2 py-0.5 rounded">{promo.code}</span>
                      <button
                        onClick={() => copyToClipboard(promo.code)}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                      >
                        <FiCopy size={12} />
                      </button>
                    </div>
                    <button
                      onClick={() => toggleActive(promo)}
                      className={`p-1 rounded ${promo.active ? "text-green-600" : "text-gray-400"}`}
                    >
                      {promo.active ? <FiToggleRight size={18} /> : <FiToggleLeft size={18} />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${status.color}`}>
                      {status.label}
                    </span>
                    <div className="text-right">
                      <span className="text-xl font-bold text-primary-600">
                        {promo.discountType === "percentage" ? `${promo.discountValue}%` : `ETB ${promo.discountValue}`}
                      </span>
                      <span className="text-xs text-gray-500"> OFF</span>
                    </div>
                  </div>

                  {promo.description && (
                    <p className="text-xs text-gray-600 mb-2">{promo.description}</p>
                  )}

                  <div className="space-y-1 text-xs text-gray-500">
                    {promo.minOrder > 0 && (
                      <div className="flex items-center gap-1.5">
                        <FiDollarSign className="w-3 h-3" />
                        <span>Min: ETB {promo.minOrder}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <FiTag className="w-3 h-3" />
                      <span>Uses: {promo.currentUses || 0}{promo.maxUses ? ` / ${promo.maxUses}` : " (Unlimited)"}</span>
                    </div>
                    {(promo.startDate || promo.endDate) && (
                      <div className="flex items-center gap-1.5">
                        <FiCalendar className="w-3 h-3" />
                        <span>
                          {promo.startDate?.toDate?.().toLocaleDateString() || "Now"} - {promo.endDate?.toDate?.().toLocaleDateString() || "No expiry"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleEdit(promo)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-primary-50 text-primary-600 rounded text-xs font-medium hover:bg-primary-100"
                    >
                      <FiEdit2 size={12} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(promo.id)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-red-50 text-red-600 rounded text-xs font-medium hover:bg-red-100"
                    >
                      <FiTrash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PromotionsPage;
