import React, { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import { FiSave, FiSettings, FiClock, FiDollarSign, FiTruck, FiMail, FiPhone, FiMapPin, FiImage, FiBell } from "react-icons/fi";

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    restaurantName: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    logo: "",
    openingHours: {
      monday: { open: "06:00", close: "22:00", closed: false },
      tuesday: { open: "06:00", close: "22:00", closed: false },
      wednesday: { open: "06:00", close: "22:00", closed: false },
      thursday: { open: "06:00", close: "22:00", closed: false },
      friday: { open: "06:00", close: "22:00", closed: false },
      saturday: { open: "06:00", close: "22:00", closed: false },
      sunday: { open: "06:00", close: "22:00", closed: false },
    },
    taxRate: 15,
    serviceCharge: 0,
    deliveryFee: 50,
    minDeliveryOrder: 100,
    deliveryRadius: 10,
    enableDelivery: true,
    enablePickup: true,
    enableReservations: true,
    maxGuestsPerReservation: 10,
    reservationSlotDuration: 90,
    loyaltyPointsPerETB: 1,
    loyaltyPointsRedeemRate: 100,
    smsNotifications: true,
    emailNotifications: true,
    pushNotifications: true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "settings", "general"), (doc) => {
      if (doc.exists()) {
        setSettings((prev) => ({ ...prev, ...doc.data() }));
      }
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (section, field, value) => {
    if (section) {
      setSettings((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    } else {
      setSettings((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, "settings", "general"), settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Error saving settings:", err);
    }
    setSaving(false);
  };

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  const tabs = [
    { id: "general", label: "General", icon: FiSettings },
    { id: "hours", label: "Opening Hours", icon: FiClock },
    { id: "orders", label: "Orders & Delivery", icon: FiTruck },
    { id: "reservations", label: "Reservations", icon: FiClock },
    { id: "loyalty", label: "Loyalty", icon: FiDollarSign },
    { id: "notifications", label: "Notifications", icon: FiBell },
  ];

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-600">Configure your restaurant</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50"
        >
          <FiSave className="mr-2" />
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="flex gap-4">
        {/* Tabs */}
        <div className="w-48 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left ${
                  activeTab === tab.id
                    ? "bg-primary-50 text-primary-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          {activeTab === "general" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">General Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
                  <input
                    type="text"
                    value={settings.restaurantName}
                    onChange={(e) => handleChange(null, "restaurantName", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => handleChange(null, "phone", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleChange(null, "email", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) => handleChange(null, "address", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={settings.description}
                    onChange={(e) => handleChange(null, "description", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "hours" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Opening Hours</h2>
              <div className="space-y-2">
                {days.map((day) => (
                  <div key={day} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-28 font-medium text-sm capitalize text-gray-700">{day}</div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!settings.openingHours[day].closed}
                        onChange={(e) => handleChange("openingHours", day, { ...settings.openingHours[day], closed: !e.target.checked })}
                        className="w-4 h-4 text-primary-600 rounded"
                      />
                      <span className="text-sm text-gray-600">Open</span>
                    </label>
                    {!settings.openingHours[day].closed && (
                      <>
                        <input
                          type="time"
                          value={settings.openingHours[day].open}
                          onChange={(e) => handleChange("openingHours", day, { ...settings.openingHours[day], open: e.target.value })}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <span className="text-gray-400">to</span>
                        <input
                          type="time"
                          value={settings.openingHours[day].close}
                          onChange={(e) => handleChange("openingHours", day, { ...settings.openingHours[day], close: e.target.value })}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Order & Delivery Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    value={settings.taxRate}
                    onChange={(e) => handleChange(null, "taxRate", parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Charge (%)</label>
                  <input
                    type="number"
                    value={settings.serviceCharge}
                    onChange={(e) => handleChange(null, "serviceCharge", parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Fee (ETB)</label>
                  <input
                    type="number"
                    value={settings.deliveryFee}
                    onChange={(e) => handleChange(null, "deliveryFee", parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Delivery Order (ETB)</label>
                  <input
                    type="number"
                    value={settings.minDeliveryOrder}
                    onChange={(e) => handleChange(null, "minDeliveryOrder", parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Radius (km)</label>
                  <input
                    type="number"
                    value={settings.deliveryRadius}
                    onChange={(e) => handleChange(null, "deliveryRadius", parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.enableDelivery}
                      onChange={(e) => handleChange(null, "enableDelivery", e.target.checked)}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Enable Delivery</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.enablePickup}
                      onChange={(e) => handleChange(null, "enablePickup", e.target.checked)}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Enable Pickup</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reservations" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Reservation Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Guests Per Reservation</label>
                  <input
                    type="number"
                    value={settings.maxGuestsPerReservation}
                    onChange={(e) => handleChange(null, "maxGuestsPerReservation", parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slot Duration (minutes)</label>
                  <select
                    value={settings.reservationSlotDuration}
                    onChange={(e) => handleChange(null, "reservationSlotDuration", parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                    <option value={120}>120 minutes</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.enableReservations}
                      onChange={(e) => handleChange(null, "enableReservations", e.target.checked)}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Enable Reservations</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === "loyalty" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Loyalty Program Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Points Per ETB Spent</label>
                  <input
                    type="number"
                    value={settings.loyaltyPointsPerETB}
                    onChange={(e) => handleChange(null, "loyaltyPointsPerETB", parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Points to Redeem (100 = ETB 1)</label>
                  <input
                    type="number"
                    value={settings.loyaltyPointsRedeemRate}
                    onChange={(e) => handleChange(null, "loyaltyPointsRedeemRate", parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Notification Settings</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={settings.smsNotifications}
                    onChange={(e) => handleChange(null, "smsNotifications", e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">SMS Notifications</span>
                    <p className="text-xs text-gray-500">Send order updates via SMS</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => handleChange(null, "emailNotifications", e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Email Notifications</span>
                    <p className="text-xs text-gray-500">Send order confirmations via email</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={settings.pushNotifications}
                    onChange={(e) => handleChange(null, "pushNotifications", e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Push Notifications</span>
                    <p className="text-xs text-gray-500">Send push notifications to mobile app</p>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
