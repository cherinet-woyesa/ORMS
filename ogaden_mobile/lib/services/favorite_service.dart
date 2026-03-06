import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:ogaden_mobile/models/favorite_model.dart';

class FavoriteService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  Future<List<Favorite>> getUserFavorites(String userId) async {
    final snapshot = await _firestore
        .collection('favorites')
        .where('userId', isEqualTo: userId)
        .get();
    return snapshot.docs.map((doc) => Favorite.fromMap(doc.data())).toList();
  }

  Future<bool> isFavorite(String userId, String itemId) async {
    final snapshot = await _firestore
        .collection('favorites')
        .where('userId', isEqualTo: userId)
        .where('itemId', isEqualTo: itemId)
        .get();
    return snapshot.docs.isNotEmpty;
  }

  Future<void> addFavorite(String userId, String itemId, FavoriteType type) async {
    final favorite = Favorite(
      id: '${userId}_$itemId',
      userId: userId,
      itemId: itemId,
      type: type,
      createdAt: DateTime.now(),
    );
    await _firestore.collection('favorites').doc(favorite.id).set(favorite.toMap());
  }

  Future<void> removeFavorite(String userId, String itemId) async {
    await _firestore.collection('favorites').doc('${userId}_$itemId').delete();
  }

  Future<void> toggleFavorite(String userId, String itemId, FavoriteType type) async {
    final isFav = await isFavorite(userId, itemId);
    if (isFav) {
      await removeFavorite(userId, itemId);
    } else {
      await addFavorite(userId, itemId, type);
    }
  }

  Stream<QuerySnapshot> watchUserFavorites(String userId) {
    return _firestore
        .collection('favorites')
        .where('userId', isEqualTo: userId)
        .snapshots();
  }
}
