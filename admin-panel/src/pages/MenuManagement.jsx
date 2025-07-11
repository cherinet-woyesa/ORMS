// src/pages/MenuPage.jsx
import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db, storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import AdminLayout from "../components/AdminLayout";

const MenuPage = () => {
  const [menus, setMenus] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    image: null,
    imageUrl: "",
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const menuCollection = collection(db, "menus");

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    const snapshot = await getDocs(menuCollection);
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setMenus(items);
  };

  const handleImageUpload = async () => {
    if (!form.image) return form.imageUrl || null;
    const storageRef = ref(storage, `menuImages/${form.image.name}-${Date.now()}`);
    const snapshot = await uploadBytes(storageRef, form.image);
    const url = await getDownloadURL(snapshot.ref);
    return url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!form.name || !form.price || !form.description) {
      alert("All fields are required");
      setLoading(false);
      return;
    }

    try {
      const imageUrl = await handleImageUpload();

      if (editId) {
        await updateDoc(doc(db, "menus", editId), {
          name: form.name,
          price: parseFloat(form.price),
          description: form.description,
          imageUrl,
        });
      } else {
        await addDoc(menuCollection, {
          name: form.name,
          price: parseFloat(form.price),
          description: form.description,
          imageUrl,
          createdAt: new Date(),
        });
      }

      resetForm();
      fetchMenus();
    } catch (err) {
      console.error("Error saving menu item:", err);
    }

    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      await deleteDoc(doc(db, "menus", id));
      fetchMenus();
    }
  };

  const handleEdit = (item) => {
    setForm({
      name: item.name,
      price: item.price,
      description: item.description,
      image: null,
      imageUrl: item.imageUrl,
    });
    setEditId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setForm({
      name: "",
      price: "",
      description: "",
      image: null,
      imageUrl: "",
    });
    setEditId(null);
  };

  const filteredMenus = menus.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">🍽️ Menu Management</h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-white p-6 rounded shadow"
        >
          <input
            type="text"
            placeholder="Food Name"
            className="border p-2 rounded"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Price (ETB)"
            className="border p-2 rounded"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />
          <textarea
            placeholder="Description"
            className="border p-2 rounded md:col-span-2"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <input
            type="file"
            className="md:col-span-2"
            onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
          />
          {form.imageUrl && (
            <img
              src={form.imageUrl}
              alt="Preview"
              className="w-32 h-32 object-cover rounded shadow"
            />
          )}
          <div className="md:col-span-2 flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition"
            >
              {loading ? "Saving..." : editId ? "Update Item" : "Add Item"}
            </button>
            {editId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4 p-2 border w-full rounded shadow-sm"
        />

        <h3 className="text-xl font-semibold mb-3">📋 Menu Items</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredMenus.length === 0 ? (
            <p className="text-gray-500">No matching items found.</p>
          ) : (
            filteredMenus.map((item) => (
              <div
                key={item.id}
                className="border p-4 rounded shadow-sm bg-white relative"
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-40 w-full object-cover rounded"
                />
                <h4 className="text-lg font-bold mt-2">{item.name}</h4>
                <p className="text-sm text-gray-700">{item.description}</p>
                <p className="text-purple-700 font-semibold">ETB {item.price}</p>

                {/* Future Order Stats Placeholder */}
                {/* <p className="text-xs text-gray-400">Ordered 20x</p> */}

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default MenuPage;
