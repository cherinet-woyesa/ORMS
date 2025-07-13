import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

class OrderHistoryScreen extends StatelessWidget {
  const OrderHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final userId = FirebaseAuth.instance.currentUser!.uid;

    return Scaffold(
      appBar: AppBar(title: const Text("My Orders")),
      body: StreamBuilder<QuerySnapshot>(
        stream: FirebaseFirestore.instance
            .collection('orders')
            .where('userId', isEqualTo: userId)
            .orderBy('createdAt', descending: true)
            .snapshots(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          final orders = snapshot.data?.docs ?? [];

          if (orders.isEmpty) {
            return const Center(child: Text("No orders found."));
          }

          return ListView.builder(
            itemCount: orders.length,
            itemBuilder: (context, index) {
              final data = orders[index].data() as Map<String, dynamic>;
              final items = List.from(data['items']);
              final timestamp = data['createdAt']?.toDate();

              return Card(
                margin: const EdgeInsets.all(12),
                child: ListTile(
                  title: Text("Order #${orders[index].id.substring(0, 6)}"),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text("Status: ${data['status']}"),
                      Text("Date: ${timestamp?.toLocal()}"),
                      ...items.map(
                        (item) => Text("${item['name']} x${item['quantity']}"),
                      ),
                      const SizedBox(height: 4),
                      Text("Total: ETB ${data['total']}"),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
        