import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:ogaden_mobile/providers/user_profile_provider.dart';
import 'package:ogaden_mobile/constants/dietary_options.dart';

class LoyaltyScreen extends StatelessWidget {
  const LoyaltyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFFE8521A), Color(0xFFD34513)],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(20.0),
                child: Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.arrow_back, color: Colors.white),
                      onPressed: () => Navigator.pop(context),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      '🎁 Rewards & Loyalty',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Container(
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(30),
                      topRight: Radius.circular(30),
                    ),
                  ),
                  child: Consumer<UserProfileProvider>(
                    builder: (context, provider, child) {
                      if (provider.isLoading) {
                        return const Center(child: CircularProgressIndicator());
                      }

                      final profile = provider.profile;
                      if (profile == null) {
                        return Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.lock_outline,
                                size: 64,
                                color: Colors.grey[300],
                              ),
                              const SizedBox(height: 16),
                              Text(
                                "Please log in to view your rewards",
                                style: TextStyle(
                                  color: Colors.grey[600],
                                  fontSize: 16,
                                ),
                              ),
                            ],
                          ),
                        );
                      }

                      return SingleChildScrollView(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _LoyaltyCard(
                              tier: profile.loyaltyTier,
                              points: profile.loyaltyPoints,
                              progress: provider.progressToNextTier,
                              pointsToNextTier: provider.pointsToNextTier,
                            ),
                            const SizedBox(height: 24),
                            const Text(
                              '🎯 Available Rewards',
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 12),
                            _RewardsSection(points: profile.loyaltyPoints),
                            const SizedBox(height: 24),
                            const Text(
                              '💰 How to Earn Points',
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 12),
                            _HowToEarnSection(),
                            const SizedBox(height: 24),
                            const Text(
                              '⭐ Tier Benefits',
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 12),
                            _TierBenefitsSection(currentTier: profile.loyaltyTier),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _LoyaltyCard extends StatelessWidget {
  final String tier;
  final int points;
  final double progress;
  final int pointsToNextTier;

  const _LoyaltyCard({
    required this.tier,
    required this.points,
    required this.progress,
    required this.pointsToNextTier,
  });

  Color get _tierColor {
    switch (tier) {
      case 'Platinum':
        return const Color(0xFFE8521A);
      case 'Gold':
        return const Color(0xFFFFD700);
      case 'Silver':
        return const Color(0xFFC0C0C0);
      default:
        return const Color(0xFFCD7F32);
    }
  }

  IconData get _tierIcon {
    switch (tier) {
      case 'Platinum':
        return Icons.diamond;
      case 'Gold':
        return Icons.workspace_premium;
      case 'Silver':
        return Icons.military_tech;
      default:
        return Icons.workspace_premium;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [_tierColor, _tierColor.withOpacity(0.7)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: _tierColor.withOpacity(0.3),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(_tierIcon, color: Colors.white, size: 28),
                      const SizedBox(width: 8),
                      Text(
                        tier,
                        style: const TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                  const Text(
                    'Member',
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(25),
                ),
                child: Column(
                  children: [
                    Text(
                      '$points',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: _tierColor,
                      ),
                    ),
                    Text(
                      'points',
                      style: TextStyle(
                        fontSize: 12,
                        color: _tierColor,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          if (tier != 'Platinum') ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Progress to next tier',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.8),
                    fontSize: 14,
                  ),
                ),
                Text(
                  '$pointsToNextTier pts to go',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w500,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: LinearProgressIndicator(
                value: progress,
                backgroundColor: Colors.white30,
                valueColor: const AlwaysStoppedAnimation(Colors.white),
                minHeight: 10,
              ),
            ),
          ] else ...[
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.celebration, color: Colors.white),
                  SizedBox(width: 8),
                  Text(
                    'You have reached the highest tier!',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _RewardsSection extends StatelessWidget {
  final int points;

  const _RewardsSection({required this.points});

  @override
  Widget build(BuildContext context) {
    final rewards = [
      {'name': 'ETB 50 Off', 'points': 500, 'icon': Icons.local_offer, 'color': Colors.green},
      {'name': 'ETB 100 Off', 'points': 1000, 'icon': Icons.local_offer, 'color': Colors.green},
      {'name': 'Free Delivery', 'points': 300, 'icon': Icons.delivery_dining, 'color': Colors.blue},
      {'name': 'Free Item', 'points': 1500, 'icon': Icons.fastfood, 'color': Colors.orange},
    ];

    return Column(
      children: rewards.map((reward) {
        final rewardPoints = reward['points'] as int;
        final canRedeem = points >= rewardPoints;
        final rewardColor = reward['color'] as Color;

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: canRedeem ? rewardColor.withOpacity(0.3) : Colors.grey[200]!,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.03),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: rewardColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  reward['icon'] as IconData,
                  color: rewardColor,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      reward['name'] as String,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    Text(
                      '${rewardPoints} points',
                      style: TextStyle(
                        color: Colors.grey[600],
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
              ElevatedButton(
                onPressed: canRedeem
                    ? () => _redeemReward(context, rewardPoints, reward['name'] as String)
                    : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: canRedeem ? rewardColor : Colors.grey[300],
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: Text(
                  canRedeem ? 'Redeem' : 'Locked',
                  style: TextStyle(
                    color: canRedeem ? Colors.white : Colors.grey[600],
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  void _redeemReward(BuildContext context, int points, String rewardName) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Redeem Reward'),
        content: Text('This will deduct $points points from your account for "$rewardName".'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Cancel"),
          ),
          ElevatedButton(
            onPressed: () {
              context.read<UserProfileProvider>().redeemPoints(points);
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('$rewardName redeemed successfully! 🎉'),
                  backgroundColor: Colors.green,
                ),
              );
            },
            child: const Text("Confirm"),
          ),
        ],
      ),
    );
  }
}

class _HowToEarnSection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          _EarnRow(
            icon: Icons.restaurant,
            text: 'ETB 1 spent = 1 point',
            color: const Color(0xFFE8521A),
          ),
          const Divider(height: 24),
          _EarnRow(
            icon: Icons.star,
            text: 'Write a review = 10 points',
            color: Colors.amber,
          ),
          const Divider(height: 24),
          _EarnRow(
            icon: Icons.card_giftcard,
            text: 'Refer a friend = 100 points',
            color: Colors.green,
          ),
        ],
      ),
    );
  }
}

class _EarnRow extends StatelessWidget {
  final IconData icon;
  final String text;
  final Color color;

  const _EarnRow({required this.icon, required this.text, required this.color});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: color, size: 20),
        ),
        const SizedBox(width: 16),
        Text(
          text,
          style: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}

class _TierBenefitsSection extends StatelessWidget {
  final String currentTier;

  const _TierBenefitsSection({required this.currentTier});

  @override
  Widget build(BuildContext context) {
    final tiers = LoyaltyTiers.tiers;

    return Column(
      children: tiers.entries.map((entry) {
        final tierName = entry.key;
        final tierData = entry.value;
        final tierIndex = ['Bronze', 'Silver', 'Gold', 'Platinum'].indexOf(tierName);
        final currentIndex = ['Bronze', 'Silver', 'Gold', 'Platinum'].indexOf(currentTier);
        final isUnlocked = tierIndex <= currentIndex;

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isUnlocked ? tierData['color'] as Color : Colors.grey[100],
            borderRadius: BorderRadius.circular(16),
            border: isUnlocked
                ? null
                : Border.all(color: Colors.grey[300]!),
          ),
          child: Row(
            children: [
              Icon(
                isUnlocked ? Icons.check_circle : Icons.lock,
                color: isUnlocked ? Colors.white : Colors.grey,
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      tierName,
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        color: isUnlocked ? Colors.white : Colors.grey[700],
                      ),
                    ),
                    Text(
                      '${tierData['discount']}% discount on orders',
                      style: TextStyle(
                        fontSize: 13,
                        color: isUnlocked ? Colors.white70 : Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),
              if (isUnlocked && tierName == currentTier)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Text(
                    'CURRENT',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 10,
                    ),
                  ),
                ),
            ],
          ),
        );
      }).toList(),
    );
  }
}
