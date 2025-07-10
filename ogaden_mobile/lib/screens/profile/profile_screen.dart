import 'dart:io';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

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
    });

    setState(() => loading = false);

    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text("✅ Profile updated!")));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("👤 Your Profile")),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Form(
                key: _formKey,
                child: Column(
                  children: [
                    GestureDetector(
                      onTap: pickImage,
                      child: CircleAvatar(
                        radius: 50,
                        backgroundImage: _imageFile != null
                            ? FileImage(_imageFile!)
                            : (photoUrl != null
                                      ? NetworkImage(photoUrl!)
                                      : const AssetImage(
                                          'assets/default_user.png',
                                        ))
                                  as ImageProvider,
                      ),
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: nameController,
                      decoration: const InputDecoration(labelText: "Name"),
                      validator: (val) =>
                          val!.isEmpty ? "Name can't be empty" : null,
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: phoneController,
                      decoration: const InputDecoration(labelText: "Phone"),
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
                    const SizedBox(height: 12),
                    TextFormField(
                      enabled: false,
                      initialValue: email,
                      decoration: const InputDecoration(labelText: "Email"),
                    ),
                    const SizedBox(height: 12),
                    SwitchListTile(
                      title: const Text("🔔 Enable Notifications"),
                      value: notificationsEnabled,
                      onChanged: (val) {
                        setState(() => notificationsEnabled = val);
                      },
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      value: language,
                      decoration: const InputDecoration(
                        labelText: "🌐 Language",
                      ),
                      items: const [
                        DropdownMenuItem(value: "en", child: Text("English")),
                        DropdownMenuItem(value: "am", child: Text("Amharic")),
                      ],
                      onChanged: (val) {
                        setState(() => language = val ?? 'en');
                      },
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: saveProfile,
                      child: const Text("💾 Save Profile"),
                    ),
                    const SizedBox(height: 32),
                    const Divider(),
                    const Text(
                      "🧾 Your Orders",
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    StreamBuilder<QuerySnapshot>(
                      stream: db
                          .collection("orders")
                          .where("userId", isEqualTo: user!.uid)
                          .orderBy("timestamp", descending: true)
                          .snapshots(),
                      builder: (context, snapshot) {
                        if (!snapshot.hasData) {
                          return const CircularProgressIndicator();
                        }
                        final orders = snapshot.data!.docs;
                        if (orders.isEmpty) {
                          return const Text("No past orders.");
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
                                ?.toDate()
                                .toLocal()
                                .toString()
                                .split('.')[0];
                            return ListTile(
                              leading: const Icon(Icons.receipt_long),
                              title: Text("ETB $total"),
                              subtitle: Text("Status: $status\n$time"),
                            );
                          },
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
