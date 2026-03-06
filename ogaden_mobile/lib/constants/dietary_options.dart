class DietaryOptions {
  static const List<String> tags = [
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Halal',
    'Kosher',
    'Dairy-Free',
    'Nut-Free',
    'Egg-Free',
    'Low-Carb',
    'Keto',
    'Paleo',
  ];

  static const List<String> allergies = [
    'Peanuts',
    'Tree Nuts',
    'Milk',
    'Eggs',
    'Wheat',
    'Soy',
    'Fish',
    'Shellfish',
    'Sesame',
    'Gluten',
  ];

  static const Map<String, String> tagDescriptions = {
    'Vegetarian': 'No meat or fish',
    'Vegan': 'No animal products',
    'Gluten-Free': 'No gluten ingredients',
    'Halal': 'Islamic dietary law',
    'Kosher': 'Jewish dietary law',
    'Dairy-Free': 'No dairy products',
    'Nut-Free': 'No nut ingredients',
    'Egg-Free': 'No egg ingredients',
    'Low-Carb': 'Reduced carbohydrates',
    'Keto': 'Very low carb, high fat',
    'Paleo': 'Whole foods diet',
  };
}

class LoyaltyTiers {
  static const Map<String, Map<String, dynamic>> tiers = {
    'Bronze': {
      'minPoints': 0,
      'discount': 0,
      'color': 0xFFCD7F32,
    },
    'Silver': {
      'minPoints': 500,
      'discount': 5,
      'color': 0xFFC0C0C0,
    },
    'Gold': {
      'minPoints': 2000,
      'discount': 10,
      'color': 0xFFFFD700,
    },
    'Platinum': {
      'minPoints': 5000,
      'discount': 15,
      'color': 0xFFE5E4E2,
    },
  };

  static int getPointsPerDollar() => 1;
  
  static int pointsForDiscount(int discountAmount) {
    return discountAmount * 10;
  }
}
