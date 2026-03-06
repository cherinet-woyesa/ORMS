import 'package:flutter/material.dart';

/// Unified brand design system for Ogaden Restaurant mobile app.
class AppColors {
  AppColors._();

  // ── Brand Palette ──────────────────────────────────────────────────────────
  static const Color primary = Color(0xFFE8521A); // Warm orange-red
  static const Color primaryDark = Color(0xFFC43E0E);
  static const Color primaryLight = Color(0xFFFF7043);
  static const Color secondary = Color(0xFFFFA040); // Amber-orange accent

  // ── Gradients ──────────────────────────────────────────────────────────────
  static const LinearGradient brandGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFE8521A), Color(0xFFC43E0E)],
  );

  static const LinearGradient heroGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFE8521A), Color(0xFF8B1A00)],
  );

  // ── Neutrals ───────────────────────────────────────────────────────────────
  static const Color background = Color(0xFFF8F5F2);
  static const Color surface = Colors.white;
  static const Color cardSurface = Colors.white;

  static const Color textPrimary = Color(0xFF1C1C1E);
  static const Color textSecondary = Color(0xFF6B6B6B);
  static const Color textMuted = Color(0xFFAAAAAA);

  static const Color divider = Color(0xFFF0EAE4);
  static const Color border = Color(0xFFE8E0D8);

  // ── Status ─────────────────────────────────────────────────────────────────
  static const Color success = Color(0xFF34C759);
  static const Color warning = Color(0xFFFF9500);
  static const Color error = Color(0xFFFF3B30);
  static const Color info = Color(0xFF007AFF);

  // ── Order Status ───────────────────────────────────────────────────────────
  static Color statusColor(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return const Color(0xFFFF9500);
      case 'accepted':
        return const Color(0xFF007AFF);
      case 'preparing':
        return const Color(0xFFAF52DE);
      case 'ready':
        return const Color(0xFF34C759);
      case 'delivered':
        return const Color(0xFF34C759);
      case 'cancelled':
        return const Color(0xFFFF3B30);
      default:
        return const Color(0xFF8E8E93);
    }
  }
}

class AppTextStyles {
  AppTextStyles._();

  static const TextStyle displayLarge = TextStyle(
    fontSize: 32,
    fontWeight: FontWeight.w800,
    color: AppColors.textPrimary,
    letterSpacing: -0.5,
  );

  static const TextStyle headlineLarge = TextStyle(
    fontSize: 26,
    fontWeight: FontWeight.bold,
    color: AppColors.textPrimary,
    letterSpacing: -0.3,
  );

  static const TextStyle headlineMedium = TextStyle(
    fontSize: 22,
    fontWeight: FontWeight.bold,
    color: AppColors.textPrimary,
  );

  static const TextStyle titleLarge = TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.w700,
    color: AppColors.textPrimary,
  );

  static const TextStyle titleMedium = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
  );

  static const TextStyle bodyLarge = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.normal,
    color: AppColors.textPrimary,
  );

  static const TextStyle bodyMedium = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.normal,
    color: AppColors.textSecondary,
  );

  static const TextStyle bodySmall = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.normal,
    color: AppColors.textMuted,
  );

  static const TextStyle labelBold = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
  );
}

class AppDecorations {
  AppDecorations._();

  static BoxDecoration get card => BoxDecoration(
        color: AppColors.cardSurface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.07),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      );

  static BoxDecoration get cardLarge => BoxDecoration(
        color: AppColors.cardSurface,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.09),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      );

  static BoxDecoration get brandHeader => const BoxDecoration(
        gradient: AppColors.brandGradient,
      );

  static BoxDecoration get heroHeader => const BoxDecoration(
        gradient: AppColors.heroGradient,
      );

  static const BorderRadius cardRadius = BorderRadius.all(Radius.circular(16));
  static const BorderRadius cardRadiusLarge =
      BorderRadius.all(Radius.circular(20));

  static const BorderRadius sheetRadius = BorderRadius.only(
    topLeft: Radius.circular(30),
    topRight: Radius.circular(30),
  );
}

class AppSpacing {
  AppSpacing._();

  static const double xs = 4;
  static const double sm = 8;
  static const double md = 16;
  static const double lg = 24;
  static const double xl = 32;
  static const double xxl = 48;
}
