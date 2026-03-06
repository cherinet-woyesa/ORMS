enum OrderStatus {
  pending,
  confirmed,
  preparing,
  readyForPickup,
  outForDelivery,
  delivered,
  cancelled,
}

enum OrderType {
  pickup,
  delivery,
  dineIn,
}

class Order {
  final String id;
  final String userId;
  final String restaurantId;
  final String restaurantName;
  final List<OrderItem> items;
  final double subtotal;
  final double deliveryFee;
  final double total;
  final OrderStatus status;
  final OrderType orderType;
  final DateTime createdAt;
  final DateTime? scheduledFor;
  final String? deliveryAddress;
  final double? deliveryLat;
  final double? deliveryLng;
  final String? driverName;
  final String? driverPhone;
  final int loyaltyPointsEarned;
  final String? promoCode;
  final double discount;

  Order({
    required this.id,
    required this.userId,
    required this.restaurantId,
    required this.restaurantName,
    required this.items,
    required this.subtotal,
    this.deliveryFee = 0.0,
    required this.total,
    this.status = OrderStatus.pending,
    this.orderType = OrderType.pickup,
    required this.createdAt,
    this.scheduledFor,
    this.deliveryAddress,
    this.deliveryLat,
    this.deliveryLng,
    this.driverName,
    this.driverPhone,
    this.loyaltyPointsEarned = 0,
    this.promoCode,
    this.discount = 0.0,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'userId': userId,
      'restaurantId': restaurantId,
      'restaurantName': restaurantName,
      'items': items.map((e) => e.toMap()).toList(),
      'subtotal': subtotal,
      'deliveryFee': deliveryFee,
      'total': total,
      'status': status.name,
      'orderType': orderType.name,
      'createdAt': createdAt.toIso8601String(),
      'scheduledFor': scheduledFor?.toIso8601String(),
      'deliveryAddress': deliveryAddress,
      'deliveryLat': deliveryLat,
      'deliveryLng': deliveryLng,
      'driverName': driverName,
      'driverPhone': driverPhone,
      'loyaltyPointsEarned': loyaltyPointsEarned,
      'promoCode': promoCode,
      'discount': discount,
    };
  }

  factory Order.fromMap(Map<String, dynamic> map) {
    return Order(
      id: map['id'] ?? '',
      userId: map['userId'] ?? '',
      restaurantId: map['restaurantId'] ?? '',
      restaurantName: map['restaurantName'] ?? '',
      items: (map['items'] as List?)
              ?.map((e) => OrderItem.fromMap(e))
              .toList() ??
          [],
      subtotal: (map['subtotal'] ?? 0).toDouble(),
      deliveryFee: (map['deliveryFee'] ?? 0).toDouble(),
      total: (map['total'] ?? 0).toDouble(),
      status: OrderStatus.values.firstWhere(
        (e) => e.name == map['status'],
        orElse: () => OrderStatus.pending,
      ),
      orderType: OrderType.values.firstWhere(
        (e) => e.name == map['orderType'],
        orElse: () => OrderType.pickup,
      ),
      createdAt: DateTime.parse(map['createdAt']),
      scheduledFor: map['scheduledFor'] != null
          ? DateTime.parse(map['scheduledFor'])
          : null,
      deliveryAddress: map['deliveryAddress'],
      deliveryLat: map['deliveryLat']?.toDouble(),
      deliveryLng: map['deliveryLng']?.toDouble(),
      driverName: map['driverName'],
      driverPhone: map['driverPhone'],
      loyaltyPointsEarned: map['loyaltyPointsEarned'] ?? 0,
      promoCode: map['promoCode'],
      discount: (map['discount'] ?? 0).toDouble(),
    );
  }

  Order copyWith({
    String? id,
    String? userId,
    String? restaurantId,
    String? restaurantName,
    List<OrderItem>? items,
    double? subtotal,
    double? deliveryFee,
    double? total,
    OrderStatus? status,
    OrderType? orderType,
    DateTime? createdAt,
    DateTime? scheduledFor,
    String? deliveryAddress,
    double? deliveryLat,
    double? deliveryLng,
    String? driverName,
    String? driverPhone,
    int? loyaltyPointsEarned,
    String? promoCode,
    double? discount,
  }) {
    return Order(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      restaurantId: restaurantId ?? this.restaurantId,
      restaurantName: restaurantName ?? this.restaurantName,
      items: items ?? this.items,
      subtotal: subtotal ?? this.subtotal,
      deliveryFee: deliveryFee ?? this.deliveryFee,
      total: total ?? this.total,
      status: status ?? this.status,
      orderType: orderType ?? this.orderType,
      createdAt: createdAt ?? this.createdAt,
      scheduledFor: scheduledFor ?? this.scheduledFor,
      deliveryAddress: deliveryAddress ?? this.deliveryAddress,
      deliveryLat: deliveryLat ?? this.deliveryLat,
      deliveryLng: deliveryLng ?? this.deliveryLng,
      driverName: driverName ?? this.driverName,
      driverPhone: driverPhone ?? this.driverPhone,
      loyaltyPointsEarned: loyaltyPointsEarned ?? this.loyaltyPointsEarned,
      promoCode: promoCode ?? this.promoCode,
      discount: discount ?? this.discount,
    );
  }

  bool get isScheduled => scheduledFor != null && scheduledFor!.isAfter(DateTime.now());
  
  bool get isDelivery => orderType == OrderType.delivery;
}

class OrderItem {
  final String menuItemId;
  final String name;
  final int quantity;
  final double price;
  final List<String>? customizations;

  OrderItem({
    required this.menuItemId,
    required this.name,
    required this.quantity,
    required this.price,
    this.customizations,
  });

  Map<String, dynamic> toMap() {
    return {
      'menuItemId': menuItemId,
      'name': name,
      'quantity': quantity,
      'price': price,
      'customizations': customizations,
    };
  }

  factory OrderItem.fromMap(Map<String, dynamic> map) {
    return OrderItem(
      menuItemId: map['menuItemId'] ?? '',
      name: map['name'] ?? '',
      quantity: map['quantity'] ?? 1,
      price: (map['price'] ?? 0).toDouble(),
      customizations: map['customizations'] != null
          ? List<String>.from(map['customizations'])
          : null,
    );
  }

  double get total => price * quantity;
}
