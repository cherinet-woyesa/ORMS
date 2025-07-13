import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

class ReservationScreen extends StatefulWidget {
  const ReservationScreen({Key? key}) : super(key: key);

  @override
  State<ReservationScreen> createState() => _ReservationScreenState();
}

class _ReservationScreenState extends State<ReservationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _noteController = TextEditingController();
  int _people = 1;
  DateTime? _selectedDate;
  TimeOfDay? _selectedTime;

  bool _loading = false;

  Future<void> _pickDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime.now().add(Duration(days: 1)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(Duration(days: 365)),
    );

    if (date != null) {
      setState(() {
        _selectedDate = date;
      });
    }
  }

  Future<void> _pickTime() async {
    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.now(),
    );

    if (time != null) {
      setState(() {
        _selectedTime = time;
      });
    }
  }

  Future<void> _submitReservation() async {
    if (!_formKey.currentState!.validate() ||
        _selectedDate == null ||
        _selectedTime == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text("Please fill in all required fields"),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }
    Navigator.pushNamedAndRemoveUntil(
      context,
      '/reservation-success',
      (route) => false,
    );

    setState(() => _loading = true);

    try {
      final DateTime fullDateTime = DateTime(
        _selectedDate!.year,
        _selectedDate!.month,
        _selectedDate!.day,
        _selectedTime!.hour,
        _selectedTime!.minute,
      );

      await FirebaseFirestore.instance.collection('reservations').add({
        'name': _nameController.text.trim(),
        'email': _emailController.text.trim(),
        'people': _people,
        'note': _noteController.text.trim(),
        'date': "${_selectedDate!.toIso8601String().split("T").first}",
        'time': _selectedTime!.format(context),
        'status': 'pending',
        'createdAt': Timestamp.now(),
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text("Reservation submitted!"),
          backgroundColor: Colors.green,
        ),
      );

      _formKey.currentState!.reset();
      setState(() {
        _people = 1;
        _selectedDate = null;
        _selectedTime = null;
      });
    } catch (e) {
      print("Error: $e");
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text("Failed to submit reservation"),
          backgroundColor: Colors.red,
        ),
      );
    }

    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Reserve a Table")),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              Text(
                "Fill out the form below to reserve a table.",
                style: TextStyle(fontSize: 16),
              ),
              SizedBox(height: 20),
              TextFormField(
                controller: _nameController,
                decoration: InputDecoration(labelText: "Your Name"),
                validator: (val) =>
                    val == null || val.isEmpty ? "Enter name" : null,
              ),
              SizedBox(height: 12),
              TextFormField(
                controller: _emailController,
                decoration: InputDecoration(labelText: "Email Address"),
                validator: (val) => val == null || !val.contains("@")
                    ? "Enter valid email"
                    : null,
              ),
              SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: _pickDate,
                      icon: Icon(Icons.calendar_today),
                      label: Text(
                        _selectedDate == null
                            ? "Pick Date"
                            : "${_selectedDate!.toLocal()}".split(" ")[0],
                      ),
                    ),
                  ),
                  SizedBox(width: 10),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: _pickTime,
                      icon: Icon(Icons.access_time),
                      label: Text(
                        _selectedTime == null
                            ? "Pick Time"
                            : _selectedTime!.format(context),
                      ),
                    ),
                  ),
                ],
              ),
              SizedBox(height: 12),
              Row(
                children: [
                  Text("People:"),
                  SizedBox(width: 20),
                  DropdownButton<int>(
                    value: _people,
                    items: List.generate(10, (index) => index + 1)
                        .map(
                          (num) =>
                              DropdownMenuItem(value: num, child: Text("$num")),
                        )
                        .toList(),
                    onChanged: (val) => setState(() => _people = val!),
                  ),
                ],
              ),
              SizedBox(height: 12),
              TextFormField(
                controller: _noteController,
                decoration: InputDecoration(
                  labelText: "Special Notes (optional)",
                ),
                maxLines: 2,
              ),
              SizedBox(height: 20),
              ElevatedButton.icon(
                icon: Icon(Icons.send),
                label: Text(_loading ? "Submitting..." : "Submit Reservation"),
                onPressed: _loading ? null : _submitReservation,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
