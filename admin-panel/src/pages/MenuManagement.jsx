import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import AdminLayout from "../components/AdminLayout";

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", description: "" });

  const fetchMenu = async () => {
    const querySnapshot = await getDocs(collection(db, "menus"));
    const items = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setMenuItems(items);
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return;
    await addDoc(collection(db, "menus"), {
      name: form.name,
      price: parseFloat(form.price),
      description: form.description,
    });
    setForm({ name: "", price: "", description: "" });
    fetchMenu(); // refresh list
  };

  const deleteItem = async (id) => {
    await deleteDoc(doc(db, "menus", id));
    fetchMenu();
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">🍽️ Menu Management</h1>

      {/* Add New Item Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-8 space-y-4 max-w-xl">
        <div>
          <label className="block mb-1 font-medium">Item Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Price (ETB)</label>
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Description (optional)</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Add Menu Item
        </button>
      </form>

      {/* List of Menu Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {menuItems.map((item) => (
          <div key={item.id} className="bg-white p-5 shadow rounded relative">
            <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
            <p className="text-gray-500 mb-2">{item.description}</p>
            <p className="font-bold text-green-600">ETB {item.price}</p>
            <button
              onClick={() => deleteItem(item.id)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm"
            >
              ✖
            </button>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
