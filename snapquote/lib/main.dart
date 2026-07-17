import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/theme/app_theme.dart';
import 'features/auth/presentation/providers/auth_provider.dart';
import 'features/auth/presentation/screens/login_screen.dart';
import 'features/quote_builder/presentation/screens/builder_screen.dart';
import 'firebase_options.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
  } catch (error) {
    // No real Firebase project configured yet — the app still runs and
    // exposes demo mode; sign-in surfaces an error instead.
    debugPrint('Firebase initialization skipped: $error');
  }
  runApp(const ProviderScope(child: SnapQuoteApp()));
}

class SnapQuoteApp extends ConsumerWidget {
  const SnapQuoteApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authStatus = ref.watch(authControllerProvider);

    return MaterialApp(
      title: 'SnapQuote',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.dark,
      // Router guard: unauthenticated users can never reach the builder.
      home: authStatus == AuthStatus.unauthenticated
          ? const LoginScreen()
          : const BuilderScreen(),
    );
  }
}
