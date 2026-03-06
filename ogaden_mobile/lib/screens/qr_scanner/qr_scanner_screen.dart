import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

class QRScannerScreen extends StatefulWidget {
  const QRScannerScreen({super.key});

  @override
  State<QRScannerScreen> createState() => _QRScannerScreenState();
}

class _QRScannerScreenState extends State<QRScannerScreen> {
  MobileScannerController? _controller;
  bool _isProcessing = false;
  String? _lastScanned;

  @override
  void initState() {
    super.initState();
    _controller = MobileScannerController(
      detectionSpeed: DetectionSpeed.normal,
      facing: CameraFacing.back,
    );
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  Future<void> _onDetect(BarcodeCapture capture) async {
    if (_isProcessing) return;
    
    final barcodes = capture.barcodes;
    if (barcodes.isEmpty) return;

    final code = barcodes.first.rawValue;
    if (code == null || code == _lastScanned) return;

    setState(() {
      _isProcessing = true;
      _lastScanned = code;
    });

    await _processCode(code);
    
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) {
      setState(() {
        _isProcessing = false;
        _lastScanned = null;
      });
    }
  }

  Future<void> _processCode(String code) async {
    try {
      final user = FirebaseAuth.instance.currentUser;
      if (user == null) {
        _showError('Please login first');
        return;
      }

      if (code.startsWith('table_')) {
        await _handleTableQR(code);
      } else if (code.startsWith('menu_')) {
        await _handleMenuQR(code);
      } else if (code.startsWith('payment_')) {
        await _handlePaymentQR(code);
      } else {
        _showError('Unknown QR code format');
      }
    } catch (e) {
      _showError('Error: $e');
    }
  }

  Future<void> _handleTableQR(String code) async {
    final tableId = code.replaceFirst('table_', '');
    
    final tableDoc = await FirebaseFirestore.instance
        .collection('tables')
        .doc(tableId)
        .get();

    if (!tableDoc.exists) {
      _showError('Invalid table QR code');
      return;
    }

    final tableData = tableDoc.data()!;
    
    if (!mounted) return;

    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.table_restaurant, size: 48, color: Colors.orange),
            const SizedBox(height: 16),
            Text(
              'Table ${tableData['number']}',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              'Capacity: ${tableData['capacity']} guests',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Cancel'),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: FilledButton(
                    onPressed: () {
                      Navigator.pop(context);
                      Navigator.pop(context, {
                        'tableId': tableId,
                        'tableNumber': tableData['number'],
                      });
                    },
                    child: const Text('Sit Here'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _handleMenuQR(String code) async {
    final menuItemId = code.replaceFirst('menu_', '');
    
    final menuDoc = await FirebaseFirestore.instance
        .collection('menu')
        .doc(menuItemId)
        .get();

    if (!menuDoc.exists) {
      _showError('Invalid menu QR code');
      return;
    }

    final menuItem = menuDoc.data()!;
    
    if (!mounted) return;

    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (menuItem['imageUrl'] != null)
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Image.network(
                  menuItem['imageUrl'],
                  height: 120,
                  width: 120,
                  fit: BoxFit.cover,
                ),
              ),
            const SizedBox(height: 16),
            Text(
              menuItem['name'] ?? 'Menu Item',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              'ETB ${(menuItem['price'] ?? 0).toStringAsFixed(2)}',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: Colors.orange,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.pop(context, {'menuItem': menuItem});
                },
                child: const Text('Add to Order'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _handlePaymentQR(String code) async {
    final paymentId = code.replaceFirst('payment_', '');
    
    if (!mounted) return;

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Payment'),
        content: Text('Process payment: $paymentId?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context, {'paymentId': paymentId});
            },
            child: const Text('Pay Now'),
          ),
        ],
      ),
    );
  }

  void _showError(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan QR Code'),
        actions: [
          IconButton(
            icon: const Icon(Icons.flash_on),
            onPressed: () => _controller?.toggleTorch(),
          ),
          IconButton(
            icon: const Icon(Icons.cameraswitch),
            onPressed: () => _controller?.switchCamera(),
          ),
        ],
      ),
      body: Stack(
        children: [
          MobileScanner(
            controller: _controller,
            onDetect: _onDetect,
          ),
          Center(
            child: Container(
              width: 250,
              height: 250,
              decoration: BoxDecoration(
                border: Border.all(
                  color: _isProcessing ? Colors.green : Colors.orange,
                  width: 3,
                ),
                borderRadius: BorderRadius.circular(16),
              ),
            ),
          ),
          Positioned(
            bottom: 40,
            left: 0,
            right: 0,
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 40),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.black54,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Text(
                'Point your camera at a QR code\nto scan table or menu items',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white),
              ),
            ),
          ),
          if (_isProcessing)
            Container(
              color: Colors.black54,
              child: const Center(
                child: CircularProgressIndicator(color: Colors.orange),
              ),
            ),
        ],
      ),
    );
  }
}
