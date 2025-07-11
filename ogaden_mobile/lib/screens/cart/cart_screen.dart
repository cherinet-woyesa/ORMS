import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/cart_item_model.dart';
import '../../providers/cart_provider.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:intl/intl.dart';
// ✅ Add this line

class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  void placeOrder(
    BuildContext context,
    List<CartItem> items,
    double total,
  ) async {
    final db = FirebaseFirestore.instance;

    final order = {
      "items": items
          .map(
            (item) => {
              "name": item.item.name,
              "price": item.item.price,
              "quantity": item.quantity,
            },
          )
          .toList(),
      "total": total,
      "timestamp": FieldValue.serverTimestamp(),
      "status": "pending",
    };

    try {
      await db.collection("orders").add(order);
      Provider.of<CartProvider>(context, listen: false).clearCart();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("✅ Order placed successfully!")),
      );
      Navigator.pop(context); // Go back to home/menu
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text("❌ Failed to place order.")));
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = Provider.of<CartProvider>(context);
    final items = cart.items;
    final total = cart.totalPrice;

    return Scaffold(
      appBar: AppBar(title: const Text("🛒 Your Cart")),
      body: items.isEmpty
          ? const Center(child: Text("Your cart is empty."))
          : Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    itemCount: items.length,
                    itemBuilder: (context, index) {
                      final item = items[index];
                      return ListTile(
                        leading: const Icon(Icons.fastfood),
                        title: Text(item.item.name),
                        subtitle: Text(
                          "ETB ${item.item.price} × ${item.quantity}",
                        ),
                        trailing: IconButton(
                          icon: const Icon(Icons.delete, color: Colors.red),
                          onPressed: () {
                            cart.removeItem(item.item as CartItem);
                          },
                        ),
                      );
                    },
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      Text(
                        "Total: ETB ${NumberFormat("#,##0.00").format(total)}",
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                      const SizedBox(height: 12),
                      ElevatedButton.icon(
                        onPressed: () => placeOrder(context, items, total),
                        icon: const Icon(Icons.check_circle_outline),
                        label: const Text("Place Order"),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                          minimumSize: const Size.fromHeight(50),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }
}
