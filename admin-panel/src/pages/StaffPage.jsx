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
import { FiUser, FiMail, FiPhone, FiClock, FiDollarSign, FiSearch, FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiCalendar } from "react-icons/fi";

const StaffPage = () => {
  const [staff, setStaff] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "staff",
    salary: "",
    shift: "morning",
    schedule: "9-5",
  });
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "staff"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStaff(data);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const staffData = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      role: form.role,
      salary: parseFloat(form.salary) || 0,
      shift: form.shift,
      schedule: form.schedule,
      active: true,
      createdAt: new Date(),
    };

    try {
      if (editId) {
        await updateDoc(doc(db, "staff", editId), staffData);
      } else {
        await addDoc(collection(db, "staff"), staffData);
      }
      resetForm();
    } catch (err) {
      console.error("Error saving staff:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this staff member?")) {
      await deleteDoc(doc(db, "staff", id));
    }
  };

  const handleEdit = (member) => {
    setForm({
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role,
      salary: member.salary?.toString() || "",
      shift: member.shift || "morning",
      schedule: member.schedule || "9-5",
    });
    setEditId(member.id);
    setShowForm(true);
  };

  const toggleActive = async (member) => {
    await updateDoc(doc(db, "staff", member.id), {
      active: !member.active,
    });
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      role: "staff",
      salary: "",
      shift: "morning",
      schedule: "9-5",
    });
    setEditId(null);
    setShowForm(false);
  };

  const getRoleBadge = (role) => {
    const roles = {
      admin: { bg: "bg-purple-100 text-purple-800", icon: "👑" },
      manager: { bg: "bg-primary-100 text-primary-800", icon: "🎯" },
      chef: { bg: "bg-orange-100 text-orange-800", icon: "👨‍🍳" },
      driver: { bg: "bg-green-100 text-green-800", icon: "🚗" },
      waiter: { bg: "bg-pink-100 text-pink-800", icon: "🍽️" },
      staff: { bg: "bg-gray-100 text-gray-800", icon: "👤" },
    };
    const r = roles[role] || roles.staff;
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${r.bg}`}>
        {r.icon} {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  const getShiftBadge = (shift) => {
    const shifts = {
      morning: { bg: "bg-yellow-100 text-yellow-800", time: "6AM - 2PM" },
      afternoon: { bg: "bg-orange-100 text-orange-800", time: "2PM - 10PM" },
      night: { bg: "bg-indigo-100 text-indigo-800", time: "10PM - 6AM" },
    };
    const s = shifts[shift] || shifts.morning;
    return (
      <span className={`px-2 py-1 rounded text-xs ${s.bg}`}>
        {s.time}
      </span>
    );
  };

  const filteredStaff = staff.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const staffByRole = staff.reduce((acc, s) => {
    acc[s.role] = (acc[s.role] || 0) + 1;
    return acc;
  }, {});

  const activeStaff = staff.filter(s => s.active).length;
  const totalSalary = staff.reduce((sum, s) => sum + (s.salary || 0), 0);

  return (
    <div className="page-container space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-sm text-gray-600">Manage team members and shifts</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="mt-3 md:mt-0 flex items-center px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
        >
          <FiPlus className="mr-1" />
          {showForm ? "Cancel" : "Add Staff"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-primary-500 to-orange-600 rounded-lg p-3 text-white">
          <p className="text-primary-100 text-xs">Total Staff</p>
          <p className="text-xl font-bold">{staff.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 text-white">
          <p className="text-green-100 text-xs">Active</p>
          <p className="text-xl font-bold">{activeStaff}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 text-white">
          <p className="text-purple-100 text-xs">Roles</p>
          <p className="text-xl font-bold">{Object.keys(staffByRole).length}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-3 text-white">
          <p className="text-orange-100 text-xs">Salary</p>
          <p className="text-xl font-bold">ETB {(totalSalary / 1000).toFixed(1)}K</p>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-base font-semibold mb-3">{editId ? "Edit Staff" : "Add New Staff"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                placeholder="+251 9xx xxx xxx"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="chef">Chef</option>
                <option value="waiter">Waiter</option>
                <option value="driver">Driver</option>
                <option value="staff">Staff</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
              <select
                value={form.shift}
                onChange={(e) => setForm({ ...form, shift: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="morning">Morning (6AM - 2PM)</option>
                <option value="afternoon">Afternoon (2PM - 10PM)</option>
                <option value="night">Night (10PM - 6AM)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Salary (ETB)</label>
              <input
                type="number"
                placeholder="5000"
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">
              {editId ? "Update" : "Add"} Staff
            </button>
            {editId && (
              <button type="button" onClick={resetForm} className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg shadow-sm p-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredStaff.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg p-6 text-center">
            <FiUser className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-medium text-gray-900">No staff found</h3>
            <p className="text-sm text-gray-500">Add your first team member</p>
          </div>
        ) : (
          filteredStaff.map((member) => (
            <div key={member.id} className={`bg-white rounded-lg shadow-sm border overflow-hidden ${member.active ? "" : "opacity-75"}`}>
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-orange-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                      {member.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{member.name}</h3>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                  </div>
                  <button onClick={() => toggleActive(member)} className={`p-1 rounded-full ${member.active ? 'text-green-600' : 'text-gray-400'}`}>
                    {member.active ? <FiToggleRight size={24} /> : <FiToggleLeft size={24} />}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {getRoleBadge(member.role)}
                  {getShiftBadge(member.shift)}
                </div>
                <div className="space-y-1 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-2">
                    <FiPhone className="text-gray-400" />
                    <span>{member.phone || "No phone"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiClock className="text-gray-400" />
                    <span>{member.schedule || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiDollarSign className="text-gray-400" />
                    <span>ETB {(member.salary || 0).toLocaleString()}/month</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button onClick={() => handleEdit(member)} className="flex-1 flex items-center justify-center gap-1 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 text-sm font-medium">
                    <FiEdit2 size={16} /> Edit
                  </button>
                  <button onClick={() => handleDelete(member.id)} className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium">
                    <FiTrash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StaffPage;
