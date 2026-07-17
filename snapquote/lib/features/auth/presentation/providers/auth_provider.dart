import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'auth_provider.g.dart';

enum AuthStatus {
  /// No signed-in user — the router guard shows the login screen.
  unauthenticated,

  /// Signed in through Firebase Auth.
  authenticated,

  /// Local demo session (no Firebase backend configured).
  demo,
}

/// Auth state used as the app's router guard: any status other than
/// [AuthStatus.unauthenticated] unlocks the quote builder.
@riverpod
class AuthController extends _$AuthController {
  bool get _firebaseReady {
    try {
      return Firebase.apps.isNotEmpty;
    } catch (_) {
      return false;
    }
  }

  @override
  AuthStatus build() {
    if (_firebaseReady) {
      final subscription =
          FirebaseAuth.instance.authStateChanges().listen((user) {
        if (user != null) {
          state = AuthStatus.authenticated;
        } else if (state != AuthStatus.demo) {
          state = AuthStatus.unauthenticated;
        }
      });
      ref.onDispose(subscription.cancel);
    }
    return AuthStatus.unauthenticated;
  }

  /// Returns null on success, or a human-readable error message.
  Future<String?> signInWithGoogle() async {
    if (!_firebaseReady) {
      return 'Firebase is not configured yet — use demo mode instead.';
    }
    try {
      await FirebaseAuth.instance.signInWithPopup(GoogleAuthProvider());
      return null;
    } on FirebaseAuthException catch (e) {
      return e.message ?? 'Google sign-in failed.';
    } catch (e) {
      return 'Google sign-in failed: $e';
    }
  }

  /// Signs in with email/password, creating the account if it doesn't
  /// exist yet. Returns null on success, or an error message.
  Future<String?> signInWithEmail(String email, String password) async {
    if (!_firebaseReady) {
      return 'Firebase is not configured yet — use demo mode instead.';
    }
    try {
      await FirebaseAuth.instance.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      return null;
    } on FirebaseAuthException catch (e) {
      if (e.code == 'user-not-found') {
        try {
          await FirebaseAuth.instance.createUserWithEmailAndPassword(
            email: email,
            password: password,
          );
          return null;
        } on FirebaseAuthException catch (e) {
          return e.message ?? 'Could not create the account.';
        }
      }
      return e.message ?? 'Sign-in failed.';
    } catch (e) {
      return 'Sign-in failed: $e';
    }
  }

  /// Local-only session for trying the app without a Firebase backend.
  void continueInDemoMode() => state = AuthStatus.demo;

  Future<void> signOut() async {
    if (_firebaseReady) {
      await FirebaseAuth.instance.signOut();
    }
    state = AuthStatus.unauthenticated;
  }
}
