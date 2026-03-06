import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:ogaden_mobile/models/review_model.dart';

class ReviewService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  Future<List<Review>> getRestaurantReviews(String restaurantId) async {
    final snapshot = await _firestore
        .collection('reviews')
        .where('restaurantId', isEqualTo: restaurantId)
        .orderBy('createdAt', descending: true)
        .get();
    return snapshot.docs.map((doc) => Review.fromMap(doc.data())).toList();
  }

  Future<List<Review>> getMenuItemReviews(String menuItemId) async {
    final snapshot = await _firestore
        .collection('reviews')
        .where('menuItemId', isEqualTo: menuItemId)
        .orderBy('createdAt', descending: true)
        .get();
    return snapshot.docs.map((doc) => Review.fromMap(doc.data())).toList();
  }

  Future<List<Review>> getUserReviews(String userId) async {
    final snapshot = await _firestore
        .collection('reviews')
        .where('userId', isEqualTo: userId)
        .orderBy('createdAt', descending: true)
        .get();
    return snapshot.docs.map((doc) => Review.fromMap(doc.data())).toList();
  }

  Future<double> getAverageRating(String restaurantId) async {
    final snapshot = await _firestore
        .collection('reviews')
        .where('restaurantId', isEqualTo: restaurantId)
        .get();
    
    if (snapshot.docs.isEmpty) return 0.0;
    
    double totalRating = 0;
    for (var doc in snapshot.docs) {
      totalRating += (doc.data()['rating'] ?? 0).toDouble();
    }
    return totalRating / snapshot.docs.length;
  }

  Future<void> addReview(Review review) async {
    await _firestore.collection('reviews').doc(review.id).set(review.toMap());
    
    if (review.restaurantId != null) {
      await _updateRestaurantRating(review.restaurantId!);
    }
    if (review.menuItemId != null) {
      await _updateMenuItemRating(review.menuItemId!);
    }
  }

  Future<void> _updateRestaurantRating(String restaurantId) async {
    final avgRating = await getAverageRating(restaurantId);
    await _firestore.collection('restaurants').doc(restaurantId).update({
      'rating': avgRating,
    });
  }

  Future<void> _updateMenuItemRating(String menuItemId) async {
    final snapshot = await _firestore
        .collection('reviews')
        .where('menuItemId', isEqualTo: menuItemId)
        .get();
    
    if (snapshot.docs.isEmpty) return;
    
    double totalRating = 0;
    for (var doc in snapshot.docs) {
      totalRating += (doc.data()['rating'] ?? 0).toDouble();
    }
    final avgRating = totalRating / snapshot.docs.length;
    
    await _firestore.collection('menu_items').doc(menuItemId).update({
      'rating': avgRating,
      'reviewCount': snapshot.docs.length,
    });
  }

  Future<void> deleteReview(String reviewId, String? restaurantId, String? menuItemId) async {
    await _firestore.collection('reviews').doc(reviewId).delete();
    
    if (restaurantId != null) {
      await _updateRestaurantRating(restaurantId);
    }
    if (menuItemId != null) {
      await _updateMenuItemRating(menuItemId);
    }
  }

  Stream<QuerySnapshot> watchRestaurantReviews(String restaurantId) {
    return _firestore
        .collection('reviews')
        .where('restaurantId', isEqualTo: restaurantId)
        .orderBy('createdAt', descending: true)
        .snapshots();
  }
}
