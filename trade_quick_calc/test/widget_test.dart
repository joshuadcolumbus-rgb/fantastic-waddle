import 'package:flutter_test/flutter_test.dart';

import 'package:trade_quick_calc/main.dart';

void main() {
  testWidgets('app boots into the HVAC Suite', (tester) async {
    await tester.pumpWidget(const TradeQuickCalcApp());

    expect(find.text('Trade Quick-Calc'), findsOneWidget);
    expect(find.text('HVAC Suite'), findsWidgets);
    expect(find.text('Evaporator temperature split — cooling mode'),
        findsOneWidget);
  });

  testWidgets('HVAC segments switch calculators', (tester) async {
    await tester.pumpWidget(const TradeQuickCalcApp());

    await tester.tap(find.text('Airflow CFM'));
    await tester.pumpAndSettle();
    expect(find.text('Heater voltage'), findsOneWidget);

    await tester.tap(find.text('Superheat'));
    await tester.pumpAndSettle();
    expect(find.text('Indoor wet bulb'), findsOneWidget);
  });

  testWidgets('bottom navigation reaches every suite', (tester) async {
    await tester.pumpWidget(const TradeQuickCalcApp());

    await tester.tap(find.text('Electrical Suite'));
    await tester.pumpAndSettle();
    expect(find.text('Circuit math and component health checks'),
        findsOneWidget);

    await tester.tap(find.text('Capacitor Under Load'));
    await tester.pumpAndSettle();
    expect(find.text('Rated capacitance'), findsOneWidget);

    await tester.tap(find.text('Info'));
    await tester.pumpAndSettle();
    expect(find.text('Formulas, field notes, and app controls'),
        findsOneWidget);
  });
}
