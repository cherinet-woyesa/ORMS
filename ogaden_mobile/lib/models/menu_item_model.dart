class MenuItem {
  final String id;
  final String name;
  final String description;
  final String imageUrl;
  final double price;
  final String restaurantId;
  final String category;
  final List<String> dietaryTags;
  final double rating;
  final int reviewCount;
  final bool isAvailable;

  MenuItem({
    required this.id,
    required this.name,
    required this.description,
    required this.imageUrl,
    required this.price,
    required this.restaurantId,
    this.category = 'All',
    this.dietaryTags = const [],
    this.rating = 0.0,
    this.reviewCount = 0,
    this.isAvailable = true,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'imageUrl': imageUrl,
      'price': price,
      'restaurantId': restaurantId,
      'category': category,
      'dietaryTags': dietaryTags,
      'rating': rating,
      'reviewCount': reviewCount,
      'isAvailable': isAvailable,
    };
  }

  factory MenuItem.fromMap(Map<String, dynamic> map) {
    return MenuItem(
      id: map['id'] ?? '',
      name: map['name'] ?? '',
      description: map['description'] ?? '',
      imageUrl: map['imageUrl'] ?? '',
      price: (map['price'] ?? 0).toDouble(),
      restaurantId: map['restaurantId'] ?? '',
      category: map['category'] ?? 'All',
      dietaryTags: List<String>.from(map['dietaryTags'] ?? []),
      rating: (map['rating'] ?? 0).toDouble(),
      reviewCount: map['reviewCount'] ?? 0,
      isAvailable: map['isAvailable'] ?? true,
    );
  }

  MenuItem copyWith({
    String? id,
    String? name,
    String? description,
    String? imageUrl,
    double? price,
    String? restaurantId,
    String? category,
    List<String>? dietaryTags,
    double? rating,
    int? reviewCount,
    bool? isAvailable,
  }) {
    return MenuItem(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      imageUrl: imageUrl ?? this.imageUrl,
      price: price ?? this.price,
      restaurantId: restaurantId ?? this.restaurantId,
      category: category ?? this.category,
      dietaryTags: dietaryTags ?? this.dietaryTags,
      rating: rating ?? this.rating,
      reviewCount: reviewCount ?? this.reviewCount,
      isAvailable: isAvailable ?? this.isAvailable,
    );
  }
}
