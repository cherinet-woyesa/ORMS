import React, { useEffect, useState } from "react";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { FiPlus, FiGift, FiCheck, FiX, FiCopy, FiSearch } from "react-icons/fi";

const GiftCardsPage = () => {
  const [cards, setCards] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ amount: "50", quantity: "1", type: "single", customMessage: "" });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "giftCards"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCards(data);
    });
    return () => unsubscribe();
  }, []);

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 16; i++) {
      if (i > 0 && i % 4 === 0) code += "-";
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const createGiftCards = async (e) => {
    e.preventDefault();
    setLoading(true);
    const amount = parseFloat(form.amount);
    const quantity = parseInt(form.quantity);
    try {
      for (let i = 0; i < quantity; i++) {
        const card = { code: generateCode(), amount, type: form.type, customMessage: form.customMessage, balance: amount, status: "active", purchasedBy: null, purchasedAt: null, redeemedBy: null, redeemedAt: null, createdAt: new Date() };
        await addDoc(collection(db, "giftCards"), card);
      }
      setForm({ amount: "50", quantity: "1", type: "single", customMessage: "" });
      setShowForm(false);
    } catch (err) { console.error("Error creating gift cards:", err); }
    setLoading(false);
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    alert("Code copied!");
  };

  const deleteCard = async (id) => {
    if (window.confirm("Delete this gift card?")) await deleteDoc(doc(db, "giftCards", id));
  };

  const activeCards = cards.filter((c) => c.status === "active");
  const redeemedCards = cards.filter((c) => c.status === "redeemed");
  const totalValue = activeCards.reduce((sum, c) => sum + (c.balance || c.amount), 0);

  const filteredCards = cards.filter(c => c.code?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Gift Cards Management</h2>
          <p className="text-sm text-gray-600">Create and manage gift cards</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="mt-4 md:mt-0 flex items-center px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">
          <FiPlus className="mr-1.5" /> {showForm ? "Cancel" : "Create Gift Cards"}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Total Cards</p>
          <p className="text-lg font-bold text-gray-900">{cards.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Active</p>
          <p className="text-lg font-bold text-green-600">{activeCards.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Redeemed</p>
          <p className="text-lg font-bold text-gray-900">{redeemedCards.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Total Value</p>
          <p className="text-lg font-bold text-gray-900">ETB {(totalValue / 1000).toFixed(1)}K</p>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={createGiftCards} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Amount (ETB)</label>
            <select value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
              <option value="25">ETB 25</option>
              <option value="50">ETB 50</option>
              <option value="100">ETB 100</option>
              <option value="200">ETB 200</option>
              <option value="500">ETB 500</option>
              <option value="1000">ETB 1,000</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
            <input type="number" min="1" max="100" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
              <option value="single">Single Use</option>
              <option value="multiple">Multi-use</option>
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={loading} className="w-full px-4 py-1.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50">{loading ? "Creating..." : "Create Cards"}</button>
          </div>
        </form>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="relative">
          <FiSearch className="absolute left-2.5 top-2.5 text-gray-400 w-4 h-4" />
          <input type="text" placeholder="Search gift cards..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
        </div>
      </div>

      {/* Gift Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredCards.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200"><FiGift className="w-10 h-10 text-gray-300 mx-auto mb-3" /><h3 className="text-sm font-medium text-gray-900">No gift cards found</h3><p className="text-xs text-gray-500">Create your first gift card</p></div>
        ) : (
          filteredCards.map((card) => (
            <div key={card.id} className={`bg-white rounded-lg shadow-sm overflow-hidden border ${card.status === "active" ? "border-green-200" : "border-gray-200"}`}>
              <div className={`p-3 ${card.status === "active" ? "bg-green-50" : "bg-gray-50"}`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1.5">
                    <FiGift className={card.status === "active" ? "text-green-600" : "text-gray-400"} />
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${card.status === "active" ? "bg-green-600 text-white" : "bg-gray-400 text-white"}`}>{card.status}</span>
                  </div>
                  <button onClick={() => copyToClipboard(card.code)} className="text-gray-400 hover:text-gray-600"><FiCopy size={14} /></button>
                </div>
                <p className="font-mono text-sm font-bold mt-2 tracking-wider">{card.code}</p>
                <p className="text-xl font-bold mt-1 text-primary-600">ETB {card.amount}</p>
                {card.balance !== card.amount && <p className="text-xs text-gray-500">Balance: ETB {card.balance}</p>}
              </div>
              <div className="p-2.5 flex justify-between items-center bg-white">
                <button onClick={() => deleteCard(card.id)} className="text-red-600 hover:bg-red-50 px-2 py-1 rounded text-xs">Delete</button>
                <span className="text-xs text-gray-400">{card.createdAt?.toDate?.().toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GiftCardsPage;
