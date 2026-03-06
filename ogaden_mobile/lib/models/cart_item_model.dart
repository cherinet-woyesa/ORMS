import 'menu_item_model.dart';

class CartItem {
  final MenuItem item;
  int quantity;
  List<String> extras;
  String? specialInstructions;

  CartItem({
    required this.item,
    this.quantity = 1,
    this.extras = const [],
    this.specialInstructions,
  });
}
