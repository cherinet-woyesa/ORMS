import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:ogaden_mobile/models/restaurant_model.dart';

class RestaurantSelector extends StatelessWidget {
  final Function(Restaurant) onRestaurantSelected;
  final String? selectedRestaurantId;

  const RestaurantSelector({
    super.key,
    required this.onRestaurantSelected,
    this.selectedRestaurantId,
  });

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
      stream: FirebaseFirestore.instance
          .collection('restaurants')
          .where('isActive', isEqualTo: true)
          .snapshots(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        final docs = snapshot.data?.docs ?? [];
        final restaurants = docs
            .map((doc) => Restaurant.fromMap({...doc.data(), 'id': doc.id}))
            .toList();

        if (restaurants.isEmpty) {
          return const Center(
            child: Text('No restaurants available'),
          );
        }

        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: restaurants.length,
          itemBuilder: (context, index) {
            final restaurant = restaurants[index];
            final isSelected = restaurant.id == selectedRestaurantId;

            return Card(
              margin: const EdgeInsets.only(bottom: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: isSelected
                    ? BorderSide(color: Theme.of(context).primaryColor, width: 2)
                    : BorderSide.none,
              ),
              child: ListTile(
                onTap: () => onRestaurantSelected(restaurant),
                leading: ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: restaurant.imageUrl.isNotEmpty
                      ? Image.network(
                          restaurant.imageUrl,
                          width: 60,
                          height: 60,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(
                            width: 60,
                            height: 60,
                            color: Colors.grey[300],
                            child: const Icon(Icons.restaurant),
                          ),
                        )
                      : Container(
                          width: 60,
                          height: 60,
                          color: Colors.grey[300],
                          child: const Icon(Icons.restaurant),
                        ),
                ),
                title: Text(
                  restaurant.name,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(restaurant.cuisine),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Icons.star, size: 14, color: Colors.amber),
                        Text(' ${restaurant.rating}'),
                        const SizedBox(width: 8),
                        const Icon(Icons.access_time, size: 14, color: Colors.grey),
                        Text(' ${restaurant.deliveryTime} min'),
                      ],
                    ),
                  ],
                ),
                trailing: isSelected
                    ? Icon(Icons.check_circle, color: Theme.of(context).primaryColor)
                    : null,
              ),
            );
          },
        );
      },
    );
  }
}

class RestaurantFilterSheet extends StatelessWidget {
  final Function(Restaurant?) onFilterApplied;
  final String? currentRestaurantId;

  const RestaurantFilterSheet({
    super.key,
    required this.onFilterApplied,
    this.currentRestaurantId,
  });

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.7,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      expand: false,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            children: [
              Container(
                margin: const EdgeInsets.symmetric(vertical: 12),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const Padding(
                padding: EdgeInsets.all(16),
                child: Text(
                  'Select Restaurant',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
              ),
              Expanded(
                child: RestaurantSelector(
                  onRestaurantSelected: (restaurant) {
                    onFilterApplied(restaurant);
                    Navigator.pop(context);
                  },
                  selectedRestaurantId: currentRestaurantId,
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
