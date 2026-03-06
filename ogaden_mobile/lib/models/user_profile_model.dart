class UserProfile {
  final String id;
  final String email;
  final String name;
  final String phone;
  final String? profileImageUrl;
  final int loyaltyPoints;
  final String loyaltyTier;
  final List<String> dietaryPreferences;
  final List<String> allergies;
  final DateTime createdAt;

  UserProfile({
    required this.id,
    required this.email,
    required this.name,
    this.phone = '',
    this.profileImageUrl,
    this.loyaltyPoints = 0,
    this.loyaltyTier = 'Bronze',
    this.dietaryPreferences = const [],
    this.allergies = const [],
    required this.createdAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'phone': phone,
      'profileImageUrl': profileImageUrl,
      'loyaltyPoints': loyaltyPoints,
      'loyaltyTier': loyaltyTier,
      'dietaryPreferences': dietaryPreferences,
      'allergies': allergies,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory UserProfile.fromMap(Map<String, dynamic> map) {
    return UserProfile(
      id: map['id'] ?? '',
      email: map['email'] ?? '',
      name: map['name'] ?? '',
      phone: map['phone'] ?? '',
      profileImageUrl: map['profileImageUrl'],
      loyaltyPoints: map['loyaltyPoints'] ?? 0,
      loyaltyTier: map['loyaltyTier'] ?? 'Bronze',
      dietaryPreferences: List<String>.from(map['dietaryPreferences'] ?? []),
      allergies: List<String>.from(map['allergies'] ?? []),
      createdAt: map['createdAt'] != null 
          ? DateTime.parse(map['createdAt']) 
          : DateTime.now(),
    );
  }

  UserProfile copyWith({
    String? id,
    String? email,
    String? name,
    String? phone,
    String? profileImageUrl,
    int? loyaltyPoints,
    String? loyaltyTier,
    List<String>? dietaryPreferences,
    List<String>? allergies,
    DateTime? createdAt,
  }) {
    return UserProfile(
      id: id ?? this.id,
      email: email ?? this.email,
      name: name ?? this.name,
      phone: phone ?? this.phone,
      profileImageUrl: profileImageUrl ?? this.profileImageUrl,
      loyaltyPoints: loyaltyPoints ?? this.loyaltyPoints,
      loyaltyTier: loyaltyTier ?? this.loyaltyTier,
      dietaryPreferences: dietaryPreferences ?? this.dietaryPreferences,
      allergies: allergies ?? this.allergies,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  static String calculateTier(int points) {
    if (points >= 5000) return 'Platinum';
    if (points >= 2000) return 'Gold';
    if (points >= 500) return 'Silver';
    return 'Bronze';
  }

  static int pointsForNextTier(String currentTier, int currentPoints) {
    switch (currentTier) {
      case 'Bronze':
        return 500 - currentPoints;
      case 'Silver':
        return 2000 - currentPoints;
      case 'Gold':
        return 5000 - currentPoints;
      case 'Platinum':
        return 0;
      default:
        return 500 - currentPoints;
    }
  }
}
