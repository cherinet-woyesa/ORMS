// Twilio SMS Integration for ORMS
// To enable SMS notifications, set up your Twilio credentials in Firebase Cloud Functions config

/*
To set up Twilio:

1. Create a Twilio account at https://www.twilio.com
2. Get your Account SID, Auth Token, and Twilio phone number
3. Set the configuration in Firebase:

   firebase functions:config:set twilio.sid="your_account_sid" twilio.token="your_auth_token" twilio.phone="+1234567890"

4. Deploy the cloud functions:
   
   cd functions
   npm install
   firebase deploy --only functions

The cloud functions will then use Twilio to send SMS notifications for:
- Order status updates
- New reservations
- Delivery updates
- Custom notifications
*/

export const twilioConfig = {
  // These will be read from Firebase Cloud Functions config
  // Do not hardcode credentials here
  accountSid: null, // Set via Firebase config
  authToken: null,  // Set via Firebase config
  phoneNumber: null // Set via Firebase config
};

export const smsTemplates = {
  orderPlaced: (orderId) => 
    `Thank you for your order! Order #${orderId} has been received.`,
  
  orderConfirmed: (orderId) => 
    `Your order #${orderId} has been confirmed and will be prepared shortly.`,
  
  orderReady: (orderId, isDelivery) => 
    isDelivery 
      ? `Your order #${orderId} is ready and will be delivered soon!`
      : `Your order #${orderId} is ready for pickup!`,
  
  orderDelivered: (orderId) => 
    `Your order #${orderId} has been delivered. Enjoy your meal!`,
  
  orderCancelled: (orderId) => 
    `Your order #${orderId} has been cancelled.`,
  
  reservationConfirmed: (date, time, guests) => 
    `Your reservation for ${guests} guests on ${date} at ${time} is confirmed!`,
  
  reservationReminder: (date, time, guests) => 
    `Reminder: Your reservation for ${guests} guests is today at ${time}. See you soon!`,
  
  driverOnWay: (orderId, eta) => 
    `Your driver is on the way! ETA: ${eta} minutes. Track in app.`,
  
  loyaltyPointsEarned: (points) => 
    `You earned ${points} loyalty points! Check your rewards in the app.`,
  
  promotion: (code, discount) => 
    `Use code ${code} to get ${discount}% off your next order! Valid for a limited time.`
};
