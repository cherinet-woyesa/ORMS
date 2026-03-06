import 'package:flutter/foundation.dart';
import 'package:ogaden_mobile/models/user_profile_model.dart';
import 'package:ogaden_mobile/services/user_profile_service.dart';

class UserProfileProvider extends ChangeNotifier {
  final UserProfileService _userProfileService = UserProfileService();
  
  UserProfile? _profile;
  bool _isLoading = false;

  UserProfile? get profile => _profile;
  bool get isLoading => _isLoading;

  int get loyaltyPoints => _profile?.loyaltyPoints ?? 0;
  String get loyaltyTier => _profile?.loyaltyTier ?? 'Bronze';
  List<String> get dietaryPreferences => _profile?.dietaryPreferences ?? [];
  List<String> get allergies => _profile?.allergies ?? [];

  Future<void> loadProfile(String userId) async {
    _isLoading = true;
    notifyListeners();

    try {
      _profile = await _userProfileService.getUserProfile(userId);
    } catch (e) {
      debugPrint('Error loading profile: $e');
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> updateProfile(UserProfile profile) async {
    try {
      await _userProfileService.updateUserProfile(profile);
      _profile = profile;
      notifyListeners();
    } catch (e) {
      debugPrint('Error updating profile: $e');
    }
  }

  Future<void> addLoyaltyPoints(int points) async {
    if (_profile == null) return;
    
    try {
      await _userProfileService.addLoyaltyPoints(_profile!.id, points);
      final newPoints = _profile!.loyaltyPoints + points;
      final newTier = UserProfile.calculateTier(newPoints);
      
      _profile = _profile!.copyWith(
        loyaltyPoints: newPoints,
        loyaltyTier: newTier,
      );
      notifyListeners();
    } catch (e) {
      debugPrint('Error adding loyalty points: $e');
    }
  }

  Future<void> redeemPoints(int points) async {
    if (_profile == null) return;
    if (_profile!.loyaltyPoints < points) return;

    try {
      await _userProfileService.deductLoyaltyPoints(_profile!.id, points);
      final newPoints = _profile!.loyaltyPoints - points;
      final newTier = UserProfile.calculateTier(newPoints);
      
      _profile = _profile!.copyWith(
        loyaltyPoints: newPoints,
        loyaltyTier: newTier,
      );
      notifyListeners();
    } catch (e) {
      debugPrint('Error redeeming points: $e');
    }
  }

  Future<void> updateDietaryPreferences(List<String> preferences) async {
    if (_profile == null) return;

    try {
      await _userProfileService.updateDietaryPreferences(_profile!.id, preferences);
      _profile = _profile!.copyWith(dietaryPreferences: preferences);
      notifyListeners();
    } catch (e) {
      debugPrint('Error updating dietary preferences: $e');
    }
  }

  Future<void> updateAllergies(List<String> allergies) async {
    if (_profile == null) return;

    try {
      await _userProfileService.updateAllergies(_profile!.id, allergies);
      _profile = _profile!.copyWith(allergies: allergies);
      notifyListeners();
    } catch (e) {
      debugPrint('Error updating allergies: $e');
    }
  }

  int get pointsToNextTier => UserProfile.pointsForNextTier(
    loyaltyTier, 
    loyaltyPoints,
  );

  double get progressToNextTier {
    if (loyaltyTier == 'Platinum') return 1.0;
    
    int currentTierMin;
    switch (loyaltyTier) {
      case 'Silver':
        currentTierMin = 500;
        break;
      case 'Gold':
        currentTierMin = 2000;
        break;
      case 'Platinum':
        currentTierMin = 5000;
        break;
      default:
        currentTierMin = 0;
    }
    
    int nextTierMin;
    switch (loyaltyTier) {
      case 'Bronze':
        nextTierMin = 500;
        break;
      case 'Silver':
        nextTierMin = 2000;
        break;
      case 'Gold':
        nextTierMin = 5000;
        break;
      default:
        return 1.0;
    }
    
    final progress = (loyaltyPoints - currentTierMin) / (nextTierMin - currentTierMin);
    return progress.clamp(0.0, 1.0);
  }
}
