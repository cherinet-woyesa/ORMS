import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:ogaden_mobile/constants/app_theme.dart';
import 'package:ogaden_mobile/models/table_model.dart' as models;

class TableSelector extends StatefulWidget {
  final String restaurantId;
  final Function(models.Table?) onTableSelected;
  final models.Table? selectedTable;

  const TableSelector({
    super.key,
    required this.restaurantId,
    required this.onTableSelected,
    this.selectedTable,
  });

  @override
  State<TableSelector> createState() => _TableSelectorState();
}

class _TableSelectorState extends State<TableSelector> {
  List<models.Table> _tables = [];
  bool _isLoading = true;
  String? _selectedLocation;

  final List<String> _locations = ['Main Hall', 'Outdoor', 'VIP Room', 'Private'];

  @override
  void initState() {
    super.initState();
    _loadTables();
  }

  Future<void> _loadTables() async {
    setState(() => _isLoading = true);

    try {
      final snapshot = await FirebaseFirestore.instance
          .collection('tables')
          .where('restaurantId', isEqualTo: widget.restaurantId)
          .get();

      if (snapshot.docs.isNotEmpty) {
        _tables = snapshot.docs
            .map((doc) => models.Table.fromMap({...doc.data(), 'id': doc.id}))
            .toList();
      } else {
        _tables = _getDefaultTables();
      }
    } catch (e) {
      _tables = _getDefaultTables();
    }

    setState(() => _isLoading = false);
  }

  List<models.Table> _getDefaultTables() {
    return [
      models.Table(id: '1', number: 1, capacity: 2, location: 'Main Hall', restaurantId: widget.restaurantId),
      models.Table(id: '2', number: 2, capacity: 2, location: 'Main Hall', restaurantId: widget.restaurantId),
      models.Table(id: '3', number: 3, capacity: 4, location: 'Main Hall', restaurantId: widget.restaurantId),
      models.Table(id: '4', number: 4, capacity: 4, location: 'Main Hall', restaurantId: widget.restaurantId),
      models.Table(id: '5', number: 5, capacity: 6, location: 'Main Hall', restaurantId: widget.restaurantId),
      models.Table(id: '6', number: 6, capacity: 2, location: 'Outdoor', restaurantId: widget.restaurantId),
      models.Table(id: '7', number: 7, capacity: 4, location: 'Outdoor', restaurantId: widget.restaurantId),
      models.Table(id: '8', number: 8, capacity: 6, location: 'VIP Room', restaurantId: widget.restaurantId),
      models.Table(id: '9', number: 9, capacity: 8, location: 'VIP Room', restaurantId: widget.restaurantId),
      models.Table(id: '10', number: 10, capacity: 10, location: 'Private', restaurantId: widget.restaurantId),
    ];
  }

  List<models.Table> get _filteredTables {
    if (_selectedLocation == null) return _tables;
    return _tables.where((t) => t.location == _selectedLocation).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Select Table',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        
        // Location filter
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              _LocationChip(
                label: 'All',
                isSelected: _selectedLocation == null,
                onTap: () => setState(() => _selectedLocation = null),
              ),
              ..._locations.map((loc) => _LocationChip(
                label: loc,
                isSelected: _selectedLocation == loc,
                onTap: () => setState(() => _selectedLocation = loc),
              )),
            ],
          ),
        ),
        const SizedBox(height: 16),

        if (_isLoading)
          const Center(child: CircularProgressIndicator())
        else
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              childAspectRatio: 0.9,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
            ),
            itemCount: _filteredTables.length,
            itemBuilder: (context, index) {
              final table = _filteredTables[index];
              final isSelected = widget.selectedTable?.id == table.id;
              return _TableCard(
                table: table,
                isSelected: isSelected,
                onTap: () {
                  widget.onTableSelected(isSelected ? null : table);
                },
              );
            },
          ),
      ],
    );
  }
}

class _LocationChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _LocationChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : AppColors.background,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : AppColors.textSecondary,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
            fontSize: 13,
          ),
        ),
      ),
    );
  }
}

class _TableCard extends StatelessWidget {
  final models.Table table;
  final bool isSelected;
  final VoidCallback onTap;

  const _TableCard({
    required this.table,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary.withOpacity(0.1) : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppColors.primary.withOpacity(0.2),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              table.capacityEmoji,
              style: const TextStyle(fontSize: 24),
            ),
            const SizedBox(height: 4),
            Text(
              'Table ${table.number}',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                color: isSelected ? AppColors.primary : AppColors.textPrimary,
              ),
            ),
            Text(
              '${table.capacity} seats',
              style: TextStyle(
                fontSize: 12,
                color: AppColors.textMuted,
              ),
            ),
            if (isSelected)
              Container(
                margin: const EdgeInsets.only(top: 4),
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Text(
                  'Selected',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
