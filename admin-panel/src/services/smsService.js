import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const sendSMSNotification = async (phone, message, type = 'order') => {
  try {
    // Store notification in Firestore for logging
    await addDoc(collection(db, "sms_notifications"), {
      phone,
      message,
      type,
      status: 'sent',
      sentAt: serverTimestamp(),
    });
    
    // In production, integrate with Twilio, Firebase Cloud Messaging, or other SMS service
    // For now, we log and store in database
    console.log(`SMS to ${phone}: ${message}`);
    return { success: true };
  } catch (error) {
    console.error("SMS Error:", error);
    return { success: false, error };
  }
};

export const notifyOrderStatus = async (order, newStatus) => {
  const phone = order.customerPhone;
  if (!phone) return;
  
  const messages = {
    pending: `Your order #${order.id?.substring(0, 8)} has been received and is waiting for confirmation.`,
    confirmed: `Great! Your order #${order.id?.substring(0, 8)} has been confirmed and is being prepared.`,
    preparing: `Your order #${order.id?.substring(0, 8)} is now being prepared by our kitchen.`,
    ready: `Your order #${order.id?.substring(0, 8)} is ready! ${order.isDelivery ? 'It will be delivered soon.' : 'Please pick up at the counter.'}`,
    outForDelivery: `Your order #${order.id?.substring(0, 8)} is on its way! Track your delivery in the app.`,
    delivered: `Your order #${order.id?.substring(0, 8)} has been delivered. Enjoy your meal!`,
    cancelled: `Your order #${order.id?.substring(0, 8)} has been cancelled. Contact us for more info.`,
  };
  
  const message = messages[newStatus];
  if (message) {
    await sendSMSNotification(phone, message, 'order');
  }
};

export const notifyReservation = async (reservation, status) => {
  const phone = reservation.phone;
  if (!phone) return;
  
  const messages = {
    pending: `Your reservation for ${reservation.people} guests on ${reservation.date} at ${reservation.time} is pending confirmation.`,
    confirmed: `Your reservation for ${reservation.people} guests on ${reservation.date} at ${reservation.time} is confirmed!`,
    cancelled: `Your reservation on ${reservation.date} has been cancelled. Please contact us to reschedule.`,
  };
  
  const message = messages[status];
  if (message) {
    await sendSMSNotification(phone, message, 'reservation');
  }
};
