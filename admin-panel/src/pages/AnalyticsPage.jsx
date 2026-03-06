import React, { useEffect, useState, useCallback } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import { startOfDay, endOfDay } from "date-fns";
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
  LineChart,
  Line,
} from "recharts";
import {
  FiDollarSign,
  FiShoppingBag,
  FiTrendingUp,
  FiCalendar,
  FiAward,
  FiUsers,
  FiPackage,
  FiActivity
} from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

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
        dailyMap[dateStr] = (dailyMap[dateStr] || 0) + (data.total || 0);

        if (data.items && Array.isArray(data.items)) {
          data.items.forEach((item) => {
            const name = item.name;
            itemMap[name] = (itemMap[name] || 0) + item.quantity;

            const category = item.category || 'Uncategorized';
            categoryMap[category] = (categoryMap[category] || 0) + item.quantity;
          });
        }
      });

      setTotalSales(total);
      setTotalOrders(orderCount);

      const dailyArray = Object.keys(dailyMap).map((date) => ({
        date,
        revenue: dailyMap[date],
      }));
      setDailyData(dailyArray.sort((a, b) => new Date(a.date) - new Date(b.date)));

      const sortedItems = Object.entries(itemMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, qty]) => ({ name, quantity: qty }));
      setTopItems(sortedItems);

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

  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Insights and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => setDateRange(update)}
            placeholderText="Select date range"
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            isClearable
          />
          <button
            onClick={fetchAnalytics}
            className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium"
          >
            Apply
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary-50 mb-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
          </div>
          <p className="text-sm text-gray-600">Loading analytics...</p>
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              title="Total Sales"
              value={`ETB ${totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={<FiDollarSign className="w-4 h-4" />}
              color="primary"
            />
            <StatCard
              title="Total Orders"
              value={totalOrders}
              icon={<FiShoppingBag className="w-4 h-4" />}
              color="primary"
            />
            <StatCard
              title="Avg. Order Value"
              value={`ETB ${avgOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={<FiTrendingUp className="w-4 h-4" />}
              color="green"
            />
            <StatCard
              title="Days Analyzed"
              value={dailyData.length}
              icon={<FiCalendar className="w-4 h-4" />}
              color="amber"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Daily Revenue Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <FiActivity className="w-4 h-4 text-primary-600" />
                    Daily Revenue
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Revenue trends over time</p>
                </div>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: '#6b7280' }}
                      stroke="#e5e7eb"
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#6b7280' }}
                      stroke="#e5e7eb"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        fontSize: '12px'
                      }}
                      formatter={(value) => [`ETB ${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#E8521A"
                      strokeWidth={2}
                      dot={{ fill: '#E8521A', r: 3 }}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Categories Pie Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <FiPackage className="w-4 h-4 text-green-600" />
                  Categories Distribution
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Sales by category</p>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
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
                        border: '1px solid #e5e7eb',
                        fontSize: '12px'
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={28}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Top Items */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <FiAward className="w-4 h-4 text-yellow-600" />
                Top Menu Items
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Best selling items</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Rank</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Item Name</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Qty Sold</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Performance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {topItems.map((item, index) => {
                    const totalQuantity = topItems.reduce((sum, i) => sum + i.quantity, 0);
                    const percentage = ((item.quantity / totalQuantity) * 100).toFixed(1);

                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2.5">
                          <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                              index === 1 ? 'bg-gray-100 text-gray-700' :
                                index === 2 ? 'bg-orange-100 text-orange-700' :
                                  'bg-primary-100 text-primary-700'
                            }`}>
                            #{index + 1}
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="text-sm font-medium text-gray-900">{item.quantity} units</div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5 max-w-[100px]">
                              <div
                                className="bg-primary-500 h-1.5 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium text-gray-700 min-w-[2.5rem]">{percentage}%</span>
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

function StatCard({ title, value, icon, color }) {
  const colorClasses = {
    primary: "bg-primary-100 text-primary-600",
    green: "bg-green-100 text-green-600",
    amber: "bg-amber-100 text-amber-600",
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <div className="mt-2">
        <p className="text-xs font-medium text-gray-600">{title}</p>
        <p className="text-lg font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export default AnalyticsPage;
