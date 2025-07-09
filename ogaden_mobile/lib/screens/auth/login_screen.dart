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
    return Scaffold(
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: Center(
                child: Form(
                  key: _formKey,
                  child: ListView(
                    shrinkWrap: true,
                    children: [
                      const Text(
                        'Login to Ogaden',
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 40),

                      // Email
                      TextFormField(
                        decoration: const InputDecoration(
                          labelText: 'Email',
                          border: OutlineInputBorder(),
                        ),
                        validator: (val) => val!.isEmpty || !val.contains('@')
                            ? 'Enter a valid email'
                            : null,
                        onChanged: (val) => email = val.trim(),
                      ),
                      const SizedBox(height: 20),

                      // Password
                      TextFormField(
                        decoration: const InputDecoration(
                          labelText: 'Password',
                          border: OutlineInputBorder(),
                        ),
                        obscureText: true,
                        validator: (val) => val!.length < 6
                            ? 'Password must be 6+ chars'
                            : null,
                        onChanged: (val) => password = val.trim(),
                      ),
                      const SizedBox(height: 30),

                      ElevatedButton(
                        onPressed: _loginUser,
                        child: const Text('Login'),
                      ),
                      const SizedBox(height: 10),

                      TextButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const RegisterScreen(),
                            ),
                          );
                        },
                        child: const Text("Don't have an account? Register"),
                      ),
                    ],
                  ),
                ),
              ),
            ),
    );
  }
}
