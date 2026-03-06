import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import { 
  FiUsers, 
  FiShoppingBag, 
  FiDollarSign, 
  FiTrendingUp, 
  FiSearch, 
  FiStar, 
  FiAward,
  FiMail,
  FiPhone,
  FiCalendar
} from "react-icons/fi";

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("points");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubUsers = onSnapshot(
      query(collection(db, "users"), orderBy("loyaltyPoints", "desc")),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCustomers(data);
        setLoading(false);
      }
    );

    const unsubOrders = onSnapshot(
      query(collection(db, "orders"), orderBy("timestamp", "desc")),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(data);
      }
    );

    return () => {
      unsubUsers();
      unsubOrders();
    };
  }, []);

  const getCustomerStats = (userId) => {
    const customerOrders = orders.filter((o) => o.userId === userId);
    const totalSpent = customerOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    return {
      orderCount: customerOrders.length,
      totalSpent,
      avgOrder: customerOrders.length > 0 ? totalSpent / customerOrders.length : 0,
    };
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case "Platinum":
        return "from-gray-400 to-gray-500";
      case "Gold":
        return "from-yellow-400 to-yellow-500";
      case "Silver":
        return "from-gray-300 to-gray-400";
      default:
        return "from-orange-400 to-orange-500";
    }
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case "Platinum":
        return "👑";
      case "Gold":
        return "🏆";
      case "Silver":
        return "🥈";
      default:
        return "🥉";
    }
  };

  const filteredCustomers = customers
    .filter((c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "points") return (b.loyaltyPoints || 0) - (a.loyaltyPoints || 0);
      if (sortBy === "orders") return getCustomerStats(b.id).orderCount - getCustomerStats(a.id).orderCount;
      if (sortBy === "spent") return getCustomerStats(b.id).totalSpent - getCustomerStats(a.id).totalSpent;
      return 0;
    });

  const totalCustomers = customers.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const totalPoints = customers.reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
        <p className="text-gray-600 font-medium">Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="page-container space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Customer Insights</h1>
        <p className="mt-1 text-sm text-gray-600">Analyze customer behavior and loyalty</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Customers"
          value={totalCustomers}
          icon={<FiUsers className="w-5 h-5" />}
          gradient="from-primary-500 to-orange-600"
        />
        <StatCard
          title="Revenue"
          value={`ETB ${totalRevenue.toFixed(0)}`}
          icon={<FiDollarSign className="w-5 h-5" />}
          gradient="from-green-500 to-green-600"
        />
        <StatCard
          title="Avg Order"
          value={`ETB ${avgOrderValue.toFixed(0)}`}
          icon={<FiTrendingUp className="w-5 h-5" />}
          gradient="from-purple-500 to-purple-600"
        />
        <StatCard
          title="Points"
          value={totalPoints.toLocaleString()}
          icon={<FiAward className="w-5 h-5" />}
          gradient="from-amber-500 to-amber-600"
        />
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg shadow-sm border p-3">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search customers by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-medium"
          >
            <option value="points">Sort by Points</option>
            <option value="orders">Sort by Orders</option>
            <option value="spent">Sort by Total Spent</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Preferences
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.map((customer) => {
                const stats = getCustomerStats(customer.id);
                return (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                          {customer.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {customer.name || "Unknown"}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <FiMail className="w-3 h-3" />
                            {customer.email}
                          </div>
                          {customer.phone && (
                            <div className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                              <FiPhone className="w-3 h-3" />
                              {customer.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r ${getTierColor(customer.loyaltyTier)} text-white shadow-sm`}>
                        <span className="text-base">{getTierIcon(customer.loyaltyTier)}</span>
                        {customer.loyaltyTier || "Bronze"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <FiStar className="w-4 h-4 text-yellow-500" />
                        <span className="font-mono font-bold text-gray-900">
                          {customer.loyaltyPoints || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <FiShoppingBag className="w-4 h-4 text-primary-500" />
                        <span className="font-semibold text-gray-900">{stats.orderCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-mono font-semibold text-gray-900">
                        ETB {stats.totalSpent.toFixed(0)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Avg: ETB {stats.avgOrder.toFixed(0)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {customer.dietaryPreferences?.slice(0, 2).map((pref, i) => (
                          <span key={i} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                            {pref}
                          </span>
                        ))}
                        {customer.allergies?.slice(0, 2).map((allergy, i) => (
                          <span key={i} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                            {allergy}
                          </span>
                        ))}
                        {(!customer.dietaryPreferences && !customer.allergies) && (
                          <span className="text-gray-400 text-sm">None</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

function StatCard({ title, value, icon, gradient }) {
  return (
    <div className="relative bg-white rounded-lg shadow-sm border overflow-hidden group hover:shadow transition-shadow">
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient} shadow`}>
            <div className="text-white">{icon}</div>
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 mb-0.5">{title}</p>
          <p className="text-lg font-bold text-gray-900">{value}</p>
        </div>
      </div>
      <div className={`h-1 bg-gradient-to-r ${gradient}`}></div>
    </div>
  );
}

export default CustomersPage;
