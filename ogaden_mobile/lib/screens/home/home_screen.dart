import 'package:flutter/material.dart';
import '../../models/restaurant_model.dart';
import '../../widgets/restaurant_card.dart';
import '../menu/menu_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  // Mock Data
  List<Restaurant> getRestaurants() {
    return [
      Restaurant(
        name: 'Ogaden Kitchen',
        imageUrl: 'https://source.unsplash.com/800x600/?ethiopian,food',
        cuisine: 'Somali, Ethiopian',
        rating: 4.8,
        location: 'Bole, Addis Ababa',
      ),
      Restaurant(
        name: 'Hargeisa Bites',
        imageUrl: 'https://source.unsplash.com/800x600/?restaurant',
        cuisine: 'East African Fusion',
        rating: 4.6,
        location: 'Kirkos, Addis',
      ),
    ];
  }

  @override
  Widget build(BuildContext context) {
    final restaurants = getRestaurants();

    return Scaffold(
      appBar: AppBar(title: const Text("Ogaden Restaurants")),
      body: ListView.builder(
        itemCount: restaurants.length,
        itemBuilder: (context, index) {
          return RestaurantCard(
            restaurant: restaurants[index],
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) =>
                      MenuScreen(restaurantName: restaurants[index].name),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
