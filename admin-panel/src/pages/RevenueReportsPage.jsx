import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  startAt,
  endAt,
} from "firebase/firestore";
import { db } from "../firebase";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

const RevenueReportsPage = () => {
  const [orders, setOrders] = useState([]);
  const [dateRange, setDateRange] = useState("today");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let startDate = startOfDay(new Date());
    let endDate = endOfDay(new Date());

    switch (dateRange) {
      case "today":
        startDate = startOfDay(new Date());
        endDate = endOfDay(new Date());
        break;
      case "week":
        startDate = startOfDay(subDays(new Date(), 7));
        endDate = endOfDay(new Date());
        break;
      case "month":
        startDate = startOfDay(subDays(new Date(), 30));
        endDate = endOfDay(new Date());
        break;
      case "all":
        startDate = new Date(2020, 0, 1);
        endDate = endOfDay(new Date());
        break;
    }

    const q = query(
      collection(db, "orders"),
      where("timestamp", ">=", startDate),
      where("timestamp", "<=", endDate),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [dateRange]);

  const calculateStats = () => {
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const completedOrders = orders.filter((o) => o.status === "delivered" || o.status === "completed");
    const cancelledOrders = orders.filter((o) => o.status === "cancelled");
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / completedOrders.length : 0;
    const totalDiscount = orders.reduce((sum, o) => sum + (o.discount || 0), 0);
    const totalDeliveryFees = orders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);

    const ordersByStatus = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});

    const ordersByType = orders.reduce((acc, o) => {
      const type = o.orderType || "pickup";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const hourlyData = Array(24).fill(0);
    orders.forEach((o) => {
      if (o.timestamp) {
        const hour = o.timestamp.toDate?.().getHours() || 0;
        hourlyData[hour] += o.total || 0;
      }
    });

    return {
      totalRevenue,
      completedOrders: completedOrders.length,
      cancelledOrders: cancelledOrders.length,
      totalOrders,
      avgOrderValue,
      totalDiscount,
      totalDeliveryFees,
      ordersByStatus,
      ordersByType,
      hourlyData,
    };
  };

  const stats = calculateStats();

  const exportCSV = () => {
    const headers = ["Order ID", "Date", "Status", "Type", "Subtotal", "Discount", "Delivery", "Total"];
    const rows = orders.map((o) => [
      o.id,
      o.timestamp?.toDate?.().toISOString() || "",
      o.status,
      o.orderType || "pickup",
      o.subtotal || 0,
      o.discount || 0,
      o.deliveryFee || 0,
      o.total,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `revenue_report_${dateRange}_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Revenue Reports</h2>
        <button
          onClick={exportCSV}
          className="bg-primary-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-primary-700 flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {[
          { key: "today", label: "Today" },
          { key: "week", label: "This Week" },
          { key: "month", label: "This Month" },
          { key: "all", label: "All Time" }
        ].map((range) => (
          <button
            key={range.key}
            onClick={() => setDateRange(range.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${dateRange === range.key
                ? "bg-primary-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-3 text-sm text-gray-500">Loading revenue data...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">Total Revenue</div>
                  <div className="text-lg font-bold text-gray-900 mt-1">
                    ETB {stats.totalRevenue.toLocaleString()}
                  </div>
                </div>
                <div className="bg-green-100 p-2 rounded">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">Completed Orders</div>
                  <div className="text-lg font-bold text-gray-900 mt-1">
                    {stats.completedOrders}
                  </div>
                </div>
                <div className="bg-primary-100 p-2 rounded">
                  <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">Avg Order Value</div>
                  <div className="text-lg font-bold text-gray-900 mt-1">
                    ETB {stats.avgOrderValue.toLocaleString()}
                  </div>
                </div>
                <div className="bg-primary-100 p-2 rounded">
                  <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">Cancelled Orders</div>
                  <div className="text-lg font-bold text-gray-900 mt-1">
                    {stats.cancelledOrders}
                  </div>
                </div>
                <div className="bg-orange-100 p-2 rounded">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                Orders by Status
              </h3>
              <div className="space-y-2">
                {Object.entries(stats.ordersByStatus).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center">
                    <span className="capitalize text-xs font-medium">{status}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-primary-500 h-1.5 rounded-full"
                          style={{ width: `${(count / stats.totalOrders) * 100}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs text-gray-700 w-6 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                Orders by Type
              </h3>
              <div className="space-y-2">
                {Object.entries(stats.ordersByType).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="capitalize text-xs font-medium">{type}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-primary-500 h-1.5 rounded-full"
                          style={{ width: `${(count / stats.totalOrders) * 100}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs text-gray-700 w-6 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
              Revenue by Hour
            </h3>
            <div className="flex items-end gap-0.5 h-32">
              {stats.hourlyData.map((value, hour) => (
                <div key={hour} className="flex-1 flex flex-col items-center group">
                  <div
                    className="w-full bg-primary-500 rounded-t transition-all hover:bg-primary-600"
                    style={{
                      height: `${Math.max((value / Math.max(...stats.hourlyData.filter(v => v > 0), 1)) * 100, value > 0 ? 2 : 0)}%`,
                      minHeight: value > 0 ? "3px" : "0",
                    }}
                    title={`${hour}:00 - ETB ${value.toLocaleString()}`}
                  />
                  <span className="text-[10px] text-gray-400 mt-1">{hour}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Recent Transactions
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 text-left font-semibold text-gray-600">Order ID</th>
                    <th className="p-2 text-left font-semibold text-gray-600">Date</th>
                    <th className="p-2 text-left font-semibold text-gray-600">Status</th>
                    <th className="p-2 text-left font-semibold text-gray-600">Type</th>
                    <th className="p-2 text-right font-semibold text-gray-600">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 10).map((order) => (
                    <tr key={order.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="p-2 font-mono text-primary-600">
                        #{order.id.slice(-6)}
                      </td>
                      <td className="p-2 text-gray-600">
                        {order.timestamp?.toDate?.()?.toLocaleString() || "N/A"}
                      </td>
                      <td className="p-2">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${order.status === 'delivered' || order.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'cancelled'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-2 capitalize text-gray-600">{order.orderType || "pickup"}</td>
                      <td className="p-2 text-right font-medium text-gray-800">
                        ETB {order.total?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RevenueReportsPage;
