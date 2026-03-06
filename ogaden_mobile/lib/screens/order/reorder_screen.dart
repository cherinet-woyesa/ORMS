import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart' hide Order;
import 'package:ogaden_mobile/models/order_model.dart';
import 'package:ogaden_mobile/models/menu_item_model.dart';
import 'package:provider/provider.dart';
import 'package:ogaden_mobile/providers/cart_provider.dart';
import 'package:ogaden_mobile/models/cart_item_model.dart';
import 'package:intl/intl.dart';

class ReorderScreen extends StatefulWidget {
  const ReorderScreen({super.key});

  @override
  State<ReorderScreen> createState() => _ReorderScreenState();
}

class _ReorderScreenState extends State<ReorderScreen> {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  List<Order> _orders = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadOrders();
  }

  Future<void> _loadOrders() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    final snapshot = await _firestore
        .collection('orders')
        .where('userId', isEqualTo: user.uid)
        .orderBy('createdAt', descending: true)
        .get();

    final orders = snapshot.docs
        .map((doc) => Order.fromMap(doc.data()))
        .where((order) => order.status == OrderStatus.delivered)
        .toList();

    setState(() {
      _orders = orders;
      _isLoading = false;
    });
  }

  Future<void> _reorderItems(Order order) async {
    final cartProvider = context.read<CartProvider>();

    for (final item in order.items) {
      final menuItem = MenuItem(
        id: item.menuItemId,
        name: item.name,
        description: '',
        imageUrl: '',
        price: item.price,
        restaurantId: order.restaurantId,
      );

      for (int i = 0; i < item.quantity; i++) {
        cartProvider.addItem(CartItem(item: menuItem));
      }
    }

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Added ${order.items.length} items to cart'),
          action: SnackBarAction(
            label: 'View Cart',
            onPressed: () => Navigator.pop(context),
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Reorder'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _orders.isEmpty
              ? const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.replay, size: 64, color: Colors.grey),
                      SizedBox(height: 16),
                      Text('No previous orders'),
                      Text('Complete an order to see it here'),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _orders.length,
                  itemBuilder: (context, index) {
                    final order = _orders[index];
                    return _OrderReorderCard(
                      order: order,
                      onReorder: () => _reorderItems(order),
                    );
                  },
                ),
    );
  }
}

class _OrderReorderCard extends StatelessWidget {
  final Order order;
  final VoidCallback onReorder;

  const _OrderReorderCard({
    required this.order,
    required this.onReorder,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      order.restaurantName,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    Text(
                      DateFormat('MMM d, yyyy').format(order.createdAt),
                      style: TextStyle(
                        color: Colors.grey[600],
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
                Text(
                  '\$${order.total.toStringAsFixed(2)}',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
            const Divider(height: 24),
            const Text(
              'Items:',
              style: TextStyle(fontWeight: FontWeight.w500),
            ),
            const SizedBox(height: 8),
            ...order.items.map((item) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 2),
              child: Row(
                children: [
                  Container(
                    width: 20,
                    height: 20,
                    decoration: BoxDecoration(
                      color: Colors.green[100],
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Center(
                      child: Text(
                        '${item.quantity}',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Colors.green[800],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(child: Text(item.name)),
                ],
              ),
            )),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: onReorder,
                icon: const Icon(Icons.replay),
                label: const Text('Reorder Same Items'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
