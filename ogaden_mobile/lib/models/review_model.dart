class Review {
  final String id;
  final String userId;
  final String userName;
  final String? restaurantId;
  final String? menuItemId;
  final double rating;
  final String comment;
  final DateTime createdAt;
  final List<String> images;

  Review({
    required this.id,
    required this.userId,
    required this.userName,
    this.restaurantId,
    this.menuItemId,
    required this.rating,
    required this.comment,
    required this.createdAt,
    this.images = const [],
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'userId': userId,
      'userName': userName,
      'restaurantId': restaurantId,
      'menuItemId': menuItemId,
      'rating': rating,
      'comment': comment,
      'createdAt': createdAt.toIso8601String(),
      'images': images,
    };
  }

  factory Review.fromMap(Map<String, dynamic> map) {
    return Review(
      id: map['id'] ?? '',
      userId: map['userId'] ?? '',
      userName: map['userName'] ?? '',
      restaurantId: map['restaurantId'],
      menuItemId: map['menuItemId'],
      rating: (map['rating'] ?? 0).toDouble(),
      comment: map['comment'] ?? '',
      createdAt: DateTime.parse(map['createdAt']),
      images: List<String>.from(map['images'] ?? []),
    );
  }
}
