import 'package:flutter/material.dart';
import 'package:ogaden_mobile/constants/app_theme.dart';

class ConfirmationScreen extends StatelessWidget {
  const ConfirmationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: AppDecorations.brandHeader,
        child: SafeArea(
          child: Column(
            children: [
              const Spacer(),
              Container(
                margin: const EdgeInsets.all(40),
                padding: const EdgeInsets.all(30),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(30), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 20, offset: const Offset(0, 10))]),
                child: Column(
                  children: [
                    Container(padding: const EdgeInsets.all(20), decoration: BoxDecoration(color: Colors.green.withValues(alpha: 0.1), shape: BoxShape.circle), child: const Icon(Icons.check_circle, color: Colors.green, size: 80)),
                    const SizedBox(height: 24),
                    const Text("Order Confirmed!", style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),
                    Text("Your order has been placed successfully!", style: TextStyle(fontSize: 16, color: Colors.grey[600]), textAlign: TextAlign.center),
                    const SizedBox(height: 8),
                    Text("You will receive a notification when your order is ready.", style: TextStyle(color: Colors.grey[500]), textAlign: TextAlign.center),
                    const SizedBox(height: 32),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () => Navigator.popUntil(context, (route) => route.isFirst),
                        style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                        child: const Text("Back to Home", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      ),
                    ),
                  ],
                ),
              ),
              const Spacer(),
            ],
          ),
        ),
      ),
    );
  }
}
