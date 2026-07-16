import 'package:flutter_test/flutter_test.dart';

import 'package:trade_quick_calc/logic/calculators.dart';

void main() {
  group('DeltaTCalculator', () {
    test('returns null while an input is missing', () {
      expect(DeltaTCalculator.calculate(returnTemp: 75), isNull);
      expect(DeltaTCalculator.calculate(supplyTemp: 57), isNull);
    });

    test('classifies an in-range split', () {
      final result =
          DeltaTCalculator.calculate(returnTemp: 75, supplyTemp: 57)!;
      expect(result.deltaT, closeTo(18, 1e-9));
      expect(result.status, DeltaTStatus.inRange);
    });

    test('classifies low and high splits', () {
      expect(
        DeltaTCalculator.calculate(returnTemp: 75, supplyTemp: 65)!.status,
        DeltaTStatus.low,
      );
      expect(
        DeltaTCalculator.calculate(returnTemp: 80, supplyTemp: 55)!.status,
        DeltaTStatus.high,
      );
    });
  });

  group('OhmsLawCalculator', () {
    test('needs at least two inputs', () {
      expect(OhmsLawCalculator.solve(volts: 120), isA<OhmsLawIncomplete>());
    });

    test('rejects three inputs', () {
      expect(
        OhmsLawCalculator.solve(volts: 120, amps: 5, ohms: 24),
        isA<OhmsLawOverdetermined>(),
      );
    });

    test('solves resistance from volts and amps', () {
      final outcome =
          OhmsLawCalculator.solve(volts: 120, amps: 5) as OhmsLawSuccess;
      expect(outcome.result.solvedFor, OhmsLawField.ohms);
      expect(outcome.result.ohms, closeTo(24, 1e-9));
      expect(outcome.result.watts, closeTo(600, 1e-9));
    });

    test('solves current from volts and ohms', () {
      final outcome =
          OhmsLawCalculator.solve(volts: 120, ohms: 24) as OhmsLawSuccess;
      expect(outcome.result.solvedFor, OhmsLawField.amps);
      expect(outcome.result.amps, closeTo(5, 1e-9));
    });

    test('solves voltage from amps and ohms', () {
      final outcome =
          OhmsLawCalculator.solve(amps: 5, ohms: 24) as OhmsLawSuccess;
      expect(outcome.result.solvedFor, OhmsLawField.volts);
      expect(outcome.result.volts, closeTo(120, 1e-9));
      expect(outcome.result.watts, closeTo(600, 1e-9));
    });

    test('guards division by zero', () {
      expect(
        OhmsLawCalculator.solve(volts: 120, amps: 0),
        isA<OhmsLawDivisionByZero>(),
      );
      expect(
        OhmsLawCalculator.solve(volts: 120, ohms: 0),
        isA<OhmsLawDivisionByZero>(),
      );
    });
  });

  group('CapacitorCalculator', () {
    test('needs all three inputs', () {
      expect(
        CapacitorCalculator.evaluate(ratedMfd: 45, startAmps: 6),
        isA<CapacitorIncomplete>(),
      );
    });

    test('marks a reading within ±6% as healthy', () {
      // 6 A × 2652 ÷ 360 V = 44.2 µF vs 45 µF rated → −1.78%.
      final outcome = CapacitorCalculator.evaluate(
        ratedMfd: 45,
        startAmps: 6,
        capVolts: 360,
      ) as CapacitorSuccess;
      expect(outcome.result.measuredMfd, closeTo(44.2, 0.01));
      expect(outcome.result.deviationPercent, closeTo(-1.78, 0.01));
      expect(outcome.result.status, CapacitorStatus.healthy);
    });

    test('marks a reading beyond ±6% as weak', () {
      // 5 A × 2652 ÷ 360 V ≈ 36.8 µF vs 45 µF rated → −18.1%.
      final outcome = CapacitorCalculator.evaluate(
        ratedMfd: 45,
        startAmps: 5,
        capVolts: 360,
      ) as CapacitorSuccess;
      expect(outcome.result.status, CapacitorStatus.weak);
    });

    test('exactly ±6% still counts as healthy', () {
      // Measured = rated × 1.06 exactly: rated 50, volts 100 → amps needed
      // = 53 × 100 ÷ 2652.
      final outcome = CapacitorCalculator.evaluate(
        ratedMfd: 50,
        startAmps: 53 * 100 / 2652,
        capVolts: 100,
      ) as CapacitorSuccess;
      expect(outcome.result.deviationPercent, closeTo(6, 1e-9));
      expect(outcome.result.status, CapacitorStatus.healthy);
    });

    test('guards zero volts and zero rating', () {
      expect(
        CapacitorCalculator.evaluate(ratedMfd: 45, startAmps: 6, capVolts: 0),
        isA<CapacitorInvalid>(),
      );
      expect(
        CapacitorCalculator.evaluate(ratedMfd: 0, startAmps: 6, capVolts: 360),
        isA<CapacitorInvalid>(),
      );
    });
  });

  group('AirflowCalculator', () {
    test('needs all four inputs', () {
      expect(
        AirflowCalculator.calculate(volts: 240, amps: 20, returnTemp: 70),
        isA<AirflowIncomplete>(),
      );
    });

    test('computes CFM from the sensible heat formula', () {
      // (240 × 20 × 3.413) ÷ (1.08 × 30) = 505.63 CFM.
      final outcome = AirflowCalculator.calculate(
        volts: 240,
        amps: 20,
        returnTemp: 70,
        supplyTemp: 100,
      ) as AirflowSuccess;
      expect(outcome.result.deltaT, closeTo(30, 1e-9));
      expect(outcome.result.cfm, closeTo(505.63, 0.01));
    });

    test('rejects zero and negative delta T', () {
      expect(
        AirflowCalculator.calculate(
          volts: 240,
          amps: 20,
          returnTemp: 70,
          supplyTemp: 70,
        ),
        isA<AirflowInvalid>(),
      );
      expect(
        AirflowCalculator.calculate(
          volts: 240,
          amps: 20,
          returnTemp: 70,
          supplyTemp: 60,
        ),
        isA<AirflowInvalid>(),
      );
    });
  });

  group('SuperheatCalculator', () {
    test('returns null while an input is missing', () {
      expect(SuperheatCalculator.calculate(indoorWetBulb: 64), isNull);
    });

    test('computes a safe target', () {
      // ((3 × 64) − 80 − 85) ÷ 2 = 13.5 °F.
      final result = SuperheatCalculator.calculate(
        indoorWetBulb: 64,
        outdoorDryBulb: 85,
      )!;
      expect(result.targetSuperheat, closeTo(13.5, 1e-9));
      expect(result.status, SuperheatStatus.ok);
    });

    test('flags targets below 5 °F', () {
      // ((3 × 58) − 80 − 95) ÷ 2 = −0.5 °F.
      final result = SuperheatCalculator.calculate(
        indoorWetBulb: 58,
        outdoorDryBulb: 95,
      )!;
      expect(result.targetSuperheat, closeTo(-0.5, 1e-9));
      expect(result.status, SuperheatStatus.tooLow);
    });

    test('exactly 5 °F is still safe', () {
      // ((3 × 60) − 80 − 90) ÷ 2 = 5 °F.
      final result = SuperheatCalculator.calculate(
        indoorWetBulb: 60,
        outdoorDryBulb: 90,
      )!;
      expect(result.targetSuperheat, closeTo(5, 1e-9));
      expect(result.status, SuperheatStatus.ok);
    });
  });

  group('formatNumber', () {
    test('trims trailing zeros', () {
      expect(formatNumber(12.50), '12.5');
      expect(formatNumber(18), '18');
    });

    test('handles non-finite and negative zero', () {
      expect(formatNumber(double.nan), '—');
      expect(formatNumber(double.infinity), '—');
      expect(formatNumber(-0.001), '0');
    });
  });
}
