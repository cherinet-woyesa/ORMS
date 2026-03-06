class Restaurant {
  final String id;
  final String name;
  final String imageUrl;
  final String cuisine;
  final double rating;
  final String location;
  final String description;
  final int reviewCount;
  final double deliveryFee;
  final int deliveryTime;
  final List<String> dietaryOptions;
  final bool isOpen;

  Restaurant({
    required this.id,
    required this.name,
    required this.imageUrl,
    required this.cuisine,
    required this.rating,
    required this.location,
    this.description = '',
    this.reviewCount = 0,
    this.deliveryFee = 0.0,
    this.deliveryTime = 30,
    this.dietaryOptions = const [],
    this.isOpen = true,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'imageUrl': imageUrl,
      'cuisine': cuisine,
      'rating': rating,
      'location': location,
      'description': description,
      'reviewCount': reviewCount,
      'deliveryFee': deliveryFee,
      'deliveryTime': deliveryTime,
      'dietaryOptions': dietaryOptions,
      'isOpen': isOpen,
    };
  }

  factory Restaurant.fromMap(Map<String, dynamic> map) {
    return Restaurant(
      id: map['id'] ?? '',
      name: map['name'] ?? '',
      imageUrl: map['imageUrl'] ?? '',
      cuisine: map['cuisine'] ?? '',
      rating: (map['rating'] ?? 0).toDouble(),
      location: map['location'] ?? '',
      description: map['description'] ?? '',
      reviewCount: map['reviewCount'] ?? 0,
      deliveryFee: (map['deliveryFee'] ?? 0).toDouble(),
      deliveryTime: map['deliveryTime'] ?? 30,
      dietaryOptions: List<String>.from(map['dietaryOptions'] ?? []),
      isOpen: map['isOpen'] ?? true,
    );
  }

  Restaurant copyWith({
    String? id,
    String? name,
    String? imageUrl,
    String? cuisine,
    double? rating,
    String? location,
    String? description,
    int? reviewCount,
    double? deliveryFee,
    int? deliveryTime,
    List<String>? dietaryOptions,
    bool? isOpen,
  }) {
    return Restaurant(
      id: id ?? this.id,
      name: name ?? this.name,
      imageUrl: imageUrl ?? this.imageUrl,
      cuisine: cuisine ?? this.cuisine,
      rating: rating ?? this.rating,
      location: location ?? this.location,
      description: description ?? this.description,
      reviewCount: reviewCount ?? this.reviewCount,
      deliveryFee: deliveryFee ?? this.deliveryFee,
      deliveryTime: deliveryTime ?? this.deliveryTime,
      dietaryOptions: dietaryOptions ?? this.dietaryOptions,
      isOpen: isOpen ?? this.isOpen,
    );
  }
}
