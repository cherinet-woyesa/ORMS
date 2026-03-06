import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:ogaden_mobile/constants/app_theme.dart';

class OrderHistoryScreen extends StatelessWidget {
  const OrderHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final userId = FirebaseAuth.instance.currentUser?.uid ?? '';

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Container(
        decoration: AppDecorations.brandHeader,
        child: SafeArea(
          child: Column(
            children: [
              // ── Header ───────────────────────────────────────────────────
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
                child: Row(
                  children: [
                    const Icon(Icons.receipt_long_rounded,
                        color: Colors.white, size: 28),
                    const SizedBox(width: 12),
                    const Text(
                      'My Orders',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),

              // ── Content ───────────────────────────────────────────────────
              Expanded(
                child: Container(
                  decoration: const BoxDecoration(
                    color: AppColors.background,
                    borderRadius: AppDecorations.sheetRadius,
                  ),
                  child: userId.isEmpty
                      ? const _EmptyState(
                          message: 'Please log in to view your orders',
                          icon: Icons.lock_outline_rounded,
                        )
                      : StreamBuilder<QuerySnapshot>(
                          stream: FirebaseFirestore.instance
                              .collection('orders')
                              .where('userId', isEqualTo: userId)
                              .orderBy('createdAt', descending: true)
                              .snapshots(),
                          builder: (context, snapshot) {
                            if (snapshot.connectionState ==
                                ConnectionState.waiting) {
                              return const Center(
                                child: CircularProgressIndicator(
                                    color: AppColors.primary),
                              );
                            }

                            if (snapshot.hasError) {
                              return const _EmptyState(
                                message: 'Failed to load orders',
                                icon: Icons.error_outline_rounded,
                              );
                            }

                            final orders = snapshot.data?.docs ?? [];

                            if (orders.isEmpty) {
                              return const _EmptyState(
                                message: 'No orders yet',
                                subtitle: 'Your order history will appear here',
                                icon: Icons.receipt_long_rounded,
                              );
                            }

                            return ListView.builder(
                              padding: const EdgeInsets.fromLTRB(16, 20, 16, 24),
                              itemCount: orders.length,
                              itemBuilder: (context, index) {
                                final data = orders[index].data()
                                    as Map<String, dynamic>;
                                final orderId = orders[index].id;
                                return _OrderCard(
                                  orderId: orderId,
                                  data: data,
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
}

// ── Order Card ────────────────────────────────────────────────────────────────

class _OrderCard extends StatelessWidget {
  final String orderId;
  final Map<String, dynamic> data;

  const _OrderCard({required this.orderId, required this.data});

  @override
  Widget build(BuildContext context) {
    final status = (data['status'] ?? 'pending') as String;
    final total = (data['total'] ?? 0).toDouble();
    final timestamp = (data['createdAt'] as Timestamp?)?.toDate() ??
        (data['timestamp'] as Timestamp?)?.toDate();
    final items = List<dynamic>.from(data['items'] ?? []);
    final statusColor = AppColors.statusColor(status);
    final shortId = orderId.length >= 8 ? orderId.substring(0, 8) : orderId;

    final itemPreview = items
        .take(2)
        .map((i) => (i as Map<String, dynamic>)['name'] ?? '')
        .join(', ');
    final extraCount = items.length > 2 ? '+${items.length - 2} more' : '';

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: AppDecorations.card,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Top row: ID, date, status badge ──────────────────────────
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.10),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.receipt_rounded,
                          color: AppColors.primary, size: 18),
                    ),
                    const SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Order #$shortId',
                          style: AppTextStyles.titleMedium.copyWith(
                            fontSize: 14,
                          ),
                        ),
                        if (timestamp != null)
                          Text(
                            DateFormat('MMM dd, yyyy · hh:mm a')
                                .format(timestamp),
                            style: AppTextStyles.bodySmall,
                          ),
                      ],
                    ),
                  ],
                ),
                _StatusBadge(status: status, color: statusColor),
              ],
            ),

            const SizedBox(height: 14),
            const Divider(color: AppColors.divider, height: 1),
            const SizedBox(height: 14),

            // ── Items preview ─────────────────────────────────────────────
            Row(
              children: [
                const Icon(Icons.fastfood_rounded,
                    size: 15, color: AppColors.textMuted),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    items.isEmpty
                        ? 'No items'
                        : [itemPreview, if (extraCount.isNotEmpty) extraCount]
                            .join(', '),
                    style: AppTextStyles.bodyMedium.copyWith(fontSize: 13),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),

            // ── Bottom row: total ─────────────────────────────────────────
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${items.length} item${items.length == 1 ? '' : 's'}',
                  style: AppTextStyles.bodySmall.copyWith(fontSize: 13),
                ),
                Text(
                  'ETB ${NumberFormat("#,##0").format(total)}',
                  style: AppTextStyles.titleMedium.copyWith(
                    color: AppColors.primary,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  final String status;
  final Color color;

  const _StatusBadge({required this.status, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: 5),
          Text(
            status[0].toUpperCase() + status.substring(1),
            style: TextStyle(
              color: color,
              fontSize: 11,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

// ── Empty State ───────────────────────────────────────────────────────────────

class _EmptyState extends StatelessWidget {
  final String message;
  final String? subtitle;
  final IconData icon;

  const _EmptyState({
    required this.message,
    required this.icon,
    this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 90,
              height: 90,
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.08),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 44, color: AppColors.primary.withOpacity(0.5)),
            ),
            const SizedBox(height: 20),
            Text(message,
                style: AppTextStyles.titleMedium,
                textAlign: TextAlign.center),
            if (subtitle != null) ...[
              const SizedBox(height: 8),
              Text(subtitle!,
                  style: AppTextStyles.bodyMedium,
                  textAlign: TextAlign.center),
            ],
          ],
        ),
      ),
    );
  }
}