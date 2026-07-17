import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:snapquote/features/auth/presentation/screens/login_screen.dart';
import 'package:snapquote/main.dart';

void main() {
  testWidgets('unauthenticated users are routed to the login screen',
      (tester) async {
    await tester.pumpWidget(const ProviderScope(child: SnapQuoteApp()));

    expect(find.byType(LoginScreen), findsOneWidget);
    expect(find.text('SnapQuote'), findsOneWidget);
  });
}
