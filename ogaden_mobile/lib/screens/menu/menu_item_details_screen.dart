import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../providers/cart_provider.dart';
import '../../models/cart_item_model.dart';
import '../../models/menu_item_model.dart';

class MenuItemDetailsScreen extends StatefulWidget {
  final String menuItemId;

  const MenuItemDetailsScreen({super.key, required this.menuItemId});

  @override
  State<MenuItemDetailsScreen> createState() => _MenuItemDetailsScreenState();
}

class _MenuItemDetailsScreenState extends State<MenuItemDetailsScreen> {
  int _quantity = 1;
  String? _selectedSize;
  List<String> _selectedExtras = [];
  String? _specialInstructions;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFFE8521A), Color(0xFFD34513)],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(20),
                child: Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.arrow_back, color: Colors.white),
                      onPressed: () => Navigator.pop(context),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      'Item Details',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Container(
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(30),
                      topRight: Radius.circular(30),
                    ),
                  ),
                  child: FutureBuilder<DocumentSnapshot>(
                    future: FirebaseFirestore.instance
                        .collection('menus')
                        .doc(widget.menuItemId)
                        .get(),
                    builder: (context, snapshot) {
                      if (snapshot.connectionState == ConnectionState.waiting) {
                        return const Center(child: CircularProgressIndicator());
                      }

                      if (!snapshot.hasData || !snapshot.data!.exists) {
                        return Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.error_outline, size: 64, color: Colors.grey[300]),
                              const SizedBox(height: 16),
                              Text(
                                "Item not found",
                                style: TextStyle(color: Colors.grey[600]),
                              ),
                            ],
                          ),
                        );
                      }

                      final data = snapshot.data!.data() as Map<String, dynamic>;
                      final name = data['name'] ?? '';
                      final description = data['description'] ?? '';
                      final price = (data['price'] ?? 0).toDouble();
                      final imageUrl = data['imageUrl'] ?? '';
                      final category = data['category'] ?? 'Main';
                      final dietaryTags = List<String>.from(data['dietaryTags'] ?? []);
                      final ingredients = List<String>.from(data['ingredients'] ?? []);
                      final allergens = List<String>.from(data['allergens'] ?? []);
                      final sizes = List<String>.from(data['sizes'] ?? []);
                      final extras = List<Map<String, dynamic>>.from(data['extras'] ?? []);

                      double totalPrice = price;

                      return SingleChildScrollView(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(20),
                              child: imageUrl.isNotEmpty
                                  ? Image.network(
                                      imageUrl,
                                      height: 200,
                                      width: double.infinity,
                                      fit: BoxFit.cover,
                                      errorBuilder: (_, __, ___) => _buildImagePlaceholder(),
                                    )
                                  : _buildImagePlaceholder(),
                            ),
                            const SizedBox(height: 20),
                            Row(
                              children: [
                                if (category.isNotEmpty)
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 12,
                                      vertical: 6,
                                    ),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFE8521A).withValues(alpha: 0.1),
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: Text(
                                      category,
                                      style: const TextStyle(
                                        color: Color(0xFFE8521A),
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ),
                                const Spacer(),
                                Text(
                                  "ETB ${NumberFormat("#,##0").format(price)}",
                                  style: const TextStyle(
                                    fontSize: 24,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFFE8521A),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Text(
                              name,
                              style: const TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              description,
                              style: TextStyle(
                                color: Colors.grey[600],
                                fontSize: 15,
                                height: 1.5,
                              ),
                            ),
                            if (dietaryTags.isNotEmpty) ...[
                              const SizedBox(height: 16),
                              Wrap(
                                spacing: 8,
                                runSpacing: 8,
                                children: dietaryTags.map((tag) {
                                  return Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 10,
                                      vertical: 4,
                                    ),
                                    decoration: BoxDecoration(
                                      color: Colors.green.withValues(alpha: 0.1),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Text(
                                      tag,
                                      style: const TextStyle(
                                        color: Colors.green,
                                        fontSize: 12,
                                      ),
                                    ),
                                  );
                                }).toList(),
                              ),
                            ],
                            if (allergens.isNotEmpty) ...[
                              const SizedBox(height: 16),
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: Colors.red.withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: Colors.red.withValues(alpha: 0.3)),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(Icons.warning_amber, color: Colors.red, size: 20),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        "Contains: ${allergens.join(', ')}",
                                        style: const TextStyle(color: Colors.red),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                            if (ingredients.isNotEmpty) ...[
                              const SizedBox(height: 20),
                              const Text(
                                "Ingredients",
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                ingredients.join(', '),
                                style: TextStyle(color: Colors.grey[600]),
                              ),
                            ],
                            if (sizes.isNotEmpty) ...[
                              const SizedBox(height: 20),
                              const Text(
                                "Size",
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 12),
                              Wrap(
                                spacing: 12,
                                children: sizes.map((size) {
                                  final isSelected = _selectedSize == size;
                                  return ChoiceChip(
                                    label: Text(size),
                                    selected: isSelected,
                                    selectedColor: const Color(0xFFE8521A),
                                    labelStyle: TextStyle(
                                      color: isSelected ? Colors.white : Colors.black,
                                    ),
                                    onSelected: (selected) {
                                      setState(() {
                                        _selectedSize = selected ? size : null;
                                      });
                                    },
                                  );
                                }).toList(),
                              ),
                            ],
                            if (extras.isNotEmpty) ...[
                              const SizedBox(height: 20),
                              const Text(
                                "Add-ons",
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 12),
                              ...extras.map((extra) {
                                final name = extra['name'] ?? '';
                                final extraPrice = (extra['price'] ?? 0).toDouble();
                                final isSelected = _selectedExtras.contains(name);
                                return CheckboxListTile(
                                  title: Text(name),
                                  subtitle: Text("+ETB ${extraPrice.toStringAsFixed(0)}"),
                                  value: isSelected,
                                  activeColor: const Color(0xFFE8521A),
                                  onChanged: (selected) {
                                    setState(() {
                                      if (selected == true) {
                                        _selectedExtras.add(name);
                                        totalPrice += extraPrice;
                                      } else {
                                        _selectedExtras.remove(name);
                                        totalPrice -= extraPrice;
                                      }
                                    });
                                  },
                                );
                              }),
                            ],
                            const SizedBox(height: 20),
                            const Text(
                              "Special Instructions",
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 12),
                            TextField(
                              maxLines: 3,
                              decoration: InputDecoration(
                                hintText: "Any special requests?",
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                filled: true,
                                fillColor: Colors.grey[50],
                              ),
                              onChanged: (val) => _specialInstructions = val,
                            ),
                            const SizedBox(height: 20),
                            Row(
                              children: [
                                Container(
                                  decoration: BoxDecoration(
                                    color: Colors.grey[100],
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Row(
                                    children: [
                                      IconButton(
                                        icon: const Icon(Icons.remove),
                                        onPressed: _quantity > 1
                                            ? () => setState(() => _quantity--)
                                            : null,
                                      ),
                                      Text(
                                        "$_quantity",
                                        style: const TextStyle(
                                          fontSize: 18,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      IconButton(
                                        icon: const Icon(Icons.add),
                                        onPressed: () => setState(() => _quantity++),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 20),
                                Expanded(
                                  child: ElevatedButton.icon(
                                    onPressed: () {
                                      final menuItem = MenuItem(
                                        id: widget.menuItemId,
                                        name: name,
                                        description: description,
                                        imageUrl: imageUrl,
                                        price: totalPrice,
                                        restaurantId: '',
                                      );
                                      final cartItem = CartItem(
                                        item: menuItem,
                                        quantity: _quantity,
                                        extras: _selectedExtras,
                                        specialInstructions: _specialInstructions,
                                      );
                                      Provider.of<CartProvider>(
                                        context,
                                        listen: false,
                                      ).addItem(cartItem);
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        SnackBar(
                                          content: Text('$name added to cart 🛒'),
                                          backgroundColor: const Color(0xFFE8521A),
                                          action: SnackBarAction(
                                            label: "View Cart",
                                            textColor: Colors.white,
                                            onPressed: () => Navigator.pop(context),
                                          ),
                                        ),
                                      );
                                    },
                                    icon: const Icon(Icons.shopping_cart),
                                    label: Text(
                                      "Add - ETB ${NumberFormat("#,##0").format(totalPrice * _quantity)}",
                                    ),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFFE8521A),
                                      foregroundColor: Colors.white,
                                      padding: const EdgeInsets.symmetric(vertical: 14),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
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

  Widget _buildImagePlaceholder() {
    return Container(
      height: 200,
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.grey[200],
        borderRadius: BorderRadius.circular(20),
      ),
      child: Icon(Icons.fastfood, size: 64, color: Colors.grey[400]),
    );
  }
}
