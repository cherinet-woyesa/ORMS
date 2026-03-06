import 'package:flutter/material.dart';
import 'package:ogaden_mobile/l10n/app_localizations.dart';

class LanguageSelector extends StatelessWidget {
  final Function(Locale) onLocaleChanged;
  final Locale currentLocale;

  const LanguageSelector({
    super.key,
    required this.onLocaleChanged,
    required this.currentLocale,
  });

  @override
  Widget build(BuildContext context) {
    return PopupMenuButton<Locale>(
      icon: const Icon(Icons.language),
      tooltip: 'Select Language',
      onSelected: onLocaleChanged,
      itemBuilder: (context) => AppLocalizations.supportedLocales.map((locale) {
        return PopupMenuItem<Locale>(
          value: locale,
          child: Row(
            children: [
              if (locale.languageCode == currentLocale.languageCode)
                const Icon(Icons.check, size: 18)
              else
                const SizedBox(width: 18),
              const SizedBox(width: 8),
              Text(_getLanguageName(locale.languageCode)),
            ],
          ),
        );
      }).toList(),
    );
  }

  String _getLanguageName(String code) {
    switch (code) {
      case 'en':
        return 'English';
      case 'am':
        return 'አማርኛ';
      case 'so':
        return 'Soomaali';
      case 'ar':
        return 'العربية';
      default:
        return code;
    }
  }
}
