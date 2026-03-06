import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:ogaden_mobile/screens/reservation/reservation_success_screen.dart';
import 'package:provider/provider.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'providers/cart_provider.dart';
import 'providers/favorite_provider.dart';
import 'providers/user_profile_provider.dart';
import 'providers/theme_provider.dart';
import 'providers/restaurant_provider.dart';
import 'l10n/app_localizations.dart';

// Screens
import 'screens/auth/login_screen.dart';
import 'screens/home/home_screen.dart';
import 'screens/shell/app_shell.dart';
import 'screens/reservation/reservation_screen.dart';
import 'screens/profile/profile_screen.dart';
import 'screens/order_history/order_history_screen.dart';
import 'screens/favorites/favorites_screen.dart';
import 'screens/loyalty/loyalty_screen.dart';
import 'screens/order/scheduled_orders_screen.dart';
import 'screens/order/delivery_tracking_screen.dart';
import 'screens/order/reorder_screen.dart';
import 'screens/profile/dietary_preferences_screen.dart';
import 'screens/chat/chat_screen.dart';
import 'screens/qr/qr_scan_screen.dart';
import 'screens/gift_card/gift_card_screen.dart';
import 'screens/notifications/notifications_screen.dart';
import 'screens/menu/menu_item_details_screen.dart';
import 'screens/referral/referral_screen.dart';

final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
    FlutterLocalNotificationsPlugin();

Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  print("🔔 Background message: ${message.notification?.title}");
}

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: ".env");

  if (kIsWeb) {
    final apiKey = dotenv.env['FIREBASE_API_KEY'] ?? dotenv.env['API_KEY'];
    final authDomain = dotenv.env['FIREBASE_AUTH_DOMAIN'] ?? dotenv.env['AUTH_DOMAIN'];
    final projectId = dotenv.env['FIREBASE_PROJECT_ID'] ?? dotenv.env['PROJECT_ID'];
    final storageBucket = dotenv.env['FIREBASE_STORAGE_BUCKET'] ?? dotenv.env['STORAGE_BUCKET'];
    final messagingSenderId = dotenv.env['FIREBASE_MESSAGING_SENDER_ID'] ?? dotenv.env['MESSAGING_SENDER_ID'];
    final appId = dotenv.env['FIREBASE_APP_ID'] ?? dotenv.env['APP_ID'];

    if (apiKey == null || projectId == null || messagingSenderId == null || appId == null) {
      throw Exception('Missing required Firebase env vars');
    }

    await Firebase.initializeApp(
      options: FirebaseOptions(
        apiKey: apiKey,
        authDomain: authDomain,
        projectId: projectId,
        storageBucket: storageBucket,
        messagingSenderId: messagingSenderId,
        appId: appId,
      ),
    );
  } else {
    await Firebase.initializeApp();
  }

  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

  const AndroidInitializationSettings androidInitSettings =
      AndroidInitializationSettings('@mipmap/ic_launcher');
  const InitializationSettings initSettings = InitializationSettings(
    android: androidInitSettings,
  );
  await flutterLocalNotificationsPlugin.initialize(initSettings);

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => CartProvider()),
        ChangeNotifierProvider(create: (_) => FavoriteProvider()),
        ChangeNotifierProvider(create: (_) => UserProfileProvider()),
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => RestaurantProvider()),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});
  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  Locale _locale = const Locale('en');

  void _setLocale(Locale locale) {
    setState(() {
      _locale = locale;
    });
  }

  @override
  void initState() {
    super.initState();
    _setupFCMListeners();
    _loadUserData();
  }

  void _setupFCMListeners() async {
    final messaging = FirebaseMessaging.instance;
    await messaging.requestPermission();

    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      final notification = message.notification;
      final android = message.notification?.android;

      if (notification != null && android != null) {
        flutterLocalNotificationsPlugin.show(
          notification.hashCode,
          notification.title,
          notification.body,
          const NotificationDetails(
            android: AndroidNotificationDetails(
              'ogaden_channel',
              'Order Updates',
              importance: Importance.max,
              priority: Priority.high,
            ),
          ),
        );
      }
    });
  }

  void _loadUserData() {
    final user = FirebaseAuth.instance.currentUser;
    if (user != null && mounted) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (context.mounted) {
          context.read<FavoriteProvider>().loadFavorites(user.uid);
          context.read<UserProfileProvider>().loadProfile(user.uid);
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final themeProvider = context.watch<ThemeProvider>();
    
    return MaterialApp(
      title: 'Ogaden App',
      debugShowCheckedModeBanner: false,
      locale: _locale,
      supportedLocales: AppLocalizations.supportedLocales,
      localizationsDelegates: [
        AppLocalizations.delegate,
      ],
      theme: ThemeProvider.lightTheme,
      darkTheme: ThemeProvider.darkTheme,
      themeMode: themeProvider.themeMode,
      builder: (context, child) {
        final isDesktop = MediaQuery.of(context).size.width > 600;
        
        if (!isDesktop) {
          return child!;
        }
        
        // For web/desktop, show a "mobile phone" constrained frame in the center
        return Scaffold(
          backgroundColor: Colors.grey[200],
          body: Center(
            child: Container(
              width: 400, // Mobile device width
              height: MediaQuery.of(context).size.height,
              clipBehavior: Clip.antiAlias,
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 30,
                    spreadRadius: 5,
                  ),
                ],
              ),
              child: child!,
            ),
          ),
        );
      },
      home: const RootScreen(),
      routes: {
        '/home': (context) => const HomeScreen(),
        '/login': (context) => const LoginScreen(),
        '/reservation': (context) => const ReservationScreen(),
        '/reservation-success': (context) => const ReservationSuccessScreen(),
        '/profile': (context) => const ProfileScreen(),
        '/order-history': (context) => const OrderHistoryScreen(),
        '/favorites': (context) => const FavoritesScreen(),
        '/loyalty': (context) => const LoyaltyScreen(),
        '/scheduled-orders': (context) => const ScheduledOrdersScreen(),
        '/dietary-preferences': (context) => const DietaryPreferencesScreen(),
        '/delivery-tracking': (context) => const DeliveryTrackingScreen(orderId: ''),
        '/reorder': (context) => const ReorderScreen(),
        '/chat': (context) => const ChatScreen(),
        '/qr-scan': (context) => const QRScanScreen(),
        '/gift-cards': (context) => const GiftCardScreen(),
        '/notifications': (context) => const NotificationsScreen(),
        '/menu-item-details': (context, {Object? arguments}) {
          final menuItemId = arguments as String? ?? '';
          return MenuItemDetailsScreen(menuItemId: menuItemId);
        },
        '/referral': (context) => const ReferralScreen(),
      },
    );
  }
}

class RootScreen extends StatelessWidget {
  const RootScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<User?>(
      stream: FirebaseAuth.instance.authStateChanges(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        } else if (snapshot.hasData) {
          return const AppShell();
        } else {
          return const LoginScreen();
        }
      },
    );
  }
}
