import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:ogaden_mobile/models/restaurant_model.dart';

class RestaurantProvider extends ChangeNotifier {
  Restaurant? _selectedRestaurant;
  List<Restaurant> _restaurants = [];
  bool _isLoading = false;

  Restaurant? get selectedRestaurant => _selectedRestaurant;
  List<Restaurant> get restaurants => _restaurants;
  bool get isLoading => _isLoading;

  Future<void> loadRestaurants() async {
    _isLoading = true;
    notifyListeners();

    try {
      final snapshot = await FirebaseFirestore.instance
          .collection('restaurants')
          .where('isOpen', isEqualTo: true)
          .get();

      _restaurants = snapshot.docs
          .map((doc) => Restaurant.fromMap(doc.data()))
          .toList();

      if (_restaurants.isNotEmpty && _selectedRestaurant == null) {
        _selectedRestaurant = _restaurants.first;
      }
    } catch (e) {
      debugPrint('Error loading restaurants: $e');
      _restaurants = _getDefaultRestaurants();
      if (_restaurants.isNotEmpty && _selectedRestaurant == null) {
        _selectedRestaurant = _restaurants.first;
      }
    }

    _isLoading = false;
    notifyListeners();
  }

  List<Restaurant> _getDefaultRestaurants() {
    return [
      Restaurant(
        id: 'ogaden_main',
        name: 'Ogaden Restaurant',
        imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
        cuisine: 'Somali & International',
        rating: 4.5,
        location: 'Jigjiga, Ethiopia',
        description: 'Best Somali cuisine in town',
        reviewCount: 128,
        deliveryFee: 2.99,
        deliveryTime: 25,
        isOpen: true,
      ),
      Restaurant(
        id: 'ogaden_express',
        name: 'Ogaden Express',
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
        cuisine: 'Fast Food & Grill',
        rating: 4.2,
        location: 'Jigjiga, Ethiopia',
        description: 'Quick bites and grilled specialties',
        reviewCount: 85,
        deliveryFee: 1.99,
        deliveryTime: 15,
        isOpen: true,
      ),
      Restaurant(
        id: 'ogaden_cafe',
        name: 'Ogaden Cafe',
        imageUrl: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=400',
        cuisine: 'Coffee & Pastries',
        rating: 4.7,
        location: 'Jigjiga, Ethiopia',
        description: 'Premium coffee and fresh pastries',
        reviewCount: 210,
        deliveryFee: 1.49,
        deliveryTime: 20,
        isOpen: true,
      ),
    ];
  }

  void selectRestaurant(Restaurant restaurant) {
    _selectedRestaurant = restaurant;
    notifyListeners();
  }

  void selectRestaurantById(String id) {
    final restaurant = _restaurants.firstWhere(
      (r) => r.id == id,
      orElse: () => _restaurants.first,
    );
    selectRestaurant(restaurant);
  }
}
