import React, { useEffect, useState, useCallback } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  startOfDay,
  endOfDay,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { FiDollarSign, FiShoppingBag, FiTrendingUp, FiCalendar, FiAward } from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AnalyticsPage = () => {
  const [totalSales, setTotalSales] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [dailyData, setDailyData] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      let ordersQuery = query(
        collection(db, "orders"),
        where("status", "==", "completed")
      );

      // Apply date filter if selected
      if (startDate && endDate) {
        ordersQuery = query(
          ordersQuery,
          orderBy("timestamp"),
          where("timestamp", ">=", startOfDay(startDate)),
          where("timestamp", "<=", endOfDay(endDate))
        );
      }

      const ordersSnap = await getDocs(ordersQuery);

      let total = 0;
      let orderCount = 0;
      const dailyMap = {};
      const itemMap = {};
      const categoryMap = {};

      ordersSnap.forEach((doc) => {
        const data = doc.data();
        total += data.total ?? 0;
        orderCount += 1;

        const dateStr = data.timestamp?.toDate().toLocaleDateString();
        dailyMap[dateStr] = (dailyMap[dateStr] || 0) + 1;

        if (data.items && Array.isArray(data.items)) {
          data.items.forEach((item) => {
            // Count items
            const name = item.name;
            itemMap[name] = (itemMap[name] || 0) + item.quantity;

            // Count categories
            const category = item.category || 'Uncategorized';
            categoryMap[category] = (categoryMap[category] || 0) + item.quantity;
          });
        }
      });

      // Set totals
      setTotalSales(total);
      setTotalOrders(orderCount);

      // Format Daily Data
      const dailyArray = Object.keys(dailyMap).map((date) => ({
        date,
        orders: dailyMap[date],
      }));
      setDailyData(dailyArray.sort((a, b) => new Date(a.date) - new Date(b.date)));

      // Format Top Items
      const sortedItems = Object.entries(itemMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, qty]) => ({ name, quantity: qty }));
      setTopItems(sortedItems);

      // Format Category Data
      const sortedCategories = Object.entries(categoryMap)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({ name, value }));
      setCategoryData(sortedCategories);

    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const StatCard = ({ title, value, icon, color }) => {
    const colorClasses = {
      purple: "bg-purple-100 text-purple-800",
      blue: "bg-blue-100 text-blue-800",
      green: "bg-green-100 text-green-800",
      yellow: "bg-yellow-100 text-yellow-800",
    };

    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className={`text-2xl font-bold ${colorClasses[color]}`}>{value}</p>
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">📊 Analytics Dashboard</h2>
        <div className="flex items-center space-x-2">
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => setDateRange(update)}
            placeholderText="Select date range"
            className="border border-gray-300 rounded-md p-2 text-sm"
            isClearable
          />
          <button
            onClick={fetchAnalytics}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
          >
            Apply
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Sales"
              value={`ETB ${totalSales.toLocaleString()}`}
              icon={<FiDollarSign size={20} />}
              color="purple"
            />
            <StatCard
              title="Total Orders"
              value={totalOrders}
              icon={<FiShoppingBag size={20} />}
              color="blue"
            />
            <StatCard
              title="Avg. Order Value"
              value={`ETB ${totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : 0}`}
              icon={<FiTrendingUp size={20} />}
              color="green"
            />
            <StatCard
              title="Days Analyzed"
              value={dailyData.length}
              icon={<FiCalendar size={20} />}
              color="yellow"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Daily Orders Chart */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">📅 Daily Orders</h3>
                {dateRange[0] && (
                  <span className="text-sm text-gray-500">
                    {dateRange[0].toLocaleDateString()} - {dateRange[1]?.toLocaleDateString() || dateRange[0].toLocaleDateString()}
                  </span>
                )}
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        fontSize: '14px'
                      }}
                    />
                    <Bar
                      dataKey="orders"
                      name="Orders"
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Categories Pie Chart */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">🍽️ Categories Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} orders`, 'Quantity']}
                      contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        fontSize: '14px'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Top Items */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FiAward className="mr-2" /> Top Menu Items
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity Ordered
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topItems.map((item, index) => {
                    const totalQuantity = topItems.reduce((sum, i) => sum + i.quantity, 0);
                    const percentage = ((item.quantity / totalQuantity) * 100).toFixed(1);
                    
                    return (
                      <tr key={index}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{index + 1}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {item.name}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                              <div
                                className="bg-purple-600 h-2.5 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500">{percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;