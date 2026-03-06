import 'package:flutter/material.dart';
import '../../models/menu_item_model.dart';
import '../../widgets/menu_item_card.dart';
import 'package:provider/provider.dart';
import '../../providers/cart_provider.dart';
import '../../models/cart_item_model.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:intl/intl.dart';
import 'package:ogaden_mobile/constants/app_theme.dart';

import '../cart/cart_screen.dart';

class MenuScreen extends StatefulWidget {
  final String restaurantName;
  final String? restaurantId;

  const MenuScreen({super.key, required this.restaurantName, this.restaurantId});

  @override
  State<MenuScreen> createState() => _MenuScreenState();
}

class _MenuScreenState extends State<MenuScreen> {
  String _searchQuery = '';
  String _selectedCategory = 'All';
  List<String> _categories = ['All'];

  @override
  Widget build(BuildContext context) {
    final menuRef = widget.restaurantId != null
        ? FirebaseFirestore.instance
            .collection('menus')
            .where('restaurantId', isEqualTo: widget.restaurantId)
        : FirebaseFirestore.instance.collection('menus');

    return Scaffold(
      body: Container(
        decoration: AppDecorations.brandHeader,
        child: SafeArea(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  children: [
                    Row(
                      children: [
                        IconButton(
                          icon: const Icon(Icons.arrow_back, color: Colors.white),
                          onPressed: () => Navigator.pop(context),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            '${widget.restaurantName} Menu',
                            style: const TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ),
                        Stack(
                          children: [
                            IconButton(
                              icon: const Icon(Icons.shopping_cart, color: Colors.white),
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(builder: (_) => const CartScreen()),
                                );
                              },
                            ),
                            Positioned(
                              right: 8,
                              top: 8,
                              child: Consumer<CartProvider>(
                                builder: (context, cart, _) {
                                  if (cart.items.isEmpty) return const SizedBox();
                                  return Container(
                                    padding: const EdgeInsets.all(4),
                                    decoration: const BoxDecoration(
                                      color: Colors.red,
                                      shape: BoxShape.circle,
                                    ),
                                    child: Text(
                                      '${cart.items.length}',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  );
                                },
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: TextField(
                        onChanged: (value) => setState(() => _searchQuery = value),
                        decoration: InputDecoration(
                          hintText: "Search menu items...",
                          prefixIcon: const Icon(Icons.search, color: Colors.grey),
                          border: InputBorder.none,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      height: 40,
                      child: ListView(
                        scrollDirection: Axis.horizontal,
                        children: _categories.map((category) {
                          final isSelected = category == _selectedCategory;
                          return Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: FilterChip(
                              selected: isSelected,
                              label: Text(category),
                              labelStyle: TextStyle(
                                color: isSelected ? Colors.white : Colors.black87,
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                              ),
                              backgroundColor: Colors.white,
                              selectedColor: AppColors.primary,
                              checkmarkColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(20),
                              ),
                              onSelected: (selected) {
                                setState(() => _selectedCategory = category);
                              },
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Container(
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(30),
                      topRight: Radius.circular(30),
                    ),
                  ),
                  child: StreamBuilder<QuerySnapshot>(
                    stream: menuRef.snapshots(),
                    builder: (context, snapshot) {
                      if (snapshot.hasError) {
                        return const Center(child: Text('Error loading menu.'));
                      }
                      if (snapshot.connectionState == ConnectionState.waiting) {
                        return const Center(child: CircularProgressIndicator());
                      }

                      final docs = snapshot.data!.docs;

                      if (docs.isEmpty) {
                        return const Center(child: Text('No menu items available.'));
                      }

                      final menuItems = docs.map((doc) {
                        final data = doc.data() as Map<String, dynamic>;
                        return MenuItem(
                          id: doc.id,
                          name: data['name'] ?? 'No name',
                          description: data['description'] ?? '',
                          price: data['price']?.toDouble() ?? 0.0,
                          imageUrl: data['imageUrl'] ?? 'https://source.unsplash.com/800x600/?food',
                          restaurantId: data['restaurantId'] ?? '',
                          category: data['category'] ?? 'All',
                        );
                      }).toList();

                      if (_categories.length == 1 && menuItems.isNotEmpty) {
                        final cats = menuItems.map((e) => e.category).toSet().toList();
                        if (cats.isNotEmpty) {
                          _categories = ['All', ...cats];
                        }
                      }

                      final filteredItems = menuItems.where((item) {
                        final matchesSearch = _searchQuery.isEmpty ||
                            item.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
                            item.description.toLowerCase().contains(_searchQuery.toLowerCase());
                        final matchesCategory = _selectedCategory == 'All' ||
                            item.category == _selectedCategory;
                        return matchesSearch && matchesCategory;
                      }).toList();

                      if (filteredItems.isEmpty) {
                        return Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.search_off, size: 64, color: Colors.grey[300]),
                              const SizedBox(height: 16),
                              Text(
                                "No items found",
                                style: TextStyle(color: Colors.grey[600], fontSize: 16),
                              ),
                            ],
                          ),
                        );
                      }

                      return ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: filteredItems.length,
                        itemBuilder: (context, index) {
                          final item = filteredItems[index];
                          return Container(
                            margin: const EdgeInsets.only(bottom: 16),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.05),
                                  blurRadius: 10,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: Row(
                              children: [
                                ClipRRect(
                                  borderRadius: const BorderRadius.only(
                                    topLeft: Radius.circular(16),
                                    bottomLeft: Radius.circular(16),
                                  ),
                                  child: item.imageUrl.isNotEmpty
                                      ? Image.network(
                                          item.imageUrl,
                                          width: 120,
                                          height: 120,
                                          fit: BoxFit.cover,
                                          errorBuilder: (_, __, ___) => _buildPlaceholder(),
                                        )
                                      : _buildPlaceholder(),
                                ),
                                Expanded(
                                  child: Padding(
                                    padding: const EdgeInsets.all(12),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        if (item.category != 'All')
                                          Container(
                                            padding: const EdgeInsets.symmetric(
                                              horizontal: 8,
                                              vertical: 2,
                                            ),
                                            decoration: BoxDecoration(
                                              color: const Color(0xFFE8521A).withOpacity(0.1),
                                              borderRadius: BorderRadius.circular(8),
                                            ),
                                            child: Text(
                                              item.category,
                                              style: const TextStyle(
                                                fontSize: 10,
                                                color: Color(0xFFE8521A),
                                                fontWeight: FontWeight.w500,
                                              ),
                                            ),
                                          ),
                                        const SizedBox(height: 4),
                                        Text(
                                          item.name,
                                          style: const TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 16,
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          item.description,
                                          maxLines: 2,
                                          overflow: TextOverflow.ellipsis,
                                          style: TextStyle(
                                            color: Colors.grey[600],
                                            fontSize: 12,
                                          ),
                                        ),
                                        const SizedBox(height: 8),
                                        Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          children: [
                                            Text(
                                              "ETB ${NumberFormat("#,##0").format(item.price)}",
                                              style: const TextStyle(
                                                fontWeight: FontWeight.bold,
                                                fontSize: 16,
                                                color: AppColors.primary,
                                              ),
                                            ),
                                            ElevatedButton(
                                              onPressed: () {
                                                Provider.of<CartProvider>(
                                                  context,
                                                  listen: false,
                                                ).addItem(CartItem(item: item));
                                                ScaffoldMessenger.of(context).showSnackBar(
                                                  SnackBar(
                                                    content: Text('${item.name} added to cart 🛒'),
                                                    backgroundColor: AppColors.primary,
                                                    behavior: SnackBarBehavior.floating,
                                                    action: SnackBarAction(
                                                      label: "View Cart",
                                                      textColor: Colors.white,
                                                      onPressed: () {
                                                        Navigator.push(
                                                          context,
                                                          MaterialPageRoute(
                                                            builder: (_) => const CartScreen(),
                                                          ),
                                                        );
                                                      },
                                                    ),
                                                  ),
                                                );
                                              },
                                              style: ElevatedButton.styleFrom(
                                                backgroundColor: AppColors.primary,
                                                padding: const EdgeInsets.symmetric(
                                                  horizontal: 12,
                                                  vertical: 8,
                                                ),
                                                minimumSize: Size.zero,
                                              ),
                                              child: const Text(
                                                "Add",
                                                style: TextStyle(fontSize: 12),
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
                        },
                      );
                    },
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPlaceholder() {
    return Container(
      width: 120,
      height: 120,
      color: Colors.grey[200],
      child: Icon(Icons.fastfood, color: Colors.grey[400], size: 40),
    );
  }
}
