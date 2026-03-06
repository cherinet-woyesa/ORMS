import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:ogaden_mobile/providers/user_profile_provider.dart';
import 'package:ogaden_mobile/constants/dietary_options.dart';

class DietaryPreferencesScreen extends StatefulWidget {
  const DietaryPreferencesScreen({super.key});

  @override
  State<DietaryPreferencesScreen> createState() => _DietaryPreferencesScreenState();
}

class _DietaryPreferencesScreenState extends State<DietaryPreferencesScreen> {
  late List<String> _selectedPreferences = [];
  late List<String> _selectedAllergies = [];

  @override
  void initState() {
    super.initState();
    final provider = context.read<UserProfileProvider>();
    _selectedPreferences = List.from(provider.dietaryPreferences);
    _selectedAllergies = List.from(provider.allergies);
  }

  void _savePreferences() {
    final provider = context.read<UserProfileProvider>();
    provider.updateDietaryPreferences(_selectedPreferences);
    provider.updateAllergies(_selectedAllergies);
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Preferences saved!'), backgroundColor: Colors.green));
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: LinearGradient(colors: [Color(0xFFE8521A), Color(0xFFD34513)], begin: Alignment.topLeft, end: Alignment.bottomRight)),
        child: SafeArea(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(20),
                child: Row(
                  children: [
                    IconButton(icon: const Icon(Icons.arrow_back, color: Colors.white), onPressed: () => Navigator.pop(context)),
                    const SizedBox(width: 8),
                    const Expanded(child: Text('Dietary Preferences', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white))),
                    TextButton(onPressed: _savePreferences, child: const Text('Save', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
                  ],
                ),
              ),
              Expanded(
                child: Container(
                  decoration: const BoxDecoration(color: Colors.white, borderRadius: BorderRadius.only(topLeft: Radius.circular(30), topRight: Radius.circular(30))),
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(20),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Container(padding: const EdgeInsets.all(20), decoration: BoxDecoration(color: const Color(0xFFE8521A).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(16)), child: const Row(children: [Icon(Icons.restaurant_menu, color: Color(0xFFE8521A)), SizedBox(width: 12), Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('Dietary Preferences', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)), SizedBox(height: 4), Text('Select your preferences to filter menu items', style: TextStyle(color: Colors.grey))]))])),
                      const SizedBox(height: 24),
                      Wrap(spacing: 10, runSpacing: 10, children: DietaryOptions.tags.map((tag) {
                        final isSelected = _selectedPreferences.contains(tag);
                        return FilterChip(label: Text(tag), selected: isSelected, selectedColor: const Color(0xFFE8521A).withValues(alpha: 0.2), checkmarkColor: const Color(0xFFE8521A), onSelected: (selected) => setState(() => selected ? _selectedPreferences.add(tag) : _selectedPreferences.remove(tag)));
                      }).toList()),
                      const SizedBox(height: 32),
                      Container(padding: const EdgeInsets.all(20), decoration: BoxDecoration(color: Colors.red.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(16)), child: const Row(children: [Icon(Icons.warning_amber, color: Colors.red), SizedBox(width: 12), Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('Allergies', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)), SizedBox(height: 4), Text('We\'ll warn you about items containing these', style: TextStyle(color: Colors.grey))]))])),
                      const SizedBox(height: 24),
                      Wrap(spacing: 10, runSpacing: 10, children: DietaryOptions.allergies.map((allergy) {
                        final isSelected = _selectedAllergies.contains(allergy);
                        return FilterChip(label: Text(allergy), selected: isSelected, selectedColor: Colors.red.withValues(alpha: 0.2), checkmarkColor: Colors.red, onSelected: (selected) => setState(() => selected ? _selectedAllergies.add(allergy) : _selectedAllergies.remove(allergy)));
                      }).toList()),
                      if (_selectedAllergies.isNotEmpty) ...[
                        const SizedBox(height: 24),
                        Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: Colors.red.shade50, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.red.shade200)), child: const Row(children: [Icon(Icons.info, color: Colors.red), SizedBox(width: 12), Expanded(child: Text('You\'ll receive warnings when ordering items containing your selected allergies', style: TextStyle(color: Colors.red)))])),
                      ],
                    ]),
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
