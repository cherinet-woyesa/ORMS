import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db, storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiImage,
  FiGrid,
  FiList,
  FiToggleLeft,
  FiToggleRight,
  FiX,
  FiCheck,
  FiStar
} from "react-icons/fi";

const CATEGORIES = [
  { id: "appetizers", name: "Appetizers", icon: "🥗", color: "from-green-500 to-green-600" },
  { id: "main-course", name: "Main Course", icon: "🍽️", color: "from-orange-500 to-orange-600" },
  { id: "desserts", name: "Desserts", icon: "🍰", color: "from-pink-500 to-pink-600" },
  { id: "beverages", name: "Beverages", icon: "🥤", color: "from-primary-500 to-orange-600" },
  { id: "specials", name: "Specials", icon: "⭐", color: "from-purple-500 to-purple-600" },
];

const MenuPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "main-course",
    image: null,
    imageUrl: "",
    available: true,
    featured: false,
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "menu"), (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMenuItems(items);
    });
    return () => unsubscribe();
  }, []);

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

    if (!form.name || !form.price) {
      alert("Name and price are required");
      setLoading(false);
      return;
    }

    try {
      const imageUrl = await handleImageUpload();

      const itemData = {
        name: form.name,
        price: parseFloat(form.price),
        description: form.description,
        category: form.category,
        imageUrl: imageUrl || "",
        available: form.available,
        featured: form.featured || false,
        updatedAt: new Date(),
      };

      if (editId) {
        await updateDoc(doc(db, "menu", editId), itemData);
      } else {
        await addDoc(collection(db, "menu"), {
          ...itemData,
          createdAt: new Date(),
        });
      }

      resetForm();
    } catch (err) {
      console.error("Error saving menu item:", err);
      alert("Failed to save menu item. Please try again.");
    }

    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      await deleteDoc(doc(db, "menu", id));
    }
  };

  const handleEdit = (item) => {
    setForm({
      name: item.name,
      price: item.price?.toString() || "",
      description: item.description || "",
      category: item.category || "main-course",
      image: null,
      imageUrl: item.imageUrl || "",
      available: item.available !== false,
      featured: item.featured || false,
    });
    setEditId(item.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleAvailability = async (item) => {
    await updateDoc(doc(db, "menu", item.id), {
      available: !item.available,
    });
  };

  const resetForm = () => {
    setForm({
      name: "",
      price: "",
      description: "",
      category: "main-course",
      image: null,
      imageUrl: "",
      available: true,
      featured: false,
    });
    setEditId(null);
    setShowForm(false);
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryStats = CATEGORIES.map(cat => ({
    ...cat,
    count: menuItems.filter(item => item.category === cat.id).length
  }));

  const totalItems = menuItems.length;
  const availableItems = menuItems.filter(item => item.available).length;
  const featuredItems = menuItems.filter(item => item.featured).length;

  const getCategoryName = (catId) => {
    return CATEGORIES.find(c => c.id === catId)?.name || catId;
  };

  const getCategoryIcon = (catId) => {
    return CATEGORIES.find(c => c.id === catId)?.icon || "🍽️";
  };

  const getCategoryColor = (catId) => {
    return CATEGORIES.find(c => c.id === catId)?.color || "from-gray-500 to-gray-600";
  };

  return (
    <div className="page-container space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Menu Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            {availableItems} of {totalItems} items available
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="mt-3 sm:mt-0 inline-flex items-center px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
        >
          {showForm ? <FiX className="mr-1" /> : <FiPlus className="mr-1" />}
          {showForm ? "Cancel" : "Add Item"}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`p-4 rounded-xl text-left transition-all hover:shadow-md ${selectedCategory === "all"
            ? "bg-gradient-to-br from-primary-600 to-orange-700 text-white shadow-lg"
            : "bg-white shadow-sm border border-gray-100"
            }`}
        >
          <p className="text-2xl font-bold">{totalItems}</p>
          <p className={`text-sm ${selectedCategory === "all" ? "text-primary-100" : "text-gray-600"}`}>
            All Items
          </p>
        </button>
        {categoryStats.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`p-4 rounded-xl text-left transition-all hover:shadow-md ${selectedCategory === cat.id
              ? `bg-gradient-to-br ${cat.color} text-white shadow-lg`
              : "bg-white shadow-sm border border-gray-100"
              }`}
          >
            <p className="text-2xl font-bold">{cat.count}</p>
            <p className={`text-sm ${selectedCategory === cat.id ? "text-white/90" : "text-gray-600"}`}>
              {cat.icon} {cat.name}
            </p>
          </button>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-slide-down">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            {editId ? <FiEdit2 className="w-5 h-5" /> : <FiPlus className="w-5 h-5" />}
            {editId ? "Edit Menu Item" : "Add New Menu Item"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Chicken Biryani"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price (ETB) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="450.00"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  placeholder="Describe the dish, ingredients, or special features..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
                {form.imageUrl && (
                  <div className="mt-2">
                    <img src={form.imageUrl} alt="Preview" className="h-20 w-20 object-cover rounded-lg" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-6 pt-6">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={form.available}
                    onChange={(e) => setForm({ ...form, available: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-gray-900">Available</span>
                </label>
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                  <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-gray-900">Featured</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiCheck className="mr-2" />
                    {editId ? "Update Item" : "Add Item"}
                  </>
                )}
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

      {/* Search & View Toggle */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2.5 rounded-lg transition-colors ${viewMode === "grid"
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              <FiGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2.5 rounded-lg transition-colors ${viewMode === "list"
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              <FiList className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <FiImage className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No menu items found</h3>
          <p className="text-sm text-gray-500">
            {searchTerm ? "Try adjusting your search" : "Add your first menu item to get started"}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md group ${!item.available ? "opacity-60" : ""
                }`}
            >
              <div className="relative h-48 bg-gray-100">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiImage className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                {item.featured && (
                  <span className="absolute top-3 left-3 bg-yellow-500 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg flex items-center gap-1">
                    <FiStar className="w-3 h-3" />
                    Featured
                  </span>
                )}
                <button
                  onClick={() => toggleAvailability(item)}
                  className={`absolute top-3 right-3 p-2 rounded-full shadow-lg transition-all ${item.available
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                    } text-white`}
                >
                  {item.available ? <FiToggleRight size={18} /> : <FiToggleLeft size={18} />}
                </button>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-900 text-lg">{item.name}</h4>
                  <span className="text-lg font-bold text-primary-600">ETB {item.price}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[2.5rem]">
                  {item.description || "No description available"}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className={`text-xs px-3 py-1.5 rounded-full font-medium bg-gradient-to-r ${getCategoryColor(item.category)} text-white`}>
                    {getCategoryIcon(item.category)} {getCategoryName(item.category)}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FiImage className="text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 flex items-center gap-2">
                            {item.name}
                            {item.featured && <FiStar className="w-4 h-4 text-yellow-500" />}
                          </p>
                          <p className="text-sm text-gray-500 truncate">{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm bg-gray-100 px-3 py-1 rounded-full font-medium">
                        {getCategoryIcon(item.category)} {getCategoryName(item.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                      ETB {item.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleAvailability(item)}
                        className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-colors ${item.available
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                          }`}
                      >
                        {item.available ? "Available" : "Unavailable"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg mr-1 transition-colors"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FiTrash2 size={16} />
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
  );
};

export default MenuPage;
