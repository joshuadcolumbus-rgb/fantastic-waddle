import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/auth_provider.dart';

/// Minimalist login: email/password or Google, plus a demo-mode escape
/// hatch while no Firebase project is wired up.
class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _busy = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _run(Future<String?> Function() action) async {
    setState(() => _busy = true);
    final error = await action();
    if (!mounted) return;
    setState(() => _busy = false);
    if (error != null) {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(error)));
    }
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final auth = ref.read(authControllerProvider.notifier);

    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 400),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Icon(Icons.bolt, size: 64, color: colorScheme.primary),
                const SizedBox(height: 8),
                Text(
                  'SnapQuote',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                ),
                Text(
                  'Instant quotes for trade contractors',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: colorScheme.onSurfaceVariant,
                      ),
                ),
                const SizedBox(height: 32),
                TextField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  autofillHints: const [AutofillHints.email],
                  decoration: const InputDecoration(
                    labelText: 'Email',
                    prefixIcon: Icon(Icons.mail_outline),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _passwordController,
                  obscureText: true,
                  autofillHints: const [AutofillHints.password],
                  decoration: const InputDecoration(
                    labelText: 'Password',
                    prefixIcon: Icon(Icons.lock_outline),
                  ),
                  onSubmitted: (_) => _busy
                      ? null
                      : _run(() => auth.signInWithEmail(
                            _emailController.text.trim(),
                            _passwordController.text,
                          )),
                ),
                const SizedBox(height: 20),
                FilledButton(
                  onPressed: _busy
                      ? null
                      : () => _run(() => auth.signInWithEmail(
                            _emailController.text.trim(),
                            _passwordController.text,
                          )),
                  child: const Text('Sign In'),
                ),
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed:
                      _busy ? null : () => _run(auth.signInWithGoogle),
                  icon: const Icon(Icons.g_mobiledata, size: 28),
                  label: const Text('Continue with Google'),
                ),
                const SizedBox(height: 24),
                TextButton(
                  onPressed: _busy ? null : auth.continueInDemoMode,
                  child: const Text('Explore in demo mode →'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
