import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const QRGeneratorScreen = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      const snapshot = await getDocs(collection(db, "restaurants"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRestaurants(data);
      if (data.length > 0) {
        setSelectedRestaurant(data[0]);
      }
    };
    fetchRestaurants();
  }, []);

  return (
    <div className="page-container">
      <h2 className="text-xl font-bold mb-4 text-gray-800">QR Code Generator</h2>

      {restaurants.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-3xl mb-3">🍽️</div>
          <div className="text-base">No restaurants found</div>
          <p className="text-sm">Add a restaurant first to generate QR codes</p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700">Select Restaurant</label>
            <select
              className="input-field max-w-md"
              onChange={(e) => {
                const restaurant = restaurants.find((r) => r.id === e.target.value);
                setSelectedRestaurant(restaurant);
              }}
              value={selectedRestaurant?.id || ""}
            >
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {selectedRestaurant && (
            <div className="flex flex-col items-center">
              <div className="card p-8 inline-block">
                <div className="text-center mb-4">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=restaurant_${selectedRestaurant.id}`}
                    alt="QR Code"
                    className="w-64 h-64"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800">{selectedRestaurant.name}</h3>
                  <p className="text-gray-600">Scan to view menu</p>
                  <p className="text-sm text-gray-400 mt-2">Restaurant ID: {selectedRestaurant.id}</p>
                </div>
              </div>

              <div className="mt-8 bg-orange-50 p-4 rounded-lg max-w-lg">
                <h3 className="font-bold mb-2 text-gray-800">Instructions</h3>
                <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
                  <li>Right-click the QR code and save image</li>
                  <li>Print and place on tables or entrance</li>
                  <li>Customers scan to view menu directly</li>
                  <li>No app download required</li>
                </ul>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QRGeneratorScreen;
