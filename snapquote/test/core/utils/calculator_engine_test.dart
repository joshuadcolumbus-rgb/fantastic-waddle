import 'package:flutter_test/flutter_test.dart';
import 'package:snapquote/core/utils/calculator_engine.dart';
import 'package:snapquote/features/settings/domain/company_settings.dart';

void main() {
  const engine = CalculatorEngine();

  group('CalculatorEngine.calculateMinimumPrice', () {
    test(
        r'$100 materials, 1 hr @ $100/hr, $50 overhead, 40% margin '
        r'-> $416.67', () {
      const settings = CompanySettings(
        hourlyRate: 100,
        overheadFee: 50,
        targetMargin: 40,
      );

      final price = engine.calculateMinimumPrice(
        directMaterialCosts: 100,
        laborHours: 1,
        settings: settings,
      );

      // (100 + 100 + 50) / (1 - 0.40) = 250 / 0.60 = 416.666...
      expect(price, closeTo(416.67, 0.005));
    });

    test(
        r'$0 materials, 0.5 hrs @ $120/hr, $50 overhead, 50% margin '
        r'-> $220.00', () {
      const settings = CompanySettings(
        hourlyRate: 120,
        overheadFee: 50,
        targetMargin: 50,
      );

      final price = engine.calculateMinimumPrice(
        directMaterialCosts: 0,
        laborHours: 0.5,
        settings: settings,
      );

      // (0 + 60 + 50) / (1 - 0.50) = 110 / 0.50 = 220.00
      expect(price, closeTo(220.00, 0.005));
    });

    test('100% margin throws MarginException', () {
      const settings = CompanySettings(
        hourlyRate: 100,
        overheadFee: 50,
        targetMargin: 100,
      );

      expect(
        () => engine.calculateMinimumPrice(
          directMaterialCosts: 100,
          laborHours: 1,
          settings: settings,
        ),
        throwsA(isA<MarginException>()),
      );
    });
  });
}
