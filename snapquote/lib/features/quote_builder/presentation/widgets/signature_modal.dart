import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:signature/signature.dart';

/// Shows a dialog where the customer signs, and resolves with the signature
/// rendered as PNG bytes — or null if the dialog was cancelled.
Future<Uint8List?> showSignatureModal(BuildContext context) {
  return showDialog<Uint8List>(
    context: context,
    builder: (_) => const SignatureModal(),
  );
}

class SignatureModal extends StatefulWidget {
  const SignatureModal({super.key});

  @override
  State<SignatureModal> createState() => _SignatureModalState();
}

class _SignatureModalState extends State<SignatureModal> {
  late final SignatureController _controller = SignatureController(
    penStrokeWidth: 3,
    penColor: const Color(0xFF0A1128),
    exportBackgroundColor: Colors.white,
  );

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _accept() async {
    if (_controller.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please sign before accepting.')),
      );
      return;
    }
    final bytes = await _controller.toPngBytes();
    if (!mounted) return;
    Navigator.of(context).pop(bytes);
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Customer Approval'),
      content: SizedBox(
        width: 480,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Sign below to approve this quote.'),
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Signature(
                controller: _controller,
                height: 200,
                backgroundColor: Colors.white,
              ),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => _controller.clear(),
          child: const Text('Clear'),
        ),
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        FilledButton(
          onPressed: _accept,
          child: const Text('Accept & Continue'),
        ),
      ],
    );
  }
}
