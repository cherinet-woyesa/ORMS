import { db } from "../firebase";
import { collection, addDoc, updateDoc, doc, onSnapshot, serverTimestamp } from "firebase/firestore";

export const assignDriver = async (orderId, driverId, driverName, driverPhone) => {
  try {
    await updateDoc(doc(db, "orders", orderId), {
      driverId,
      driverName,
      driverPhone,
      status: 'outForDelivery',
      assignedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error assigning driver:", error);
    return { success: false, error };
  }
};

export const updateDriverLocation = async (orderId, latitude, longitude) => {
  try {
    await updateDoc(doc(db, "orderLocations", orderId), {
      orderId,
      driverLat: latitude,
      driverLng: longitude,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    // Create new location if doesn't exist
    await addDoc(collection(db, "orderLocations"), {
      orderId,
      driverLat: latitude,
      driverLng: longitude,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  }
};

export const subscribeToDriverLocation = (orderId, callback) => {
  const unsubscribe = onSnapshot(
    doc(db, "orderLocations", orderId),
    (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      }
    },
    (error) => {
      console.error("Error tracking location:", error);
    }
  );
  return unsubscribe;
};

export const getDeliveryEta = (driverLat, driverLng, destinationLat, destinationLng) => {
  // Simple distance calculation (in production, use proper routing API)
  const R = 6371; // Earth's radius in km
  const dLat = (destinationLat - driverLat) * Math.PI / 180;
  const dLon = (destinationLng - driverLng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(driverLat * Math.PI / 180) * Math.cos(destinationLat * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  // Assume average speed of 30 km/h in city
  const etaMinutes = Math.round((distance / 30) * 60);
  
  return {
    distance: distance.toFixed(1),
    etaMinutes: Math.max(etaMinutes, 1),
  };
};

// Driver check-in/check-out
export const driverCheckIn = async (driverId) => {
  await addDoc(collection(db, "driverStatus"), {
    driverId,
    status: 'online',
    checkedInAt: serverTimestamp(),
  });
};

export const driverCheckOut = async (driverId) => {
  await addDoc(collection(db, "driverStatus"), {
    driverId,
    status: 'offline',
    checkedOutAt: serverTimestamp(),
  });
};
