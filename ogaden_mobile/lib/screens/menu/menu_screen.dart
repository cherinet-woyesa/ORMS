import 'package:flutter/material.dart';
import '../../models/menu_item_model.dart';
import '../../widgets/menu_item_card.dart';
import 'package:provider/provider.dart';
import '../../providers/cart_provider.dart';
import '../../models/cart_item_model.dart';

class MenuScreen extends StatelessWidget {
  final String restaurantName;

  const MenuScreen({super.key, required this.restaurantName});

  List<MenuItem> getMenuItems() {
    return [
      MenuItem(
        name: 'Beef Suqaar',
        description: 'Tender beef cubes sautéed with onions and spices',
        imageUrl: 'https://source.unsplash.com/800x600/?beef',
        price: 130,
      ),
      MenuItem(
        name: 'Canjeero & Honey',
        description: 'Soft Somali pancake served with honey and butter',
        imageUrl: 'https://source.unsplash.com/800x600/?pancake',
        price: 50,
      ),
      MenuItem(
        name: 'Chicken Biryani',
        description: 'Spicy rice dish with marinated chicken',
        imageUrl: 'https://source.unsplash.com/800x600/?biryani',
        price: 150,
      ),
    ];
  }

  @override
  Widget build(BuildContext context) {
    final menuItems = getMenuItems();

    return Scaffold(
      appBar: AppBar(title: Text('$restaurantName Menu')),
      body: ListView.builder(
        itemCount: menuItems.length,
        itemBuilder: (context, index) {
          return MenuItemCard(
            item: menuItems[index],
            onAdd: () {
              Provider.of<CartProvider>(
                context,
                listen: false,
              ).addItem(CartItem(item: menuItems[index]));
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('${menuItems[index].name} added 🛒')),
              );
            },
          );
        },
      ),
    );
  }
}
