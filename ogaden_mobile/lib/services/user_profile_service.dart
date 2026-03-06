import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:ogaden_mobile/models/user_profile_model.dart';

class UserProfileService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  Future<UserProfile?> getUserProfile(String userId) async {
    final doc = await _firestore.collection('users').doc(userId).get();
    if (!doc.exists) return null;
    return UserProfile.fromMap(doc.data()!);
  }

  Future<void> createUserProfile(UserProfile profile) async {
    await _firestore.collection('users').doc(profile.id).set(profile.toMap());
  }

  Future<void> updateUserProfile(UserProfile profile) async {
    await _firestore.collection('users').doc(profile.id).update(profile.toMap());
  }

  Future<void> addLoyaltyPoints(String userId, int points) async {
    final doc = await _firestore.collection('users').doc(userId).get();
    if (!doc.exists) return;

    final currentPoints = doc.data()!['loyaltyPoints'] ?? 0;
    final newPoints = currentPoints + points;
    final newTier = UserProfile.calculateTier(newPoints);

    await _firestore.collection('users').doc(userId).update({
      'loyaltyPoints': newPoints,
      'loyaltyTier': newTier,
    });
  }

  Future<void> deductLoyaltyPoints(String userId, int points) async {
    final doc = await _firestore.collection('users').doc(userId).get();
    if (!doc.exists) return;

    final currentPoints = doc.data()!['loyaltyPoints'] ?? 0;
    final newPoints = (currentPoints - points).clamp(0, double.infinity).toInt();
    final newTier = UserProfile.calculateTier(newPoints);

    await _firestore.collection('users').doc(userId).update({
      'loyaltyPoints': newPoints,
      'loyaltyTier': newTier,
    });
  }

  Future<void> updateDietaryPreferences(String userId, List<String> preferences) async {
    await _firestore.collection('users').doc(userId).update({
      'dietaryPreferences': preferences,
    });
  }

  Future<void> updateAllergies(String userId, List<String> allergies) async {
    await _firestore.collection('users').doc(userId).update({
      'allergies': allergies,
    });
  }

  Stream<DocumentSnapshot> watchUserProfile(String userId) {
    return _firestore.collection('users').doc(userId).snapshots();
  }

  Future<int> getLoyaltyPoints(String userId) async {
    final doc = await _firestore.collection('users').doc(userId).get();
    return doc.data()?['loyaltyPoints'] ?? 0;
  }
}
