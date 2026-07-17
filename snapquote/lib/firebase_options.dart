import 'package:firebase_core/firebase_core.dart';

/// Placeholder Firebase configuration.
///
/// Replace these values by running `flutterfire configure` against a real
/// Firebase project before shipping. Until then the app boots in a mode
/// where Google/Email sign-in return errors and demo mode is available.
class DefaultFirebaseOptions {
  const DefaultFirebaseOptions._();

  static FirebaseOptions get currentPlatform => const FirebaseOptions(
        apiKey: 'REPLACE_WITH_WEB_API_KEY',
        appId: '1:000000000000:web:replace_with_app_id',
        messagingSenderId: '000000000000',
        projectId: 'snapquote-placeholder',
        authDomain: 'snapquote-placeholder.firebaseapp.com',
      );
}
