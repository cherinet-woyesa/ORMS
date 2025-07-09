import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class OrderStatusScreen extends StatelessWidget {
  final String orderId;

  const OrderStatusScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context) {
    final orderRef = FirebaseFirestore.instance
        .collection("orders")
        .doc(orderId);

    return Scaffold(
      appBar: AppBar(title: const Text("📦 Order Status")),
      body: StreamBuilder<DocumentSnapshot>(
        stream: orderRef.snapshots(),
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            return const Center(child: Text("Error loading status."));
          }
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          final data = snapshot.data?.data() as Map<String, dynamic>?;

          if (data == null) {
            return const Center(child: Text("Order not found."));
          }

          final status = data['status'] ?? 'Unknown';

          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text(
                  "Your Order Status:",
                  style: TextStyle(fontSize: 18),
                ),
                const SizedBox(height: 16),
                Text(
                  status.toUpperCase(),
                  style: const TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Colors.green,
                  ),
                ),
                const SizedBox(height: 24),
                const Text("This will update automatically."),
              ],
            ),
          );
        },
      ),
    );
  }
}
