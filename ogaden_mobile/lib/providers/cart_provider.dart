import 'package:flutter/material.dart';
import '../models/cart_item_model.dart';

class CartProvider with ChangeNotifier {
  final List<CartItem> _items = [];

  List<CartItem> get items => _items;

  void addItem(CartItem newItem) {
    final index = _items.indexWhere((e) => e.item.name == newItem.item.name);
    if (index >= 0) {
      _items[index].quantity++;
    } else {
      _items.add(newItem);
    }
    notifyListeners();
  }

  void increaseQuantity(CartItem item) {
    item.quantity++;
    notifyListeners();
  }

  void decreaseQuantity(CartItem item) {
    if (item.quantity > 1) {
      item.quantity--;
    } else {
      _items.remove(item);
    }
    notifyListeners();
  }

  void removeItem(CartItem item) {
    _items.remove(item);
    notifyListeners();
  }

  double get totalPrice =>
      _items.fold(0, (sum, e) => sum + e.item.price * e.quantity);

  void clearCart() {
    _items.clear();
    notifyListeners();
  }
}
