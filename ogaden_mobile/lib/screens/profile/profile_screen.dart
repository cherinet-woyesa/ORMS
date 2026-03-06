import 'dart:io';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  final user = FirebaseAuth.instance.currentUser;
  final db = FirebaseFirestore.instance;

  late TextEditingController nameController;
  late TextEditingController phoneController;
  String email = '';
  String? photoUrl;
  String language = 'en';
  bool notificationsEnabled = true;
  bool loading = false;
  File? _imageFile;

  @override
  void initState() {
    super.initState();
    nameController = TextEditingController();
    phoneController = TextEditingController();
    loadUserProfile();
  }

  @override
  void dispose() {
    nameController.dispose();
    phoneController.dispose();
    super.dispose();
  }

  Future<void> loadUserProfile() async {
    final doc = await db.collection("users").doc(user!.uid).get();
    final data = doc.data();
    if (data != null) {
      nameController.text = data['name'] ?? '';
      phoneController.text = data['phone'] ?? '';
      email = data['email'] ?? user!.email ?? '';
      photoUrl = data['photoUrl'];
      language = data['language'] ?? 'en';
      notificationsEnabled = data['notificationsEnabled'] ?? true;
    }
    setState(() {});
  }

  Future<void> pickImage() async {
    final picked = await ImagePicker().pickImage(source: ImageSource.gallery);
    if (picked != null) {
      setState(() => _imageFile = File(picked.path));
      await uploadImage();
    }
  }

  Future<void> uploadImage() async {
    if (_imageFile == null || user == null) return;
    final ref = FirebaseStorage.instance.ref().child(
          'profile_pics/${user!.uid}.jpg',
        );
    await ref.putFile(_imageFile!);
    final url = await ref.getDownloadURL();
    await db.collection("users").doc(user!.uid).update({"photoUrl": url});
    setState(() {
      photoUrl = url;
    });
  }

  Future<void> saveProfile() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => loading = true);

    await db.collection("users").doc(user!.uid).set({
      "name": nameController.text.trim(),
      "phone": phoneController.text.trim(),
      "email": user!.email,
      "photoUrl": photoUrl,
      "language": language,
      "notificationsEnabled": notificationsEnabled,
    }, SetOptions(merge: true));

    setState(() => loading = false);

    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
      content: Text("✅ Profile updated!"),
      backgroundColor: Colors.green,
    ));
  }

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
                      '👤 Your Profile',
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
                  child: loading
                      ? const Center(child: CircularProgressIndicator())
                      : SingleChildScrollView(
                          padding: const EdgeInsets.all(24.0),
                          child: Form(
                            key: _formKey,
                            child: Column(
                              children: [
                                GestureDetector(
                                  onTap: pickImage,
                                  child: Stack(
                                    children: [
                                      CircleAvatar(
                                        radius: 60,
                                        backgroundColor: const Color(0xFFE8521A)
                                            .withOpacity(0.1),
                                        backgroundImage: _imageFile != null
                                            ? FileImage(_imageFile!)
                                            : (photoUrl != null
                                                ? NetworkImage(photoUrl!)
                                                : null),
                                        child: photoUrl == null &&
                                                _imageFile == null
                                            ? const Icon(
                                                Icons.person,
                                                size: 60,
                                                color: Color(0xFFE8521A),
                                              )
                                            : null,
                                      ),
                                      Positioned(
                                        bottom: 0,
                                        right: 0,
                                        child: Container(
                                          padding: const EdgeInsets.all(8),
                                          decoration: const BoxDecoration(
                                            color: Color(0xFFE8521A),
                                            shape: BoxShape.circle,
                                          ),
                                          child: const Icon(
                                            Icons.camera_alt,
                                            color: Colors.white,
                                            size: 20,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 32),
                                TextFormField(
                                  controller: nameController,
                                  decoration: InputDecoration(
                                    labelText: "Name",
                                    prefixIcon: const Icon(Icons.person_outline),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    filled: true,
                                    fillColor: Colors.grey[50],
                                  ),
                                  validator: (val) =>
                                      val!.isEmpty ? "Name can't be empty" : null,
                                ),
                                const SizedBox(height: 16),
                                TextFormField(
                                  controller: phoneController,
                                  decoration: InputDecoration(
                                    labelText: "Phone",
                                    prefixIcon: const Icon(Icons.phone_outlined),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    filled: true,
                                    fillColor: Colors.grey[50],
                                  ),
                                  keyboardType: TextInputType.phone,
                                  validator: (val) {
                                    if (val == null || val.trim().isEmpty) {
                                      return "Phone is required";
                                    }
                                    final pattern = RegExp(r'^\+2519\d{8}$');
                                    if (!pattern.hasMatch(val.trim())) {
                                      return "Enter valid +2519XXXXXXXX";
                                    }
                                    return null;
                                  },
                                ),
                                const SizedBox(height: 16),
                                TextFormField(
                                  initialValue: email,
                                  decoration: InputDecoration(
                                    labelText: "Email",
                                    prefixIcon: const Icon(Icons.email_outlined),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    filled: true,
                                    fillColor: Colors.grey[100],
                                    disabledBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: BorderSide(color: Colors.grey[300]!),
                                    ),
                                  ),
                                  enabled: false,
                                ),
                                const SizedBox(height: 24),
                                Container(
                                  padding: const EdgeInsets.all(16),
                                  decoration: BoxDecoration(
                                    color: Colors.grey[50],
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text(
                                        "Preferences",
                                        style: TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      const SizedBox(height: 12),
                                      SwitchListTile(
                                        title: const Text("🔔 Notifications"),
                                        subtitle: const Text("Receive order updates"),
                                        value: notificationsEnabled,
                                        onChanged: (val) {
                                          setState(() => notificationsEnabled = val);
                                        },
                                        activeColor: const Color(0xFFE8521A),
                                      ),
                                      const Divider(),
                                      DropdownButtonFormField<String>(
                                        value: language,
                                        decoration: InputDecoration(
                                          labelText: "🌐 Language",
                                          prefixIcon: const Icon(Icons.language),
                                          border: OutlineInputBorder(
                                            borderRadius: BorderRadius.circular(12),
                                          ),
                                        ),
                                        items: const [
                                          DropdownMenuItem(
                                              value: "en", child: Text("English")),
                                          DropdownMenuItem(
                                              value: "am", child: Text("Amharic")),
                                        ],
                                        onChanged: (val) {
                                          setState(() => language = val ?? 'en');
                                        },
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 24),
                                SizedBox(
                                  width: double.infinity,
                                  child: ElevatedButton.icon(
                                    onPressed: saveProfile,
                                    icon: const Icon(Icons.save),
                                    label: const Text(
                                      "Save Changes",
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFFE8521A),
                                      foregroundColor: Colors.white,
                                      padding: const EdgeInsets.symmetric(vertical: 16),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 32),
                                const Divider(),
                                const SizedBox(height: 16),
                                const Align(
                                  alignment: Alignment.centerLeft,
                                  child: Text(
                                    "🧾 Recent Orders",
                                    style: TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 12),
                                StreamBuilder<QuerySnapshot>(
                                  stream: db
                                      .collection("orders")
                                      .where("userId", isEqualTo: user!.uid)
                                      .orderBy("timestamp", descending: true)
                                      .limit(5)
                                      .snapshots(),
                                  builder: (context, snapshot) {
                                    if (!snapshot.hasData) {
                                      return const Center(
                                        child: CircularProgressIndicator(),
                                      );
                                    }
                                    final orders = snapshot.data!.docs;
                                    if (orders.isEmpty) {
                                      return Padding(
                                        padding: const EdgeInsets.all(24),
                                        child: Text(
                                          "No recent orders",
                                          style: TextStyle(color: Colors.grey[500]),
                                        ),
                                      );
                                    }
                                    return ListView.builder(
                                      shrinkWrap: true,
                                      physics: const NeverScrollableScrollPhysics(),
                                      itemCount: orders.length,
                                      itemBuilder: (context, index) {
                                        final data =
                                            orders[index].data() as Map<String, dynamic>;
                                        final total = data['total'] ?? 0;
                                        final status = data['status'] ?? 'pending';
                                        final time = (data['timestamp'] as Timestamp?)
                                            ?.toDate();
                                        return Container(
                                          margin: const EdgeInsets.only(bottom: 8),
                                          padding: const EdgeInsets.all(12),
                                          decoration: BoxDecoration(
                                            color: Colors.grey[50],
                                            borderRadius: BorderRadius.circular(12),
                                          ),
                                          child: Row(
                                            children: [
                                              Container(
                                                padding: const EdgeInsets.all(8),
                                                decoration: BoxDecoration(
                                                  color: _getStatusColor(status)
                                                      .withOpacity(0.1),
                                                  borderRadius:
                                                      BorderRadius.circular(8),
                                                ),
                                                child: Icon(
                                                  Icons.receipt,
                                                  color: _getStatusColor(status),
                                                  size: 20,
                                                ),
                                              ),
                                              const SizedBox(width: 12),
                                              Expanded(
                                                child: Column(
                                                  crossAxisAlignment:
                                                      CrossAxisAlignment.start,
                                                  children: [
                                                    Text(
                                                      "ETB ${NumberFormat("#,##0").format(total)}",
                                                      style: const TextStyle(
                                                        fontWeight: FontWeight.bold,
                                                      ),
                                                    ),
                                                    Text(
                                                      time != null
                                                          ? DateFormat("MMM dd, yyyy")
                                                              .format(time)
                                                          : '',
                                                      style: TextStyle(
                                                        color: Colors.grey[500],
                                                        fontSize: 12,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                              Container(
                                                padding: const EdgeInsets.symmetric(
                                                  horizontal: 10,
                                                  vertical: 4,
                                                ),
                                                decoration: BoxDecoration(
                                                  color: _getStatusColor(status)
                                                      .withOpacity(0.1),
                                                  borderRadius:
                                                      BorderRadius.circular(12),
                                                ),
                                                child: Text(
                                                  status.toUpperCase(),
                                                  style: TextStyle(
                                                    color: _getStatusColor(status),
                                                    fontSize: 11,
                                                    fontWeight: FontWeight.bold,
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ),
                                        );
                                      },
                                    );
                                  },
                                ),
                              ],
                            ),
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

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return Colors.orange;
      case 'accepted':
        return Colors.blue;
      case 'preparing':
        return Colors.purple;
      case 'delivered':
        return Colors.green;
      case 'cancelled':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }
}
