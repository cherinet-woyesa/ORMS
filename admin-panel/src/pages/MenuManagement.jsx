import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db, storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import AdminLayout from "../components/AdminLayout";
const MenuPage = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [menus, setMenus] = useState([]);
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
    if (!image) return null;
    const storageRef = ref(storage, `menuImages/${image.name}-${Date.now()}`);
    const snapshot = await uploadBytes(storageRef, image);
    const url = await getDownloadURL(snapshot.ref);
    return url;
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const imageUrl = await handleImageUpload();

      await addDoc(menuCollection, {
        name,
        price: parseFloat(price),
        description,
        imageUrl,
        createdAt: new Date(),
      });

      setName("");
      setPrice("");
      setDescription("");
      setImage(null);
      fetchMenus();
    } catch (err) {
      console.error("Error adding menu item:", err);
    }

    setLoading(false);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "menus", id));
    fetchMenus();
  };

  return (
    <AdminLayout>
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">🍽️ Menu Management</h2>

      <form
        onSubmit={handleAddItem}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-white p-6 rounded shadow"
      >
        <input
          type="text"
          placeholder="Food Name"
          className="border p-2 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Price (ETB)"
          className="border p-2 rounded"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          className="border p-2 rounded md:col-span-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <input
          type="file"
          className="md:col-span-2"
          onChange={(e) => setImage(e.target.files[0])}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 md:col-span-2"
        >
          {loading ? "Adding..." : "Add Item"}
        </button>
      </form>

      <h3 className="text-xl font-semibold mb-3">📋 Menu Items</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {menus.map((item) => (
          <div key={item.id} className="border p-4 rounded shadow-sm bg-white">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-40 w-full object-cover rounded"
            />
            <h4 className="text-lg font-bold mt-2">{item.name}</h4>
            <p className="text-sm text-gray-700">{item.description}</p>
            <p className="text-purple-700 font-semibold">ETB {item.price}</p>
            <button
              onClick={() => handleDelete(item.id)}
              className="mt-2 text-red-600 hover:underline text-sm"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
    </AdminLayout>

  );
};

export default MenuPage;
