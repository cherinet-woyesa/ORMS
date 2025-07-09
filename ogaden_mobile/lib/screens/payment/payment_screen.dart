import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/order_service.dart';
import '../../providers/cart_provider.dart';
import '../order/confirmation_screen.dart';

class PaymentScreen extends StatefulWidget {
  const PaymentScreen({super.key});

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  final _formKey = GlobalKey<FormState>();
  String name = '';
  String cardNumber = '';
  String phone = '';

  bool isLoading = false;

  void _processPayment() {
    if (_formKey.currentState!.validate()) {
      setState(() => isLoading = true);

      Future.delayed(const Duration(seconds: 2), () async {
        final cartProvider = Provider.of<CartProvider>(context, listen: false);
        final total = cartProvider.totalPrice;

        await OrderService().saveOrder(cartProvider.items, total);

        cartProvider.clearCart();

        setState(() => isLoading = false);
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const ConfirmationScreen()),
        );
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = Provider.of<CartProvider>(context);
    final total = cart.totalPrice;

    return Scaffold(
      appBar: AppBar(title: const Text('Payment')),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: ListView(
                  children: [
                    Text(
                      "Total: \$${total.toStringAsFixed(2)}",
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                      ),
                    ),

                    const SizedBox(height: 20),
                    const Text("Payment Info", style: TextStyle(fontSize: 18)),

                    const SizedBox(height: 10),
                    TextFormField(
                      decoration: const InputDecoration(
                        labelText: 'Full Name',
                        border: OutlineInputBorder(),
                      ),
                      validator: (val) =>
                          val!.isEmpty ? 'Enter your name' : null,
                      onChanged: (val) => name = val,
                    ),

                    const SizedBox(height: 10),
                    TextFormField(
                      decoration: const InputDecoration(
                        labelText: 'Card or Mobile Number',
                        border: OutlineInputBorder(),
                      ),
                      keyboardType: TextInputType.number,
                      validator: (val) =>
                          val!.length < 6 ? 'Invalid number' : null,
                      onChanged: (val) => cardNumber = val,
                    ),

                    const SizedBox(height: 20),
                    ElevatedButton(
                      onPressed: _processPayment,
                      child: const Text("Pay Now"),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
