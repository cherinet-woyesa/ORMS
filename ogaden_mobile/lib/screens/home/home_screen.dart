import 'package:flutter/material.dart';
import '../../models/restaurant_model.dart';
import '../../widgets/restaurant_card.dart';
import '../menu/menu_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String searchQuery = '';
  String? selectedCuisine;
  final Set<String> favoriteRestaurantNames = {};
  bool isLoading = false;

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

  List<String> getCuisines() {
    final restaurants = getRestaurants();
    final cuisines = restaurants
        .expand((r) => r.cuisine.split(','))
        .map((c) => c.trim())
        .toSet()
        .toList();
    cuisines.sort();
    return cuisines;
  }

  Future<void> _refreshRestaurants() async {
    setState(() {
      isLoading = true;
    });
    await Future.delayed(const Duration(seconds: 1)); // Simulate network delay
    setState(() {
      isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final restaurants = getRestaurants();
    final filteredRestaurants = restaurants.where((restaurant) {
      final query = searchQuery.toLowerCase();
      final matchesSearch =
          restaurant.name.toLowerCase().contains(query) ||
          restaurant.cuisine.toLowerCase().contains(query);
      final matchesCuisine =
          selectedCuisine == null ||
          restaurant.cuisine.toLowerCase().contains(
            selectedCuisine!.toLowerCase(),
          );
      return matchesSearch && matchesCuisine;
    }).toList();

    final cuisines = getCuisines();

    return Scaffold(
      appBar: AppBar(
        title: const Text("Ogaden Restaurants"),
        actions: [
          IconButton(
            icon: const Icon(Icons.person),
            tooltip: 'Profile',
            onPressed: () {
              Navigator.pushNamed(context, '/profile');
            },
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Search restaurants or cuisine...',
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              onChanged: (value) {
                setState(() {
                  searchQuery = value;
                });
              },
            ),
          ),

          ElevatedButton(
            onPressed: () => Navigator.pushNamed(context, '/orders'),
            child: const Text("View My Orders"),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pushNamed(context, '/orders'),
            child: const Text("View My Orders"),
          ),

          SizedBox(
            height: 48,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              itemCount: cuisines.length + 1,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                if (index == 0) {
                  return ChoiceChip(
                    label: const Text('All'),
                    selected: selectedCuisine == null,
                    onSelected: (_) {
                      setState(() {
                        selectedCuisine = null;
                      });
                    },
                  );
                }
                final cuisine = cuisines[index - 1];
                return ChoiceChip(
                  label: Text(cuisine),
                  selected: selectedCuisine == cuisine,
                  onSelected: (_) {
                    setState(() {
                      selectedCuisine = cuisine;
                    });
                  },
                );
              },
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: isLoading
                ? const Center(child: CircularProgressIndicator())
                : RefreshIndicator(
                    onRefresh: _refreshRestaurants,
                    child: filteredRestaurants.isEmpty
                        ? ListView(
                            children: const [
                              SizedBox(height: 80),
                              Center(
                                child: Text(
                                  'No restaurants found.',
                                  style: TextStyle(
                                    fontSize: 18,
                                    color: Colors.grey,
                                  ),
                                ),
                              ),
                            ],
                          )
                        : ListView.builder(
                            itemCount: filteredRestaurants.length,
                            itemBuilder: (context, index) {
                              final restaurant = filteredRestaurants[index];
                              final isFavorite = favoriteRestaurantNames
                                  .contains(restaurant.name);
                              return RestaurantCard(
                                restaurant: restaurant,
                                isFavorite: isFavorite,
                                onFavoriteToggle: () {
                                  setState(() {
                                    if (isFavorite) {
                                      favoriteRestaurantNames.remove(
                                        restaurant.name,
                                      );
                                    } else {
                                      favoriteRestaurantNames.add(
                                        restaurant.name,
                                      );
                                    }
                                  });
                                },
                                onTap: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => MenuScreen(
                                        restaurantName: restaurant.name,
                                      ),
                                    ),
                                  );
                                },
                              );
                            },
                          ),
                  ),
          ),
        ],
      ),
    );
  }
}
