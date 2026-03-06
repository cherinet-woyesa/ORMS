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

const RestaurantsPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    location: "",
    phone: "",
    email: "",
    cuisine: "",
    description: "",
    deliveryFee: "0",
    deliveryTime: "30",
    minOrder: "0",
    openTime: "09:00",
    closeTime: "22:00",
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "restaurants"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRestaurants(data);
      if (data.length > 0 && !selectedRestaurant) {
        setSelectedRestaurant(data[0]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const restaurantData = {
      name: form.name,
      location: form.location,
      phone: form.phone,
      email: form.email,
      cuisine: form.cuisine,
      description: form.description,
      deliveryFee: parseFloat(form.deliveryFee) || 0,
      deliveryTime: parseInt(form.deliveryTime) || 30,
      minOrder: parseFloat(form.minOrder) || 0,
      openTime: form.openTime,
      closeTime: form.closeTime,
      isActive: true,
      createdAt: new Date(),
    };

    try {
      if (editId) {
        await updateDoc(doc(db, "restaurants", editId), restaurantData);
      } else {
        await addDoc(collection(db, "restaurants"), restaurantData);
      }
      resetForm();
    } catch (err) {
      console.error("Error saving restaurant:", err);
    }
  };

  const handleEdit = (restaurant) => {
    setForm({
      name: restaurant.name || "",
      location: restaurant.location || "",
      phone: restaurant.phone || "",
      email: restaurant.email || "",
      cuisine: restaurant.cuisine || "",
      description: restaurant.description || "",
      deliveryFee: restaurant.deliveryFee?.toString() || "0",
      deliveryTime: restaurant.deliveryTime?.toString() || "30",
      minOrder: restaurant.minOrder?.toString() || "0",
      openTime: restaurant.openTime || "09:00",
      closeTime: restaurant.closeTime || "22:00",
    });
    setEditId(restaurant.id);
    setShowForm(true);
  };

  const toggleActive = async (restaurant) => {
    await updateDoc(doc(db, "restaurants", restaurant.id), {
      isActive: !restaurant.isActive,
    });
  };

  const deleteRestaurant = async (id) => {
    if (window.confirm("Delete this restaurant?")) {
      await deleteDoc(doc(db, "restaurants", id));
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      location: "",
      phone: "",
      email: "",
      cuisine: "",
      description: "",
      deliveryFee: "0",
      deliveryTime: "30",
      minOrder: "0",
      openTime: "09:00",
      closeTime: "22:00",
    });
    setEditId(null);
    setShowForm(false);
  };

  const activeRestaurants = restaurants.filter((r) => r.isActive);
  const inactiveRestaurants = restaurants.filter((r) => !r.isActive);

  return (
    <div className="page-container space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">🏪 Restaurant Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary-600 text-white px-3 py-1.5 text-sm rounded hover:bg-primary-700"
        >
          {showForm ? "Cancel" : "+ Add"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-lg shadow-sm border">
          <div className="text-xl font-bold">{restaurants.length}</div>
          <div className="text-gray-500 text-xs">Total</div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border">
          <div className="text-xl font-bold text-green-600">{activeRestaurants.length}</div>
          <div className="text-gray-500 text-xs">Active</div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border">
          <div className="text-xl font-bold text-gray-600">{inactiveRestaurants.length}</div>
          <div className="text-gray-500 text-xs">Inactive</div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border">
          <div className="text-xl font-bold">{restaurants.length}</div>
          <div className="text-gray-500 text-xs">Locations</div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm border grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Restaurant Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Location/Address"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Cuisine Type"
            value={form.cuisine}
            onChange={(e) => setForm({ ...form, cuisine: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Delivery Fee (ETB)"
            value={form.deliveryFee}
            onChange={(e) => setForm({ ...form, deliveryFee: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Delivery Time (min)"
            value={form.deliveryTime}
            onChange={(e) => setForm({ ...form, deliveryTime: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Min Order (ETB)"
            value={form.minOrder}
            onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
            className="border p-2 rounded"
          />
          <div className="flex gap-2">
            <input
              type="time"
              value={form.openTime}
              onChange={(e) => setForm({ ...form, openTime: e.target.value })}
              className="border p-2 rounded flex-1"
            />
            <input
              type="time"
              value={form.closeTime}
              onChange={(e) => setForm({ ...form, closeTime: e.target.value })}
              className="border p-2 rounded flex-1"
            />
          </div>
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border p-2 rounded md:col-span-2 lg:col-span-3"
            rows={2}
          />
          <div className="md:col-span-2 lg:col-span-3 flex gap-2">
            <button type="submit" className="bg-primary-600 text-white px-6 py-2 rounded">
              {editId ? "Update" : "Add"} Restaurant
            </button>
            {editId && (
              <button type="button" onClick={resetForm} className="text-gray-600 px-6 py-2">
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {restaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            className={`bg-white p-4 rounded shadow border-l-4 ${restaurant.isActive ? "border-green-500" : "border-gray-300"
              }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-xl font-bold">{restaurant.name}</h3>
                <p className="text-sm text-gray-600">{restaurant.cuisine}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${restaurant.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}>
                {restaurant.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="text-sm text-gray-600 space-y-1 mb-3">
              <div>📍 {restaurant.location || "No address"}</div>
              <div>📞 {restaurant.phone || "No phone"}</div>
              <div>🕐 {restaurant.openTime} - {restaurant.closeTime}</div>
              <div>🚚 Delivery: ETB {restaurant.deliveryFee || 0} ({restaurant.deliveryTime || 30} min)</div>
              <div>🛒 Min Order: ETB {restaurant.minOrder || 0}</div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => toggleActive(restaurant)}
                className={`flex-1 py-1 rounded text-sm ${restaurant.isActive
                    ? "bg-yellow-500 text-white"
                    : "bg-green-500 text-white"
                  }`}
              >
                {restaurant.isActive ? "Deactivate" : "Activate"}
              </button>
              <button
                onClick={() => handleEdit(restaurant)}
                className="flex-1 bg-primary-500 text-white py-1 rounded text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => deleteRestaurant(restaurant.id)}
                className="flex-1 bg-red-500 text-white py-1 rounded text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {restaurants.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">🏪</div>
          <div className="text-xl">No restaurants yet</div>
          <div>Add your first restaurant to get started</div>
        </div>
      )}
    </div>
  );
};

export default RestaurantsPage;
