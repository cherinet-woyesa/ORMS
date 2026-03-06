import React, { useEffect, useState, useCallback } from "react";
import { collection, getDocs, query, orderBy, deleteDoc, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { FiUser, FiMail, FiPhone, FiShield, FiHash, FiSearch, FiEdit2, FiTrash2, FiMoreVertical, FiUserPlus, FiDownload, FiFilter, FiDatabase } from "react-icons/fi";
import { generateSampleData } from "../utils/sampleData";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', role: 'user' });
  const [generatingData, setGeneratingData] = useState(false);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    try {
      const q = query(collection(db, "users"), orderBy(sortConfig.key, sortConfig.direction));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          joinedDate: doc.data().createdAt?.toDate() || new Date()
        }));
        setUsers(data);
        setLoading(false);
      });
      return () => unsubscribe();
    } catch (err) {
      console.error("Error fetching users:", err);
      setLoading(false);
    }
  }, [sortConfig]);

  useEffect(() => {
    const cleanup = fetchUsers();
    return () => cleanup && cleanup();
  }, [fetchUsers]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const deleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteDoc(doc(db, "users", userId));
        alert("User deleted successfully");
      } catch (err) {
        console.error("Error deleting user:", err);
        alert("Failed to delete user");
      }
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
    } catch (err) {
      console.error("Error updating role:", err);
    }
  };

  const addNewUser = async () => {
    if (!newUser.email || !newUser.name) {
      alert("Please fill in required fields");
      return;
    }
    alert("User creation would be handled by Firebase Auth. Direct user creation requires Admin SDK setup.");
    setShowAddModal(false);
    setNewUser({ name: '', email: '', phone: '', role: 'user' });
  };

  const handleGenerateSampleData = async () => {
    if (window.confirm("This will add sample data (users, menu items, orders). Continue?")) {
      setGeneratingData(true);
      try {
        await generateSampleData();
        alert("Sample data generated successfully!");
      } catch (err) {
        console.error("Error:", err);
        alert("Failed to generate sample data");
      }
      setGeneratingData(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role) => {
    const base = "px-3 py-1 rounded-full text-xs font-medium";
    switch (role?.toLowerCase()) {
      case "admin":
        return `${base} bg-purple-100 text-purple-800 border border-purple-200`;
      case "manager":
        return `${base} bg-primary-100 text-primary-800 border border-primary-200`;
      case "staff":
        return `${base} bg-green-100 text-green-800 border border-green-200`;
      default:
        return `${base} bg-gray-100 text-gray-800 border border-gray-200`;
    }
  };

  const exportUsers = () => {
    const csv = [
      ['Name', 'Email', 'Phone', 'Role', 'Joined Date', 'Loyalty Points'].join(','),
      ...filteredUsers.map(u => [
        u.name || '',
        u.email || '',
        u.phone || '',
        u.role || 'user',
        u.joinedDate?.toISOString() || '',
        u.loyaltyPoints || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-600">{users.length} total users registered</p>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <button
            onClick={handleGenerateSampleData}
            disabled={generatingData}
            className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
          >
            <FiDatabase className="mr-1.5" /> {generatingData ? 'Generating...' : 'Add Sample Data'}
          </button>
          <button
            onClick={exportUsers}
            className="flex items-center px-3 py-1.5 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700"
          >
            <FiDownload className="mr-1.5" /> Export
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700"
          >
            <FiUserPlus className="mr-1.5" /> Add User
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400 w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, phone, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <select
            onChange={(e) => handleSort(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            value={sortConfig.key}
          >
            <option value="createdAt">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="loyaltyPoints">Sort by Points</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm text-center">
            <FiUser className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No users found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchTerm ? "Try adjusting your search" : "No users have registered yet. Click 'Add Sample Data' to get started."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Loyalty
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white font-bold">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {user.name || "Unnamed User"}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center">
                              <FiHash className="mr-1" /> {user.id.substring(0, 8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{user.email}</div>
                        <div className="text-xs text-gray-500">{user.phone || "No phone"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role || "user"}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                          className={`cursor-pointer rounded-full text-xs font-medium px-3 py-1 border-0 focus:ring-2 focus:ring-primary-500 ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                              user.role === 'manager' ? 'bg-primary-100 text-primary-800' :
                                user.role === 'staff' ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'
                            }`}
                        >
                          <option value="user">User</option>
                          <option value="staff">Staff</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.loyaltyPoints || 0} pts
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.loyaltyTier || "Bronze"} tier
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.joinedDate ? new Date(user.joinedDate).toLocaleDateString() : "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowModal(true);
                            }}
                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* User Detail Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">User Details</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                  {selectedUser.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
              <div className="text-center">
                <h4 className="text-lg font-bold">{selectedUser.name || "Unnamed User"}</h4>
                <p className="text-gray-500">{selectedUser.email}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500">Role</div>
                  <div className="font-semibold">{selectedUser.role || "user"}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500">Loyalty Points</div>
                  <div className="font-semibold">{selectedUser.loyaltyPoints || 0}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500">Tier</div>
                  <div className="font-semibold">{selectedUser.loyaltyTier || "Bronze"}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500">Phone</div>
                  <div className="font-semibold">{selectedUser.phone || "N/A"}</div>
                </div>
              </div>
              {selectedUser.dietaryPreferences && selectedUser.dietaryPreferences.length > 0 && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Dietary Preferences</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedUser.dietaryPreferences.map((pref, i) => (
                      <span key={i} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {pref}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Add New User</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="+251 9xx xxx xxx"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="user">User</option>
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button
                onClick={addNewUser}
                className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
