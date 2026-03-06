import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart' hide Order;
import 'package:firebase_auth/firebase_auth.dart';
import 'package:intl/intl.dart';
import 'package:ogaden_mobile/models/order_model.dart';
import 'package:ogaden_mobile/constants/app_theme.dart';

class DeliveryTrackingScreen extends StatefulWidget {
  final String orderId;
  const DeliveryTrackingScreen({super.key, required this.orderId});

  @override
  State<DeliveryTrackingScreen> createState() => _DeliveryTrackingScreenState();
}

class _DeliveryTrackingScreenState extends State<DeliveryTrackingScreen> {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: AppDecorations.brandHeader,
        child: SafeArea(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(20),
                child: Row(
                  children: [
                    IconButton(icon: const Icon(Icons.arrow_back, color: Colors.white), onPressed: () => Navigator.pop(context)),
                    const SizedBox(width: 8),
                    const Text('Track Order', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
                  ],
                ),
              ),
              Expanded(
                child: Container(
                  decoration: const BoxDecoration(color: Colors.white, borderRadius: BorderRadius.only(topLeft: Radius.circular(30), topRight: Radius.circular(30))),
                  child: StreamBuilder<DocumentSnapshot>(
                    stream: _firestore.collection('orders').doc(widget.orderId).snapshots(),
                    builder: (context, snapshot) {
                      if (snapshot.connectionState == ConnectionState.waiting) return const Center(child: CircularProgressIndicator());
                      if (!snapshot.hasData || !snapshot.data!.exists) return Center(child: Text('Order not found', style: TextStyle(color: Colors.grey[600])));
                      final order = Order.fromMap(snapshot.data!.data() as Map<String, dynamic>);
                      return SingleChildScrollView(
                        padding: const EdgeInsets.all(20),
                        child: Column(children: [
                          _OrderStatusCard(order: order),
                          const SizedBox(height: 20),
                          if (order.isDelivery) ...[_DeliveryInfoCard(order: order), const SizedBox(height: 20), _DeliveryProgress(order: order)],
                          const SizedBox(height: 20),
                          _OrderDetailsCard(order: order),
                        ]),
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
}

class _OrderStatusCard extends StatelessWidget {
  final Order order;
  const _OrderStatusCard({required this.order});

  String get _statusText {
    switch (order.status) {
      case OrderStatus.pending: return 'Order Placed';
      case OrderStatus.confirmed: return 'Order Confirmed';
      case OrderStatus.preparing: return 'Preparing Your Order';
      case OrderStatus.readyForPickup: return 'Ready for Pickup';
      case OrderStatus.outForDelivery: return 'Out for Delivery';
      case OrderStatus.delivered: return 'Delivered';
      case OrderStatus.cancelled: return 'Cancelled';
    }
  }

  Color get _statusColor {
    switch (order.status) {
      case OrderStatus.delivered: return Colors.green;
      case OrderStatus.cancelled: return Colors.red;
      case OrderStatus.outForDelivery: return Colors.blue;
      default: return Colors.orange;
    }
  }

  IconData _getStatusIcon() {
    switch (order.status) {
      case OrderStatus.pending: return Icons.receipt_long;
      case OrderStatus.confirmed: return Icons.check_circle;
      case OrderStatus.preparing: return Icons.restaurant;
      case OrderStatus.readyForPickup: return Icons.delivery_dining;
      case OrderStatus.outForDelivery: return Icons.local_shipping;
      case OrderStatus.delivered: return Icons.done_all;
      case OrderStatus.cancelled: return Icons.cancel;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 4))]),
      child: Row(children: [
        Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: _statusColor.withValues(alpha: 0.1), shape: BoxShape.circle), child: Icon(_getStatusIcon(), color: _statusColor, size: 32)),
        const SizedBox(width: 16),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(_statusText, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: _statusColor)),
          const SizedBox(height: 4),
          Text('Order #${order.id.substring(0, 8)}', style: TextStyle(color: Colors.grey[600])),
        ])),
      ]),
    );
  }
}

class _DeliveryInfoCard extends StatelessWidget {
  final Order order;
  const _DeliveryInfoCard({required this.order});

  @override
  Widget build(BuildContext context) {
    if (order.driverName == null) {
      return Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: Colors.blue.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(16)), child: Row(children: [const Icon(Icons.info_outline, color: Colors.blue), const SizedBox(width: 12), Expanded(child: Text(order.status == OrderStatus.outForDelivery ? 'Driver will be assigned soon' : 'Driver will be assigned when your order is out for delivery'))]));
    }
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10)]),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Driver Info', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        Row(children: [
          CircleAvatar(backgroundColor: AppColors.primary.withValues(alpha: 0.1), child: const Icon(Icons.person, color: AppColors.primary)),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(order.driverName!, style: const TextStyle(fontWeight: FontWeight.bold)), if (order.driverPhone != null) Text(order.driverPhone!, style: TextStyle(color: Colors.grey[600]))])),
          if (order.driverPhone != null) Container(decoration: BoxDecoration(color: Colors.green.withValues(alpha: 0.1), shape: BoxShape.circle), child: IconButton(icon: const Icon(Icons.phone, color: Colors.green), onPressed: () {})),
        ]),
      ]),
    );
  }
}

class _DeliveryProgress extends StatelessWidget {
  final Order order;
  const _DeliveryProgress({required this.order});

  @override
  Widget build(BuildContext context) {
    final steps = [{'title': 'Order Placed', 'status': OrderStatus.pending}, {'title': 'Confirmed', 'status': OrderStatus.confirmed}, {'title': 'Preparing', 'status': OrderStatus.preparing}, {'title': 'On the Way', 'status': OrderStatus.outForDelivery}, {'title': 'Delivered', 'status': OrderStatus.delivered}];
    final currentIndex = steps.indexWhere((s) => s['status'] == order.status);
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10)]),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Delivery Progress', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 20),
        ...steps.asMap().entries.map((entry) {
          final index = entry.key;
          final step = entry.value;
          final isCompleted = index <= currentIndex;
          final isCurrent = index == currentIndex;
          return Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: Row(children: [
              Container(width: 28, height: 28, decoration: BoxDecoration(color: isCompleted ? Colors.green : Colors.grey[200], shape: BoxShape.circle), child: isCompleted ? const Icon(Icons.check, size: 16, color: Colors.white) : null),
              const SizedBox(width: 12),
              Expanded(child: Text(step['title'] as String, style: TextStyle(fontWeight: isCurrent ? FontWeight.bold : FontWeight.normal, color: isCompleted ? Colors.black : Colors.grey))),
            ]),
          );
        }),
      ]),
    );
  }
}

class _OrderDetailsCard extends StatelessWidget {
  final Order order;
  const _OrderDetailsCard({required this.order});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10)]),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Order Details', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        _DetailRow(label: 'Order Type', value: order.orderType.name.toUpperCase()),
        _DetailRow(label: 'Date', value: DateFormat('MMM d, yyyy - h:mm a').format(order.createdAt)),
        if (order.deliveryAddress != null) _DetailRow(label: 'Delivery Address', value: order.deliveryAddress!),
        const Divider(height: 24),
        ...order.items.map((item) => _DetailRow(label: '${item.quantity}x ${item.name}', value: 'ETB ${item.total.toStringAsFixed(0)}')),
        const Divider(height: 24),
        _DetailRow(label: 'Total', value: 'ETB ${order.total.toStringAsFixed(0)}', isBold: true),
      ]),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;
  final bool isBold;
  final Color? valueColor;
  const _DetailRow({required this.label, required this.value, this.isBold = false, this.valueColor});

  @override
  Widget build(BuildContext context) {
    return Padding(padding: const EdgeInsets.symmetric(vertical: 6), child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [Text(label, style: TextStyle(fontWeight: isBold ? FontWeight.bold : FontWeight.normal)), Text(value, style: TextStyle(fontWeight: isBold ? FontWeight.bold : FontWeight.normal, color: valueColor ?? (isBold ? AppColors.primary : null)))]));
  }
}
