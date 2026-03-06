import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class OrderStatusScreen extends StatefulWidget {
  final String orderId;
  
  const OrderStatusScreen({super.key, required this.orderId});

  @override
  State<OrderStatusScreen> createState() => _OrderStatusScreenState();
}

class _OrderStatusScreenState extends State<OrderStatusScreen> {
  @override
  Widget build(BuildContext context) {
    final orderRef = FirebaseFirestore.instance
        .collection("orders")
        .doc(widget.orderId);

    return Scaffold(
      appBar: AppBar(
        title: const Text("Order Status"),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
      ),
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
          final total = (data['total'] ?? 0).toDouble();
          final items = data['items'] as List<dynamic>? ?? [];
          final timestamp = data['timestamp'] != null 
              ? data['timestamp'].toDate() 
              : null;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                _buildStatusIndicator(status),
                const SizedBox(height: 32),
                _buildOrderDetails(data, timestamp, total, items),
                const SizedBox(height: 20),
                _buildTimeline(status),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildStatusIndicator(String status) {
    Color statusColor;
    IconData statusIcon;
    
    switch (status.toLowerCase()) {
      case 'pending':
        statusColor = Colors.orange;
        statusIcon = Icons.hourglass_empty;
        break;
      case 'accepted':
      case 'preparing':
        statusColor = Colors.blue;
        statusIcon = Icons.restaurant;
        break;
      case 'ready':
        statusColor = Colors.purple;
        statusIcon = Icons.check_circle;
        break;
      case 'completed':
        statusColor = Colors.green;
        statusIcon = Icons.done_all;
        break;
      case 'cancelled':
        statusColor = Colors.red;
        statusIcon = Icons.cancel;
        break;
      default:
        statusColor = Colors.grey;
        statusIcon = Icons.help_outline;
    }

    return Column(
      children: [
        Container(
          width: 100,
          height: 100,
          decoration: BoxDecoration(
            color: statusColor.withOpacity(0.1),
            shape: BoxShape.circle,
            border: Border.all(color: statusColor, width: 3),
          ),
          child: Icon(statusIcon, size: 50, color: statusColor),
        ),
        const SizedBox(height: 16),
        Text(
          status.toUpperCase(),
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: statusColor,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          _getStatusMessage(status),
          style: TextStyle(
            fontSize: 14,
            color: Colors.grey[600],
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  String _getStatusMessage(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return "Your order is waiting for confirmation";
      case 'accepted':
        return "Your order has been confirmed and is being prepared";
      case 'preparing':
        return "Our chefs are preparing your delicious food";
      case 'ready':
        return "Your order is ready for pickup!";
      case 'completed':
        return "Thank you for your order! Enjoy your meal";
      case 'cancelled':
        return "This order has been cancelled";
      default:
        return "Processing your order";
    }
  }

  Widget _buildOrderDetails(Map<String, dynamic> data, DateTime? timestamp, double total, List<dynamic> items) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  "Order Details",
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                Text(
                  "#${widget.orderId.substring(0, 8).toUpperCase()}",
                  style: TextStyle(color: Colors.grey[600], fontSize: 14),
                ),
              ],
            ),
            const Divider(),
            if (timestamp != null)
              _detailRow("Order Date", timestamp.toString().substring(0, 16)),
            _detailRow("Payment Method", data['paymentMethod']?.toString() ?? 'Cash on Delivery'),
            _detailRow("Total", "ETB ${total.toStringAsFixed(2)}"),
            if (data['deliveryAddress'] != null)
              _detailRow("Delivery Address", data['deliveryAddress'].toString()),
            const Divider(),
            const Text(
              "Items:",
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            ...items.map((item) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text("${item['quantity']}x ${item['name']}"),
                  Text("ETB ${(item['price'] * item['quantity']).toStringAsFixed(2)}"),
                ],
              ),
            )),
          ],
        ),
      ),
    );
  }

  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: Colors.grey[600])),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  Widget _buildTimeline(String status) {
    final steps = ['pending', 'accepted', 'preparing', 'ready', 'completed'];
    final currentIndex = steps.indexOf(status.toLowerCase());

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Order Timeline",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            ...steps.asMap().entries.map((entry) {
              final index = entry.key;
              final step = entry.value;
              final isActive = index <= currentIndex;
              final isCurrent = index == currentIndex;

              return Row(
                children: [
                  Container(
                    width: 24,
                    height: 24,
                    decoration: BoxDecoration(
                      color: isActive ? Colors.green : Colors.grey[300],
                      shape: BoxShape.circle,
                    ),
                    child: isActive
                        ? const Icon(Icons.check, size: 16, color: Colors.white)
                        : null,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      step.substring(0, 1).toUpperCase() + step.substring(1),
                      style: TextStyle(
                        fontWeight: isCurrent ? FontWeight.bold : FontWeight.normal,
                        color: isActive ? Colors.black : Colors.grey,
                      ),
                    ),
                  ),
                ],
              );
            }),
          ],
        ),
      ),
    );
  }
}
