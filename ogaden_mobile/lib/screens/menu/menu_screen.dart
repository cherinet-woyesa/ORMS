import 'package:flutter/material.dart';
import '../../models/menu_item_model.dart';
import '../../widgets/menu_item_card.dart';
import 'package:provider/provider.dart';
import '../../providers/cart_provider.dart';
import '../../models/cart_item_model.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

import '../cart/cart_screen.dart';

class MenuScreen extends StatelessWidget {
  final String restaurantName;

  const MenuScreen({super.key, required this.restaurantName});

  @override
  Widget build(BuildContext context) {
    final menuRef = FirebaseFirestore.instance.collection('menus');

    return Scaffold(
appBar: AppBar(
  title: Text('$restaurantName Menu'),
  actions: [
    IconButton(
      icon: const Icon(Icons.shopping_cart),
      onPressed: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const CartScreen()),
        );
      },
    ),
  ],
),

      body: StreamBuilder<QuerySnapshot>(
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
              name: data['name'] ?? 'No name',
              description: data['description'] ?? '',
              price: data['price']?.toDouble() ?? 0.0,
              imageUrl:
                  'https://source.unsplash.com/800x600/?food', // 🔁 Placeholder
            );
          }).toList();

          return ListView.builder(
            itemCount: menuItems.length,
            itemBuilder: (context, index) {
              return MenuItemCard(
                item: menuItems[index],
                onAdd: () {
                  Provider.of<CartProvider>(
                    context,
                    listen: false,
                  ).addItem(CartItem(item: menuItems[index]));
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('${menuItems[index].name} added 🛒'),
                    ),
                  );
                },
              );
            },
          );
        },
      ),
    );
  }
}
