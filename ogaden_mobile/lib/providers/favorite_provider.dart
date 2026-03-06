import 'package:flutter/foundation.dart';
import 'package:ogaden_mobile/models/favorite_model.dart';
import 'package:ogaden_mobile/services/favorite_service.dart';

class FavoriteProvider extends ChangeNotifier {
  final FavoriteService _favoriteService = FavoriteService();
  
  List<Favorite> _favorites = [];
  Set<String> _favoriteIds = {};
  bool _isLoading = false;

  List<Favorite> get favorites => _favorites;
  bool get isLoading => _isLoading;

  bool isFavorite(String itemId) => _favoriteIds.contains(itemId);

  Future<void> loadFavorites(String userId) async {
    _isLoading = true;
    notifyListeners();

    try {
      _favorites = await _favoriteService.getUserFavorites(userId);
      _favoriteIds = _favorites.map((f) => f.itemId).toSet();
    } catch (e) {
      debugPrint('Error loading favorites: $e');
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> toggleFavorite(String userId, String itemId, FavoriteType type) async {
    try {
      await _favoriteService.toggleFavorite(userId, itemId, type);
      
      if (_favoriteIds.contains(itemId)) {
        _favoriteIds.remove(itemId);
        _favorites.removeWhere((f) => f.itemId == itemId);
      } else {
        _favoriteIds.add(itemId);
        _favorites.add(Favorite(
          id: '${userId}_$itemId',
          userId: userId,
          itemId: itemId,
          type: type,
          createdAt: DateTime.now(),
        ));
      }
      notifyListeners();
    } catch (e) {
      debugPrint('Error toggling favorite: $e');
    }
  }

  List<Favorite> getFavoriteRestaurants() {
    return _favorites.where((f) => f.type == FavoriteType.restaurant).toList();
  }

  List<Favorite> getFavoriteMenuItems() {
    return _favorites.where((f) => f.type == FavoriteType.menuItem).toList();
  }
}
