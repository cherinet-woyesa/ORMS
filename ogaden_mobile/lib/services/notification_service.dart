import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

class NotificationService {
  static final FlutterLocalNotificationsPlugin _notifications =
      FlutterLocalNotificationsPlugin();

  static const String orderChannelId = 'order_updates';
  static const String promotionChannelId = 'promotions';
  static const String generalChannelId = 'general';

  static Future<void> initialize() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const initSettings = InitializationSettings(android: androidSettings);
    await _notifications.initialize(initSettings);

    await _createNotificationChannels();
  }

  static Future<void> _createNotificationChannels() async {
    final androidPlugin = _notifications
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>();
    
    if (androidPlugin != null) {
      await androidPlugin.createNotificationChannel(
        const AndroidNotificationChannel(
          orderChannelId,
          'Order Updates',
          description: 'Notifications for order status changes',
          importance: Importance.high,
        ),
      );
      
      await androidPlugin.createNotificationChannel(
        const AndroidNotificationChannel(
          promotionChannelId,
          'Promotions',
          description: 'Special offers and promotions',
          importance: Importance.defaultImportance,
        ),
      );
    }
  }

  static Future<void> requestPermissions() async {
    await FirebaseMessaging.instance.requestPermission();
  }

  static Future<String?> getToken() async {
    return await FirebaseMessaging.instance.getToken();
  }

  static void subscribeToTopic(String topic) {
    FirebaseMessaging.instance.subscribeToTopic(topic);
  }

  static void unsubscribeFromTopic(String topic) {
    FirebaseMessaging.instance.unsubscribeFromTopic(topic);
  }

  static Future<void> showOrderNotification({
    required int id,
    required String title,
    required String body,
  }) async {
    await _notifications.show(
      id,
      title,
      body,
      NotificationDetails(
        android: AndroidNotificationDetails(
          orderChannelId,
          'Order Updates',
          importance: Importance.high,
          priority: Priority.high,
          icon: '@mipmap/ic_launcher',
        ),
      ),
    );
  }

  static Future<void> showPromotionNotification({
    required int id,
    required String title,
    required String body,
  }) async {
    await _notifications.show(
      id,
      title,
      body,
      NotificationDetails(
        android: AndroidNotificationDetails(
          promotionChannelId,
          'Promotions',
          importance: Importance.defaultImportance,
          priority: Priority.defaultPriority,
          icon: '@mipmap/ic_launcher',
        ),
      ),
    );
  }

  static void onForegroundMessage(Function(RemoteMessage) handler) {
    FirebaseMessaging.onMessage.listen(handler);
  }
}
