class Table {
  final String id;
  final int number;
  final int capacity;
  final String location;
  final bool isAvailable;
  final String restaurantId;

  Table({
    required this.id,
    required this.number,
    required this.capacity,
    this.location = 'Main Hall',
    this.isAvailable = true,
    required this.restaurantId,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'number': number,
      'capacity': capacity,
      'location': location,
      'isAvailable': isAvailable,
      'restaurantId': restaurantId,
    };
  }

  factory Table.fromMap(Map<String, dynamic> map) {
    return Table(
      id: map['id'] ?? '',
      number: map['number'] ?? 0,
      capacity: map['capacity'] ?? 2,
      location: map['location'] ?? 'Main Hall',
      isAvailable: map['isAvailable'] ?? true,
      restaurantId: map['restaurantId'] ?? '',
    );
  }

  String get capacityLabel {
    if (capacity <= 2) return 'Small';
    if (capacity <= 4) return 'Medium';
    if (capacity <= 6) return 'Large';
    return 'Extra Large';
  }

  String get capacityEmoji {
    if (capacity <= 2) return '🪑';
    if (capacity <= 4) return '🪑🪑';
    if (capacity <= 6) return '🪑🪑🪑';
    return '🪑🪑🪑🪑';
  }
}
