enum FavoriteType { restaurant, menuItem }

class Favorite {
  final String id;
  final String userId;
  final String itemId;
  final FavoriteType type;
  final DateTime createdAt;

  Favorite({
    required this.id,
    required this.userId,
    required this.itemId,
    required this.type,
    required this.createdAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'userId': userId,
      'itemId': itemId,
      'type': type.name,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory Favorite.fromMap(Map<String, dynamic> map) {
    return Favorite(
      id: map['id'] ?? '',
      userId: map['userId'] ?? '',
      itemId: map['itemId'] ?? '',
      type: FavoriteType.values.firstWhere(
        (e) => e.name == map['type'],
        orElse: () => FavoriteType.restaurant,
      ),
      createdAt: DateTime.parse(map['createdAt']),
    );
  }
}
