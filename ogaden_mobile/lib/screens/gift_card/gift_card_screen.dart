import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:ogaden_mobile/constants/app_theme.dart';

class GiftCardScreen extends StatefulWidget {
  const GiftCardScreen({super.key});

  @override
  State<GiftCardScreen> createState() => _GiftCardScreenState();
}

class _GiftCardScreenState extends State<GiftCardScreen> {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final TextEditingController _codeController = TextEditingController();
  List<Map<String, dynamic>> _myCards = [];
  bool _isLoading = true;
  bool _isRedeeming = false;

  @override
  void initState() {
    super.initState();
    _loadMyCards();
  }

  Future<void> _loadMyCards() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      setState(() => _isLoading = false);
      return;
    }

    final snapshot = await _firestore
        .collection('giftCards')
        .where('redeemedBy', isEqualTo: user.uid)
        .get();

    setState(() {
      _myCards = snapshot.docs.map((doc) => doc.data()).toList();
      _isLoading = false;
    });
  }

  Future<void> _redeemGiftCard() async {
    final code = _codeController.text.trim();
    if (code.isEmpty) return;

    setState(() => _isRedeeming = true);

    try {
      final snapshot = await _firestore
          .collection('giftCards')
          .where('code', isEqualTo: code.toUpperCase())
          .limit(1)
          .get();

      if (snapshot.docs.isEmpty) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Invalid gift card code'), backgroundColor: Colors.red),
          );
        }
        setState(() => _isRedeeming = false);
        return;
      }

      final cardDoc = snapshot.docs.first;
      final cardData = cardDoc.data();

      if (cardData['status'] != 'active') {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Already redeemed'), backgroundColor: Colors.orange),
          );
        }
        setState(() => _isRedeeming = false);
        return;
      }

      final user = FirebaseAuth.instance.currentUser;
      if (user == null) return;

      await cardDoc.reference.update({
        'status': 'redeemed',
        'redeemedBy': user.uid,
        'redeemedAt': DateTime.now().toIso8601String(),
      });

      _codeController.clear();
      _loadMyCards();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('ETB ${cardData['amount']} added!'), backgroundColor: Colors.green),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
        );
      }
    }

    setState(() => _isRedeeming = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: AppDecorations.brandHeader,
        child: SafeArea(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(20),
                child: Row(
                  children: [
                    IconButton(icon: const Icon(Icons.arrow_back, color: Colors.white), onPressed: () => Navigator.pop(context)),
                    const SizedBox(width: 8),
                    const Text('🎁 Gift Cards', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
                  ],
                ),
              ),
              Expanded(
                child: Container(
                  decoration: const BoxDecoration(color: Colors.white, borderRadius: BorderRadius.only(topLeft: Radius.circular(30), topRight: Radius.circular(30))),
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            gradient: AppColors.brandGradient,
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [BoxShadow(color: AppColors.primary.withValues(alpha: 0.3), blurRadius: 15, offset: const Offset(0, 8))],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Redeem Gift Card', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
                              const SizedBox(height: 16),
                              TextField(
                                controller: _codeController,
                                decoration: InputDecoration(hintText: 'Enter gift card code', prefixIcon: const Icon(Icons.confirmation_number), filled: true, fillColor: Colors.white, border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none)),
                                textCapitalization: TextCapitalization.characters,
                              ),
                              const SizedBox(height: 16),
                              SizedBox(
                                width: double.infinity,
                                child: ElevatedButton(
                                  onPressed: _isRedeeming ? null : _redeemGiftCard,
                                  style: ElevatedButton.styleFrom(backgroundColor: Colors.white, foregroundColor: const Color(0xFFE8521A), padding: const EdgeInsets.symmetric(vertical: 14), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                                  child: _isRedeeming ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2)) : const Text('Redeem Code', style: TextStyle(fontWeight: FontWeight.bold)),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 24),
                        const Text('🎴 My Gift Cards', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 16),
                        if (_isLoading)
                          const Center(child: CircularProgressIndicator())
                        else if (_myCards.isEmpty)
                          Center(child: Column(children: [Icon(Icons.card_giftcard, size: 80, color: Colors.grey[300]), const SizedBox(height: 16), Text('No gift cards yet', style: TextStyle(color: Colors.grey[600]))]))
                        else
                          ..._myCards.map((card) => _GiftCardWidget(card: card)),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _codeController.dispose();
    super.dispose();
  }
}

class _GiftCardWidget extends StatelessWidget {
  final Map<String, dynamic> card;
  const _GiftCardWidget({required this.card});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [Color(0xFFE8521A), Color(0xFFD34513)], begin: Alignment.topLeft, end: Alignment.bottomRight),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: const Color(0xFFE8521A).withValues(alpha: 0.3), blurRadius: 15, offset: const Offset(0, 8))],
      ),
      child: Stack(
        children: [
          Positioned(right: -20, top: -20, child: Icon(Icons.card_giftcard, size: 120, color: Colors.white.withValues(alpha: 0.1))),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(12)), child: const Icon(Icons.card_giftcard, color: Colors.white, size: 32)),
                const SizedBox(width: 16),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('ETB ${card['amount']}', style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold)), Text(card['code'] ?? '', style: const TextStyle(color: Colors.white70, fontFamily: 'monospace', letterSpacing: 2))])),
                Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), shape: BoxShape.circle), child: const Icon(Icons.check, color: Colors.white)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
