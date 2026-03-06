import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart' hide Order;
import 'package:intl/intl.dart';
import 'package:ogaden_mobile/models/order_model.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:ogaden_mobile/constants/app_theme.dart';

class ScheduledOrdersScreen extends StatefulWidget {
  const ScheduledOrdersScreen({super.key});

  @override
  State<ScheduledOrdersScreen> createState() => _ScheduledOrdersScreenState();
}

class _ScheduledOrdersScreenState extends State<ScheduledOrdersScreen> {
  @override
  Widget build(BuildContext context) {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      return Scaffold(body: Container(decoration: AppDecorations.brandHeader, child: const Center(child: Card(child: Padding(padding: EdgeInsets.all(24), child: Text('Please log in'))))));
    }

    return Scaffold(
      body: Container(
        decoration: AppDecorations.brandHeader,
        child: SafeArea(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(20),
                child: Row(children: [IconButton(icon: const Icon(Icons.arrow_back, color: Colors.white), onPressed: () => Navigator.pop(context)), const SizedBox(width: 8), const Text('Scheduled Orders', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white))]),
              ),
              Expanded(
                child: Container(
                  decoration: const BoxDecoration(color: Colors.white, borderRadius: BorderRadius.only(topLeft: Radius.circular(30), topRight: Radius.circular(30))),
                  child: StreamBuilder<QuerySnapshot>(
                    stream: FirebaseFirestore.instance.collection('orders').where('userId', isEqualTo: user.uid).where('scheduledFor', isNotEqualTo: null).orderBy('scheduledFor').snapshots(),
                    builder: (context, AsyncSnapshot<QuerySnapshot> snapshot) {
                      if (snapshot.connectionState == ConnectionState.waiting) return const Center(child: CircularProgressIndicator());
                      if (!snapshot.hasData) return const SizedBox();
                      final orders = snapshot.data!.docs.map((doc) => Order.fromMap(doc.data() as Map<String, dynamic>)).where((order) => order.scheduledFor != null).toList();
                      if (orders.isEmpty) return Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [Icon(Icons.schedule, size: 80, color: Colors.grey[300]), const SizedBox(height: 16), Text('No scheduled orders', style: TextStyle(fontSize: 18, color: Colors.grey[600]))]));
                      final upcomingOrders = orders.where((o) => o.scheduledFor!.isAfter(DateTime.now())).toList();
                      final pastOrders = orders.where((o) => o.scheduledFor!.isBefore(DateTime.now())).toList();
                      return ListView(padding: const EdgeInsets.all(20), children: [
                        if (upcomingOrders.isNotEmpty) ...[const Text('Upcoming', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)), const SizedBox(height: 16), ...upcomingOrders.map((order) => _ScheduledOrderCard(order: order))],
                        if (pastOrders.isNotEmpty) ...[const SizedBox(height: 24), const Text('Past', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)), const SizedBox(height: 16), ...pastOrders.map((order) => _ScheduledOrderCard(order: order, isPast: true))],
                      ]);
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

class _ScheduledOrderCard extends StatelessWidget {
  final Order order;
  final bool isPast;
  const _ScheduledOrderCard({required this.order, this.isPast = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 4))]),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [Text(order.restaurantName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)), _StatusChip(status: order.status)]),
        const SizedBox(height: 12),
        Row(children: [Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)), child: const Icon(Icons.schedule, size: 16, color: AppColors.primary)), const SizedBox(width: 8), Text(DateFormat('MMM d, yyyy - h:mm a').format(order.scheduledFor!), style: TextStyle(color: Colors.grey[600]))]),
        const SizedBox(height: 8),
        Row(children: [Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: Colors.orange.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)), child: Icon(order.orderType == OrderType.delivery ? Icons.delivery_dining : Icons.storefront, size: 16, color: Colors.orange)), const SizedBox(width: 8), Text(order.orderType == OrderType.delivery ? 'Delivery' : 'Pickup', style: TextStyle(color: Colors.grey[600]))]),
        const Divider(height: 24),
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [Text('${order.items.length} items', style: TextStyle(color: Colors.grey[600])), Text('ETB ${order.total.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary, fontSize: 16))]),
      ]),
    );
  }
}

class _StatusChip extends StatelessWidget {
  final OrderStatus status;
  const _StatusChip({required this.status});

  Color get _color {
    switch (status) { case OrderStatus.pending: return Colors.orange; case OrderStatus.confirmed: return Colors.blue; case OrderStatus.preparing: return Colors.purple; case OrderStatus.readyForPickup: return Colors.teal; case OrderStatus.outForDelivery: return Colors.indigo; case OrderStatus.delivered: return Colors.green; case OrderStatus.cancelled: return Colors.red; }
  }

  String get _text {
    switch (status) { case OrderStatus.pending: return 'Pending'; case OrderStatus.confirmed: return 'Confirmed'; case OrderStatus.preparing: return 'Preparing'; case OrderStatus.readyForPickup: return 'Ready'; case OrderStatus.outForDelivery: return 'On the way'; case OrderStatus.delivered: return 'Delivered'; case OrderStatus.cancelled: return 'Cancelled'; }
  }

  @override
  Widget build(BuildContext context) {
    return Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6), decoration: BoxDecoration(color: _color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(20)), child: Text(_text, style: TextStyle(color: _color, fontSize: 12, fontWeight: FontWeight.bold)));
  }
}
