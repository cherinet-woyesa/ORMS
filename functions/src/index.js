const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

// ============ PUSH NOTIFICATIONS ============

// Send push notification when order status changes
exports.onOrderStatusChange = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    if (before.status === after.status) return null;
    
    const orderId = context.params.orderId;
    const userId = after.userId;
    
    // Get user's FCM token
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) return null;
    
    const userData = userDoc.data();
    const fcmToken = userData.fcmToken;
    
    if (!fcmToken) return null;
    
    // Build notification message
    const statusMessages = {
      'accepted': 'Your order has been accepted!',
      'preparing': 'Your order is being prepared',
      'ready': 'Your order is ready for pickup!',
      'outForDelivery': 'Your order is on the way!',
      'delivered': 'Your order has been delivered. Enjoy!',
      'cancelled': 'Your order has been cancelled'
    };
    
    const message = statusMessages[after.status] || `Order status updated to ${after.status}`;
    
    try {
      await admin.messaging().send({
        token: fcmToken,
        notification: {
          title: 'Order Update',
          body: message
        },
        data: {
          orderId: orderId,
          status: after.status
        }
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
    
    return null;
  });

// Send push notification for new order to kitchen staff
exports.onNewOrder = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const order = snap.data();
    const orderId = context.params.orderId;
    
    // Notify kitchen staff
    const staffSnapshot = await db.collection('staff')
      .where('role', 'in', ['chef', 'manager'])
      .get();
    
    const messages = [];
    
    for (const staffDoc of staffSnapshot.docs) {
      const staffData = staffDoc.data();
      if (staffData.fcmToken) {
        messages.push({
          token: staffData.fcmToken,
          notification: {
            title: 'New Order!',
            body: `Order #${orderId.slice(-6)} - ETB ${order.total}`
          },
          data: {
            orderId: orderId
          }
        });
      }
    }
    
    if (messages.length > 0) {
      try {
        await admin.messaging().sendAll(messages);
      } catch (error) {
        console.error('Error sending notifications to staff:', error);
      }
    }
    
    return null;
  });

// Send push notification for new reservation
exports.onNewReservation = functions.firestore
  .document('reservations/{reservationId}')
  .onCreate(async (snap, context) => {
    const reservation = snap.data();
    
    // Notify staff
    const staffSnapshot = await db.collection('staff')
      .where('role', 'in', ['manager', 'staff'])
      .get();
    
    const messages = [];
    
    for (const staffDoc of staffSnapshot.docs) {
      const staffData = staffDoc.data();
      if (staffData.fcmToken) {
        messages.push({
          token: staffData.fcmToken,
          notification: {
            title: 'New Reservation',
            body: `${reservation.name} - ${reservation.guests} guests`
          }
        });
      }
    }
    
    if (messages.length > 0) {
      try {
        await admin.messaging().sendAll(messages);
      } catch (error) {
        console.error('Error sending reservation notification:', error);
      }
    }
    
    return null;
  });

// Driver location update (real-time)
exports.onDriverLocationUpdate = functions.firestore
  .document('driverLocations/{driverId}')
  .onUpdate(async (change, context) => {
    const driverId = context.params.driverId;
    const location = change.after.data();
    
    // Get active delivery orders for this driver
    const ordersSnapshot = await db.collection('orders')
      .where('driverId', '==', driverId)
      .where('status', '==', 'outForDelivery')
      .get();
    
    // Notify user about driver location
    for (const orderDoc of ordersSnapshot.docs) {
      const order = orderDoc.data();
      const userDoc = await db.collection('users').doc(order.userId).get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        if (userData.fcmToken) {
          try {
            await admin.messaging().send({
              token: userData.fcmToken,
              notification: {
                title: 'Driver Update',
                body: `Your driver is nearby!`
              },
              data: {
                driverId: driverId,
                orderId: orderDoc.id
              }
            });
          } catch (error) {
            console.error('Error notifying user:', error);
          }
        }
      }
    }
    
    return null;
  });

// ============ SCHEDULED NOTIFICATIONS ============

// Daily summary to admin
exports.dailySummary = functions.pubsub
  .schedule('0 9 * * *')
  .timeZone('Africa/Addis_Ababa')
  .onRun(async (context) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get today's orders
    const ordersSnapshot = await db.collection('orders')
      .where('timestamp', '>=', today)
      .get();
    
    let totalRevenue = 0;
    let orderCount = 0;
    
    for (const doc of ordersSnapshot.docs) {
      const order = doc.data();
      if (order.status !== 'cancelled') {
        totalRevenue += order.total || 0;
        orderCount++;
      }
    }
    
    // Get reservations
    const reservationsSnapshot = await db.collection('reservations')
      .where('date', '>=', today)
      .get();
    
    // Notify admin
    const adminSnapshot = await db.collection('staff')
      .where('role', '==', 'admin')
      .get();
    
    for (const adminDoc of adminSnapshot.docs) {
      const adminData = adminDoc.data();
      if (adminData.fcmToken) {
        try {
          await admin.messaging().send({
            token: adminData.fcmToken,
            notification: {
              title: 'Daily Summary',
              body: `Today: ${orderCount} orders, ETB ${totalRevenue.toLocaleString()} revenue`
            }
          });
        } catch (error) {
          console.error('Error sending daily summary:', error);
        }
      }
    }
    
    return null;
  });

// ============ HTTP ENDPOINTS ============

// Send SMS notification (requires Twilio configuration)
exports.sendSMS = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be authenticated to send SMS'
    );
  }
  
  const { phone, message } = data;
  
  if (!phone || !message) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Phone and message are required'
    );
  }
  
  // Check if user is staff
  const staffDoc = await db.collection('staff').doc(context.auth.uid).get();
  if (!staffDoc.exists) {
    const userDoc = await db.collection('users').doc(context.auth.uid).get();
    if (!userDoc.exists || !userData.isAdmin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only staff can send SMS'
      );
    }
  }
  
  // Twilio configuration (set in Firebase config)
  const accountSid = functions.config().twilio?.sid;
  const authToken = functions.config().twilio?.token;
  const twilioPhone = functions.config().twilio?.phone;
  
  if (!accountSid || !authToken || !twilioPhone) {
    // Fallback: just log the SMS
    console.log(`SMS to ${phone}: ${message}`);
    return { success: true, fallback: true };
  }
  
  try {
    const twilio = require('twilio')(accountSid, authToken);
    await twilio.messages.create({
      body: message,
      from: twilioPhone,
      to: phone
    });
    return { success: true };
  } catch (error) {
    console.error('Twilio error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send SMS');
  }
});

// Register FCM token
exports.registerFCMToken = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be authenticated'
    );
  }
  
  const { token, role } = data;
  
  if (!token) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Token is required'
    );
  }
  
  // Save token to appropriate collection
  if (role === 'driver' || role === 'staff' || role === 'admin' || role === 'manager') {
    await db.collection('staff').doc(context.auth.uid).update({
      fcmToken: token,
      lastActive: admin.firestore.FieldValue.serverTimestamp()
    });
  } else {
    await db.collection('users').doc(context.auth.uid).update({
      fcmToken: token
    });
  }
  
  return { success: true };
});
