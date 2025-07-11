import 'package:flutter/material.dart';
import 'package:ogaden_mobile/services/auth_service.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'register_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  String email = '';
  String password = '';
  bool isLoading = false;

  final AuthService _authService = AuthService();

  void _loginUser() async {
    if (_formKey.currentState!.validate()) {
      setState(() => isLoading = true);
      final user = await _authService.signIn(email, password);
      setState(() => isLoading = false);

      if (user != null) {
        Fluttertoast.showToast(msg: 'Login successful 🎉');
        // TODO: Navigate to Home
      } else {
        Fluttertoast.showToast(msg: 'Login failed ❌');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 28.0, vertical: 24.0),
                child: Form(
                  key: _formKey,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Logo or Avatar
                      CircleAvatar(
                        radius: 44,
                        backgroundColor: theme.primaryColor.withOpacity(0.1),
                        child: Icon(Icons.lock_outline, size: 48, color: theme.primaryColor),
                      ),
                      const SizedBox(height: 24),
                      // Title
                      Text(
                        'Welcome Back',
                        style: theme.textTheme.headline5?.copyWith(fontWeight: FontWeight.bold),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Login to Ogaden',
                        style: theme.textTheme.subtitle1?.copyWith(color: Colors.grey[700]),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 32),
                      // Email
                      TextFormField(
                        decoration: InputDecoration(
                          labelText: 'Email',
                          prefixIcon: const Icon(Icons.email_outlined),
                          filled: true,
                          fillColor: Colors.white,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                            borderSide: BorderSide.none,
                          ),
                          contentPadding: const EdgeInsets.symmetric(vertical: 18, horizontal: 16),
                        ),
                        validator: (val) => val!.isEmpty || !val.contains('@')
                            ? 'Enter a valid email'
                            : null,
                        onChanged: (val) => email = val.trim(),
                        keyboardType: TextInputType.emailAddress,
                      ),
                      const SizedBox(height: 20),
                      // Password
                      TextFormField(
                        decoration: InputDecoration(
                          labelText: 'Password',
                          prefixIcon: const Icon(Icons.lock_outline),
                          filled: true,
                          fillColor: Colors.white,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                            borderSide: BorderSide.none,
                          ),
                          contentPadding: const EdgeInsets.symmetric(vertical: 18, horizontal: 16),
                        ),
                        obscureText: true,
                        validator: (val) => val!.length < 6
                            ? 'Password must be 6+ chars'
                            : null,
                        onChanged: (val) => password = val.trim(),
                      ),
                      const SizedBox(height: 8),
                      // Forgot password (future)
                      Align(
                        alignment: Alignment.centerRight,
                        child: TextButton(
                          onPressed: () {},
                          child: const Text('Forgot password?', style: TextStyle(color: Colors.grey)),
                        ),
                      ),
                      const SizedBox(height: 10),
                      // Login Button
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _loginUser,
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                            ),
                            elevation: 2,
                          ),
                          child: const Text('Login', style: TextStyle(fontSize: 16)),
                        ),
                      ),
                      const SizedBox(height: 18),
                      // Divider with text
                      Row(
                        children: [
                          const Expanded(child: Divider(thickness: 1, endIndent: 8)),
                          Text('or', style: TextStyle(color: Colors.grey[600])),
                          const Expanded(child: Divider(thickness: 1, indent: 8)),
                        ],
                      ),
                      const SizedBox(height: 18),
                      // Register Button
                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton(
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => const RegisterScreen(),
                              ),
                            );
                          },
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                            ),
                            side: BorderSide(color: theme.primaryColor),
                          ),
                          child: Text(
                            "Don't have an account? Register",
                            style: TextStyle(color: theme.primaryColor, fontSize: 15),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
    );
  }
}
