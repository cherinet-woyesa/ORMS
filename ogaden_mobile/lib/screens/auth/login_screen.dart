import 'dart:math';
import 'package:flutter/material.dart';
import 'package:ogaden_mobile/services/auth_service.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:provider/provider.dart';
import 'package:ogaden_mobile/providers/theme_provider.dart';
import 'package:ogaden_mobile/screens/home/home_screen.dart';
import 'register_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> with TickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  String email = '';
  String password = '';
  bool isLoading = false;
  bool showPassword = false;
  bool isDarkMode = false;

  late AnimationController _gradientController;
  late AnimationController _floatController;
  late List<_FloatingShape> _shapes;

  final AuthService _authService = AuthService();

  @override
  void initState() {
    super.initState();
    _gradientController = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    )..repeat(reverse: true);

    _floatController = AnimationController(
      duration: const Duration(seconds: 6),
      vsync: this,
    )..repeat(reverse: true);

    _shapes = List.generate(
      6,
      (index) => _FloatingShape(
        size: 50.0 + Random().nextDouble() * 60,
        x: Random().nextDouble(),
        y: Random().nextDouble(),
        duration: 3.0 + Random().nextDouble() * 4,
      ),
    );
  }

  @override
  void dispose() {
    _gradientController.dispose();
    _floatController.dispose();
    super.dispose();
  }

  void _loginUser() async {
    if (_formKey.currentState!.validate()) {
      setState(() => isLoading = true);
      final user = await _authService.signIn(email, password);
      setState(() => isLoading = false);

      if (user != null) {
        Fluttertoast.showToast(msg: 'Login successful! 🎉');
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (_) => const HomeScreen()),
          (route) => false,
        );
      } else {
        Fluttertoast.showToast(msg: 'Login failed. Please check your credentials.');
      }
    }
  }

  void _handleGoogleSignIn() async {
    Fluttertoast.showToast(msg: 'Google Sign-In coming soon!');
  }

  void _handleFacebookSignIn() async {
    Fluttertoast.showToast(msg: 'Facebook Sign-In coming soon!');
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    isDarkMode = theme.brightness == Brightness.dark;

    return Scaffold(
      body: isLoading
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(
                    color: isDarkMode ? Colors.green[400] : Colors.green[600],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Signing in...',
                    style: TextStyle(
                      color: isDarkMode ? Colors.white70 : Colors.black54,
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
            )
          : Stack(
              children: [
                AnimatedBuilder(
                  animation: _gradientController,
                  builder: (context, child) {
                    return Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: isDarkMode
                              ? [
                                  Color.lerp(
                                    const Color(0xFF1a1a2e),
                                    const Color(0xFF16213e),
                                    _gradientController.value,
                                  )!,
                                  Color.lerp(
                                    const Color(0xFF16213e),
                                    const Color(0xFF0f3460),
                                    _gradientController.value,
                                  )!,
                                  Color.lerp(
                                    const Color(0xFF0f3460),
                                    const Color(0xFF533483),
                                    _gradientController.value,
                                  )!,
                                ]
                              : [
                                  Color.lerp(
                                    Colors.green[400]!,
                                    Colors.blue[400]!,
                                    _gradientController.value,
                                  )!,
                                  Color.lerp(
                                    Colors.blue[400]!,
                                    Colors.purple[400]!,
                                    _gradientController.value,
                                  )!,
                                  Color.lerp(
                                    Colors.purple[400]!,
                                    Colors.green[400]!,
                                    _gradientController.value,
                                  )!,
                                ],
                        ),
                      ),
                    );
                  },
                ),
                AnimatedBuilder(
                  animation: _floatController,
                  builder: (context, child) {
                    return CustomPaint(
                      painter: _ShapesPainter(
                        shapes: _shapes,
                        animationValue: _floatController.value,
                        isDarkMode: isDarkMode,
                      ),
                      size: Size.infinite,
                    );
                  },
                ),
                SafeArea(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
                    child: Column(
                      children: [
                        const SizedBox(height: 20),
                        _buildHeader(theme),
                        const SizedBox(height: 40),
                        _buildLoginCard(theme),
                        const SizedBox(height: 24),
                        _buildSocialLogin(theme),
                        const SizedBox(height: 24),
                        _buildRegisterLink(theme),
                        const SizedBox(height: 20),
                      ],
                    ),
                  ),
                ),
                Positioned(
                  top: 10,
                  right: 10,
                  child: IconButton(
                    onPressed: () {
                      context.read<ThemeProvider>().toggleTheme();
                    },
                    icon: Icon(
                      isDarkMode ? Icons.light_mode : Icons.dark_mode,
                      color: Colors.white.withOpacity(0.9),
                      size: 28,
                    ),
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildHeader(ThemeData theme) {
    return Column(
      children: [
        Container(
          width: 90,
          height: 90,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: isDarkMode
                  ? [Colors.purple[400]!, Colors.blue[400]!]
                  : [Colors.white, Colors.white.withOpacity(0.9)],
            ),
            borderRadius: BorderRadius.circular(24),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.2),
                blurRadius: 20,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Icon(
            Icons.restaurant_menu,
            size: 48,
            color: isDarkMode ? Colors.white : Colors.green[700],
          ),
        ),
        const SizedBox(height: 20),
        Text(
          'Ogaden Restaurant',
          style: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.bold,
            color: Colors.white,
            letterSpacing: 1.2,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Welcome back! Please sign in to continue.',
          style: TextStyle(
            fontSize: 15,
            color: Colors.white.withOpacity(0.85),
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildLoginCard(ThemeData theme) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: isDarkMode
            ? Colors.white.withOpacity(0.08)
            : Colors.white.withOpacity(0.95),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 30,
            offset: const Offset(0, 15),
          ),
        ],
        border: Border.all(
          color: Colors.white.withOpacity(0.2),
          width: 1,
        ),
      ),
      child: Form(
        key: _formKey,
        child: Column(
          children: [
            Text(
              'Sign In',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: isDarkMode ? Colors.white : Colors.black87,
              ),
            ),
            const SizedBox(height: 24),
            _buildTextField(
              label: 'Email',
              icon: Icons.email_outlined,
              value: email,
              onChanged: (val) => email = val.trim(),
              validator: (val) =>
                  val!.isEmpty || !val.contains('@') ? 'Enter a valid email' : null,
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 16),
            _buildTextField(
              label: 'Password',
              icon: Icons.lock_outline,
              value: password,
              onChanged: (val) => password = val.trim(),
              validator: (val) =>
                  val!.length < 6 ? 'Password must be 6+ characters' : null,
              obscureText: !showPassword,
              suffixIcon: IconButton(
                icon: Icon(
                  showPassword ? Icons.visibility_off : Icons.visibility,
                  color: isDarkMode ? Colors.white54 : Colors.grey,
                ),
                onPressed: () => setState(() => showPassword = !showPassword),
              ),
            ),
            const SizedBox(height: 8),
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: () {
                  Fluttertoast.showToast(msg: 'Forgot password feature coming soon!');
                },
                child: Text(
                  'Forgot password?',
                  style: TextStyle(
                    color: isDarkMode ? Colors.white60 : Colors.grey[600],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              height: 54,
              child: ElevatedButton(
                onPressed: _loginUser,
                style: ElevatedButton.styleFrom(
                  backgroundColor: isDarkMode
                      ? Colors.green[400]
                      : Colors.green[600],
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  elevation: 4,
                  shadowColor: Colors.green.withOpacity(0.4),
                ),
                child: const Text(
                  'Sign In',
                  style: TextStyle(fontSize: 17, fontWeight: FontWeight.w600),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField({
    required String label,
    required IconData icon,
    required String value,
    required Function(String) onChanged,
    required String? Function(String?) validator,
    TextInputType keyboardType = TextInputType.text,
    bool obscureText = false,
    Widget? suffixIcon,
  }) {
    return TextFormField(
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: isDarkMode ? Colors.white54 : Colors.grey),
        filled: true,
        fillColor: isDarkMode
            ? Colors.white.withOpacity(0.08)
            : Colors.grey[50],
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(
            color: isDarkMode ? Colors.white12 : Colors.grey[300]!,
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(
            color: isDarkMode ? Colors.green[400]! : Colors.green[600]!,
            width: 2,
          ),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: Colors.red),
        ),
        suffixIcon: suffixIcon,
        labelStyle: TextStyle(color: isDarkMode ? Colors.white70 : Colors.grey[700]),
      ),
      style: TextStyle(color: isDarkMode ? Colors.white : Colors.black87),
      obscureText: obscureText,
      validator: validator,
      onChanged: onChanged,
      keyboardType: keyboardType,
    );
  }

  Widget _buildSocialLogin(ThemeData theme) {
    return Column(
      children: [
        Row(
          children: [
            Expanded(child: Divider(color: Colors.white.withOpacity(0.3))),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Text(
                'or continue with',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.7),
                  fontSize: 14,
                ),
              ),
            ),
            Expanded(child: Divider(color: Colors.white.withOpacity(0.3))),
          ],
        ),
        const SizedBox(height: 20),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Expanded(
              child: _buildSocialButton(
                icon: Icons.g_mobiledata,
                label: 'Google',
                onTap: _handleGoogleSignIn,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: _buildSocialButton(
                icon: Icons.facebook,
                label: 'Facebook',
                onTap: _handleFacebookSignIn,
                color: const Color(0xFF1877F2),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildSocialButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    Color? color,
  }) {
    return Material(
      color: Colors.white.withOpacity(0.15),
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: Colors.white.withOpacity(0.2),
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                color: color ?? (isDarkMode ? Colors.white : Colors.black87),
                size: 24,
              ),
              const SizedBox(width: 6),
              Flexible(
                child: Text(
                  label,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: isDarkMode ? Colors.white : Colors.black87,
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRegisterLink(ThemeData theme) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          "Don't have an account? ",
          style: TextStyle(
            color: Colors.white.withOpacity(0.8),
            fontSize: 15,
          ),
        ),
        GestureDetector(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const RegisterScreen()),
            );
          },
          child: Text(
            'Sign Up',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.bold,
              decoration: TextDecoration.underline,
              decorationColor: Colors.white,
            ),
          ),
        ),
      ],
    );
  }
}

class _FloatingShape {
  final double size;
  final double x;
  final double y;
  final double duration;

  _FloatingShape({
    required this.size,
    required this.x,
    required this.y,
    required this.duration,
  });
}

class _ShapesPainter extends CustomPainter {
  final List<_FloatingShape> shapes;
  final double animationValue;
  final bool isDarkMode;

  _ShapesPainter({
    required this.shapes,
    required this.animationValue,
    required this.isDarkMode,
  });

  @override
  void paint(Canvas canvas, Size size) {
    for (var shape in shapes) {
      final paint = Paint()
        ..color = Colors.white.withOpacity(0.08)
        ..style = PaintingStyle.fill;

      final offsetX = shape.x * size.width;
      final offsetY = shape.y * size.height +
          sin(animationValue * pi * 2) * 30;

      canvas.drawCircle(Offset(offsetX, offsetY), shape.size / 2, paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
