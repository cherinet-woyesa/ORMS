import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/cart_item_model.dart';

class OrderService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  final String? userId = FirebaseAuth.instance.currentUser?.uid;

  Future<void> saveOrder(List<CartItem> items, double total) async {
    if (userId == null) return;

    final orderData = {
      'userId': userId,
      'total': total,
      'timestamp': FieldValue.serverTimestamp(),
      'items': items
          .map(
            (e) => {
              'name': e.item.name,
              'price': e.item.price,
              'quantity': e.quantity,
            },
          )
          .toList(),
    };

    await _db.collection('orders').add(orderData);
  }
}
