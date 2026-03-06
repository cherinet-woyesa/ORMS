import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:provider/provider.dart';
import 'package:ogaden_mobile/constants/app_theme.dart';
import 'package:ogaden_mobile/providers/cart_provider.dart';
import 'package:ogaden_mobile/models/cart_item_model.dart';
import 'package:ogaden_mobile/models/menu_item_model.dart';
import 'package:ogaden_mobile/screens/cart/cart_screen.dart';
import 'package:ogaden_mobile/screens/order_history/order_history_screen.dart';
import 'package:ogaden_mobile/screens/favorites/favorites_screen.dart';
import 'package:ogaden_mobile/screens/loyalty/loyalty_screen.dart';
import 'package:ogaden_mobile/screens/reservation/reservation_screen.dart';
import 'package:ogaden_mobile/screens/menu/menu_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String searchQuery = '';
  String? selectedCategory;
  bool isLoading = true;
  List<QueryDocumentSnapshot> menuItems = [];

  final List<Map<String, dynamic>> categories = [
    {'name': 'All', 'icon': Icons.restaurant_menu_rounded},
    {'name': 'Main Course', 'icon': Icons.dinner_dining_rounded},
    {'name': 'Appetizers', 'icon': Icons.tapas_rounded},
    {'name': 'Desserts', 'icon': Icons.cake_rounded},
    {'name': 'Beverages', 'icon': Icons.local_cafe_rounded},
    {'name': 'Specials', 'icon': Icons.star_rounded},
  ];

  @override
  void initState() {
    super.initState();
    _loadMenuItems();
  }

  Future<void> _loadMenuItems() async {
    try {
      final snapshot = await FirebaseFirestore.instance
          .collection('menu')
          .where('available', isEqualTo: true)
          .limit(20)
          .get();
      setState(() {
        menuItems = snapshot.docs;
        isLoading = false;
      });
    } catch (e) {
      setState(() => isLoading = false);
    }
  }

  String get _greeting {
    final hour = TimeOfDay.now().hour;
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  String get _userName {
    final user = FirebaseAuth.instance.currentUser;
    return user?.displayName?.split(' ').first ?? 'Guest';
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          // ── Hero Banner ────────────────────────────────────────────────────
          SliverToBoxAdapter(child: _HeroBanner(
            greeting: _greeting,
            userName: _userName,
            cart: cart,
          )),

          // ── Quick Actions ──────────────────────────────────────────────────
          SliverToBoxAdapter(child: _QuickActions()),

          // ── Search Bar ─────────────────────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
              child: _SearchBar(
                onChanged: (val) => setState(() => searchQuery = val),
              ),
            ),
          ),

          // ── Section Header ─────────────────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 20, 16, 0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Popular Dishes', style: AppTextStyles.titleLarge),
                  GestureDetector(
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const MenuScreen(
                            restaurantName: 'Ogaden Restaurant'),
                      ),
                    ),
                    child: Text(
                      'See All',
                      style: AppTextStyles.labelBold
                          .copyWith(color: AppColors.primary),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── Category Chips ─────────────────────────────────────────────────
          SliverToBoxAdapter(
            child: SizedBox(
              height: 52,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                itemCount: categories.length,
                itemBuilder: (context, index) {
                  final cat = categories[index];
                  final isSelected = selectedCategory == cat['name'] ||
                      (selectedCategory == null && cat['name'] == 'All');
                  return _CategoryChip(
                    label: cat['name'],
                    icon: cat['icon'],
                    isSelected: isSelected,
                    onTap: () => setState(() {
                      selectedCategory =
                          cat['name'] == 'All' ? null : cat['name'];
                    }),
                  );
                },
              ),
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: 8)),

          // ── Dishes Grid ────────────────────────────────────────────────────
          isLoading
              ? const SliverFillRemaining(
                  child: Center(
                    child: CircularProgressIndicator(
                        color: AppColors.primary),
                  ),
                )
              : _buildFilteredMenuItems(),

          const SliverToBoxAdapter(child: SizedBox(height: 32)),
        ],
      ),

      // ── Cart FAB ───────────────────────────────────────────────────────────
      floatingActionButton: cart.items.isNotEmpty
          ? FloatingActionButton.extended(
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const CartScreen()),
              ),
              backgroundColor: AppColors.primary,
              elevation: 6,
              icon: const Icon(Icons.shopping_bag_rounded, color: Colors.white),
              label: Text(
                '${cart.items.length} item${cart.items.length == 1 ? '' : 's'}',
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            )
          : null,
    );
  }

  Widget _buildFilteredMenuItems() {
    final filteredItems = menuItems.where((doc) {
      final data = doc.data() as Map<String, dynamic>;
      final name = data['name']?.toString() ?? '';
      final matchesSearch = searchQuery.isEmpty ||
          name.toLowerCase().contains(searchQuery.toLowerCase());
      final matchesCategory =
          selectedCategory == null || data['category'] == selectedCategory;
      return matchesSearch && matchesCategory;
    }).toList();

    if (filteredItems.isEmpty) {
      return SliverFillRemaining(
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.search_off_rounded, size: 72, color: Colors.grey[300]),
              const SizedBox(height: 12),
              Text('No dishes found',
                  style: AppTextStyles.bodyMedium
                      .copyWith(fontSize: 16)),
            ],
          ),
        ),
      );
    }

    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      sliver: SliverGrid(
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          mainAxisSpacing: 14,
          crossAxisSpacing: 14,
          childAspectRatio: 0.72,
        ),
        delegate: SliverChildBuilderDelegate(
          (context, index) {
            final data =
                filteredItems[index].data() as Map<String, dynamic>;
            return _DishCard(data: data);
          },
          childCount: filteredItems.length,
        ),
      ),
    );
  }
}

// ── Hero Banner ───────────────────────────────────────────────────────────────

class _HeroBanner extends StatelessWidget {
  final String greeting;
  final String userName;
  final CartProvider cart;

  const _HeroBanner({
    required this.greeting,
    required this.userName,
    required this.cart,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: AppDecorations.heroHeader,
      padding: EdgeInsets.only(
        top: MediaQuery.of(context).padding.top + 16,
        left: 20,
        right: 20,
        bottom: 28,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Row: Logo + Cart
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.restaurant_menu_rounded,
                        color: Colors.white, size: 24),
                  ),
                  const SizedBox(width: 10),
                  const Text(
                    'Ogaden',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.5,
                    ),
                  ),
                ],
              ),
              _CartBadge(cart: cart),
            ],
          ),

          const SizedBox(height: 24),

          // Greeting
          Text(
            '$greeting, $userName! 👋',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Discover authentic Somali cuisine\nFresh, flavorful & made with love 🍽️',
            style: TextStyle(
              color: Colors.white.withOpacity(0.85),
              fontSize: 14,
              height: 1.5,
            ),
          ),

          const SizedBox(height: 20),

          // Stats row
          Row(
            children: [
              _StatChip(icon: Icons.star_rounded, label: '4.9 Rating'),
              const SizedBox(width: 12),
              _StatChip(icon: Icons.delivery_dining_rounded, label: 'Free Delivery'),
              const SizedBox(width: 12),
              _StatChip(icon: Icons.timer_rounded, label: '30 min'),
            ],
          ),
        ],
      ),
    );
  }
}

class _StatChip extends StatelessWidget {
  final IconData icon;
  final String label;

  const _StatChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.18),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.25)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: Colors.white),
          const SizedBox(width: 4),
          Text(label,
              style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}

class _CartBadge extends StatelessWidget {
  final CartProvider cart;

  const _CartBadge({required this.cart});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => const CartScreen()),
      ),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.shopping_bag_outlined,
                color: Colors.white, size: 24),
          ),
          if (cart.items.isNotEmpty)
            Positioned(
              right: -4,
              top: -4,
              child: Container(
                padding: const EdgeInsets.all(5),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                ),
                child: Text(
                  '${cart.items.length}',
                  style: const TextStyle(
                    color: AppColors.primary,
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

// ── Quick Actions ─────────────────────────────────────────────────────────────

class _QuickActions extends StatelessWidget {
  const _QuickActions();

  @override
  Widget build(BuildContext context) {
    final actions = [
      {
        'icon': Icons.receipt_long_rounded,
        'label': 'My Orders',
        'gradient': [const Color(0xFF4776E6), const Color(0xFF8E54E9)],
        'route': () => Navigator.push(context,
            MaterialPageRoute(builder: (_) => const OrderHistoryScreen())),
      },
      {
        'icon': Icons.favorite_rounded,
        'label': 'Favourites',
        'gradient': [const Color(0xFFFF416C), const Color(0xFFFF4B2B)],
        'route': () => Navigator.push(context,
            MaterialPageRoute(builder: (_) => const FavoritesScreen())),
      },
      {
        'icon': Icons.loyalty_rounded,
        'label': 'Rewards',
        'gradient': [const Color(0xFF11998E), const Color(0xFF38EF7D)],
        'route': () => Navigator.push(context,
            MaterialPageRoute(builder: (_) => const LoyaltyScreen())),
      },
      {
        'icon': Icons.calendar_month_rounded,
        'label': 'Reserve',
        'gradient': [const Color(0xFFFC4A1A), const Color(0xFFF7B733)],
        'route': () => Navigator.push(context,
            MaterialPageRoute(builder: (_) => const ReservationScreen())),
      },
    ];

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: actions.map((action) {
          return _QuickActionCard(
            icon: action['icon'] as IconData,
            label: action['label'] as String,
            gradient: action['gradient'] as List<Color>,
            onTap: action['route'] as VoidCallback,
          );
        }).toList(),
      ),
    );
  }
}

class _QuickActionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final List<Color> gradient;
  final VoidCallback onTap;

  const _QuickActionCard({
    required this.icon,
    required this.label,
    required this.gradient,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: gradient,
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: gradient.first.withOpacity(0.35),
                  blurRadius: 12,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Icon(icon, color: Colors.white, size: 30),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: AppTextStyles.bodySmall.copyWith(
              fontWeight: FontWeight.w600,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}

// ── Search Bar ────────────────────────────────────────────────────────────────

class _SearchBar extends StatelessWidget {
  final ValueChanged<String> onChanged;

  const _SearchBar({required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: TextField(
        onChanged: onChanged,
        decoration: InputDecoration(
          hintText: 'Search for dishes...',
          hintStyle: AppTextStyles.bodyMedium,
          prefixIcon: const Icon(Icons.search_rounded,
              color: AppColors.primary),
          border: InputBorder.none,
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        ),
      ),
    );
  }
}

// ── Category Chip ─────────────────────────────────────────────────────────────

class _CategoryChip extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  const _CategoryChip({
    required this.label,
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.primary : Colors.white,
            borderRadius: BorderRadius.circular(30),
            boxShadow: [
              BoxShadow(
                color: isSelected
                    ? AppColors.primary.withOpacity(0.3)
                    : Colors.black.withOpacity(0.05),
                blurRadius: 8,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                icon,
                size: 15,
                color: isSelected ? Colors.white : AppColors.textSecondary,
              ),
              const SizedBox(width: 5),
              Text(
                label,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight:
                      isSelected ? FontWeight.w700 : FontWeight.w500,
                  color:
                      isSelected ? Colors.white : AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Dish Card ─────────────────────────────────────────────────────────────────

class _DishCard extends StatelessWidget {
  final Map<String, dynamic> data;

  const _DishCard({required this.data});

  @override
  Widget build(BuildContext context) {
    final cart = context.read<CartProvider>();
    final name = data['name'] ?? 'Unknown';
    final price = (data['price'] ?? 0).toDouble();
    final imageUrl = data['imageUrl'] ?? '';
    final rating = (data['rating'] ?? 0).toDouble();

    final emojiMap = {
      'biryani': '🍛',
      'chicken': '🍗',
      'lamb': '🥩',
      'steak': '🥩',
      'vegetable': '🥗',
      'somal': '🥟',
      'juice': '🧃',
      'smoothie': '🥤',
      'lassi': '🥛',
      'fruit': '🍓',
      'dessert': '🍰',
      'cake': '🍰',
      'sharma': '🌯',
      'falafel': '🧆',
    };

    String emoji = '🍽️';
    for (var key in emojiMap.keys) {
      if (name.toLowerCase().contains(key)) {
        emoji = emojiMap[key]!;
        break;
      }
    }

    return Container(
      decoration: AppDecorations.card,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image area
          Expanded(
            flex: 5,
            child: ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
              child: Stack(
                fit: StackFit.expand,
                children: [
                  imageUrl.isNotEmpty
                      ? Image.network(
                          imageUrl,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => _emojiPlaceholder(emoji),
                        )
                      : _emojiPlaceholder(emoji),
                  // Rating badge
                  if (rating > 0)
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.6),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.star_rounded,
                                size: 12, color: Colors.amber),
                            const SizedBox(width: 3),
                            Text(
                              rating.toStringAsFixed(1),
                              style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),

          // Info area
          Expanded(
            flex: 4,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: AppTextStyles.titleMedium.copyWith(fontSize: 14),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const Spacer(),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'ETB ${price.toInt()}',
                        style: AppTextStyles.titleMedium.copyWith(
                          color: AppColors.primary,
                          fontSize: 15,
                        ),
                      ),
                      GestureDetector(
                        onTap: () {
                          final menuItem = MenuItem(
                            id: data['id'] ??
                                DateTime.now()
                                    .millisecondsSinceEpoch
                                    .toString(),
                            name: name,
                            description: data['description'] ?? '',
                            imageUrl: imageUrl,
                            price: price,
                            restaurantId: 'ogaden',
                          );
                          cart.addItem(CartItem(item: menuItem));
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('$name added to cart'),
                              backgroundColor: AppColors.primary,
                              behavior: SnackBarBehavior.floating,
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12)),
                              duration: const Duration(seconds: 1),
                            ),
                          );
                        },
                        child: Container(
                          width: 34,
                          height: 34,
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(10),
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.primary.withOpacity(0.4),
                                blurRadius: 8,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                          child: const Icon(Icons.add_rounded,
                              color: Colors.white, size: 20),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _emojiPlaceholder(String emoji) {
    return Container(
      color: const Color(0xFFFFF3ED),
      child: Center(
        child: Text(emoji, style: const TextStyle(fontSize: 42)),
      ),
    );
  }
}
