/// Pure calculation logic for Trade Quick-Calc.
///
/// No Flutter imports — everything here is plain Dart so it can be unit
/// tested without a widget environment.
library;

// ---------------------------------------------------------------------------
// Delta T (evaporator temperature split, cooling)
// ---------------------------------------------------------------------------

/// How a measured Delta T compares against the typical cooling target range.
enum DeltaTStatus { low, inRange, high }

class DeltaTResult {
  const DeltaTResult({required this.deltaT, required this.status});

  final double deltaT;
  final DeltaTStatus status;
}

class DeltaTCalculator {
  DeltaTCalculator._();

  /// Typical evaporator Delta T target range for residential cooling (°F).
  static const double targetMin = 16;
  static const double targetMax = 22;

  /// Delta T = return air temperature − supply air temperature.
  ///
  /// Returns null while either input is missing.
  static DeltaTResult? calculate({double? returnTemp, double? supplyTemp}) {
    if (returnTemp == null || supplyTemp == null) return null;

    final deltaT = returnTemp - supplyTemp;
    final DeltaTStatus status;
    if (deltaT < targetMin) {
      status = DeltaTStatus.low;
    } else if (deltaT > targetMax) {
      status = DeltaTStatus.high;
    } else {
      status = DeltaTStatus.inRange;
    }
    return DeltaTResult(deltaT: deltaT, status: status);
  }
}

// ---------------------------------------------------------------------------
// Ohm's Law
// ---------------------------------------------------------------------------

/// Which electrical quantity a solve produced.
enum OhmsLawField { volts, amps, ohms }

class OhmsLawResult {
  const OhmsLawResult({
    required this.volts,
    required this.amps,
    required this.ohms,
    required this.watts,
    required this.solvedFor,
  });

  final double volts;
  final double amps;
  final double ohms;
  final double watts;
  final OhmsLawField solvedFor;
}

/// Outcome of an Ohm's Law solve attempt.
sealed class OhmsLawOutcome {
  const OhmsLawOutcome();
}

/// Fewer than two of the three fields are filled in.
class OhmsLawIncomplete extends OhmsLawOutcome {
  const OhmsLawIncomplete();
}

/// All three fields are filled in — one must be left blank to solve.
class OhmsLawOverdetermined extends OhmsLawOutcome {
  const OhmsLawOverdetermined();
}

/// The requested solve would divide by zero.
class OhmsLawDivisionByZero extends OhmsLawOutcome {
  const OhmsLawDivisionByZero(this.message);

  final String message;
}

class OhmsLawSuccess extends OhmsLawOutcome {
  const OhmsLawSuccess(this.result);

  final OhmsLawResult result;
}

class OhmsLawCalculator {
  OhmsLawCalculator._();

  /// Solves for the missing quantity given exactly two of volts, amps, ohms.
  ///
  /// Power (watts) is always derived alongside the solved value.
  static OhmsLawOutcome solve({double? volts, double? amps, double? ohms}) {
    final provided =
        [volts, amps, ohms].where((value) => value != null).length;
    if (provided < 2) return const OhmsLawIncomplete();
    if (provided > 2) return const OhmsLawOverdetermined();

    if (volts != null && amps != null) {
      // R = V / I
      if (amps == 0) {
        return const OhmsLawDivisionByZero(
          'Amps cannot be zero when solving for resistance (R = V ÷ I).',
        );
      }
      return OhmsLawSuccess(OhmsLawResult(
        volts: volts,
        amps: amps,
        ohms: volts / amps,
        watts: volts * amps,
        solvedFor: OhmsLawField.ohms,
      ));
    }

    if (volts != null && ohms != null) {
      // I = V / R
      if (ohms == 0) {
        return const OhmsLawDivisionByZero(
          'Ohms cannot be zero when solving for current (I = V ÷ R).',
        );
      }
      final solvedAmps = volts / ohms;
      return OhmsLawSuccess(OhmsLawResult(
        volts: volts,
        amps: solvedAmps,
        ohms: ohms,
        watts: volts * solvedAmps,
        solvedFor: OhmsLawField.amps,
      ));
    }

    // V = I × R — multiplication only, no zero guard needed.
    final solvedVolts = amps! * ohms!;
    return OhmsLawSuccess(OhmsLawResult(
      volts: solvedVolts,
      amps: amps,
      ohms: ohms,
      watts: solvedVolts * amps,
      solvedFor: OhmsLawField.volts,
    ));
  }
}

// ---------------------------------------------------------------------------
// Capacitor under load
// ---------------------------------------------------------------------------

/// Health verdict from comparing measured capacitance against the rating.
enum CapacitorStatus { healthy, weak }

class CapacitorResult {
  const CapacitorResult({
    required this.measuredMfd,
    required this.ratedMfd,
    required this.deviationPercent,
    required this.status,
  });

  final double measuredMfd;
  final double ratedMfd;

  /// Signed deviation from rated, in percent (negative = reading low).
  final double deviationPercent;
  final CapacitorStatus status;
}

sealed class CapacitorOutcome {
  const CapacitorOutcome();
}

/// One or more of the three fields is still empty.
class CapacitorIncomplete extends CapacitorOutcome {
  const CapacitorIncomplete();
}

/// An input makes the math impossible (zero/negative volts or rating).
class CapacitorInvalid extends CapacitorOutcome {
  const CapacitorInvalid(this.message);

  final String message;
}

class CapacitorSuccess extends CapacitorOutcome {
  const CapacitorSuccess(this.result);

  final CapacitorResult result;
}

class CapacitorCalculator {
  CapacitorCalculator._();

  /// 2652 = 10⁶ ÷ (2π × 60 Hz) — the standard under-load constant.
  static const double loadConstant = 2652;

  /// Measured capacitance within ±[tolerancePercent] of rated is healthy.
  static const double tolerancePercent = 6;

  /// MFD = (start amps × 2652) ÷ capacitor volts, checked against rating.
  static CapacitorOutcome evaluate({
    double? ratedMfd,
    double? startAmps,
    double? capVolts,
  }) {
    if (ratedMfd == null || startAmps == null || capVolts == null) {
      return const CapacitorIncomplete();
    }
    if (capVolts <= 0) {
      return const CapacitorInvalid(
        'Capacitor volts must be greater than zero (MFD = Amps × 2652 ÷ Volts).',
      );
    }
    if (ratedMfd <= 0) {
      return const CapacitorInvalid(
        'Rated MFD must be greater than zero to check deviation.',
      );
    }

    final measuredMfd = startAmps * loadConstant / capVolts;
    final deviationPercent = (measuredMfd - ratedMfd) / ratedMfd * 100;
    final status = deviationPercent.abs() <= tolerancePercent
        ? CapacitorStatus.healthy
        : CapacitorStatus.weak;
    return CapacitorSuccess(CapacitorResult(
      measuredMfd: measuredMfd,
      ratedMfd: ratedMfd,
      deviationPercent: deviationPercent,
      status: status,
    ));
  }
}

// ---------------------------------------------------------------------------
// Airflow CFM (sensible heat method, electric heat)
// ---------------------------------------------------------------------------

class AirflowResult {
  const AirflowResult({required this.deltaT, required this.cfm});

  final double deltaT;
  final double cfm;
}

sealed class AirflowOutcome {
  const AirflowOutcome();
}

/// One or more of the four fields is still empty.
class AirflowIncomplete extends AirflowOutcome {
  const AirflowIncomplete();
}

/// ΔT ≤ 0 — the sensible heat formula would divide by zero or go negative.
class AirflowInvalid extends AirflowOutcome {
  const AirflowInvalid(this.message);

  final String message;
}

class AirflowSuccess extends AirflowOutcome {
  const AirflowSuccess(this.result);

  final AirflowResult result;
}

class AirflowCalculator {
  AirflowCalculator._();

  /// Watts per volt-amp → BTU/h conversion.
  static const double btuPerWatt = 3.413;

  /// Sensible heat constant for standard air.
  static const double sensibleHeatConstant = 1.08;

  /// CFM = (volts × amps × 3.413) ÷ (1.08 × ΔT), with ΔT = supply − return.
  static AirflowOutcome calculate({
    double? volts,
    double? amps,
    double? returnTemp,
    double? supplyTemp,
  }) {
    if (volts == null ||
        amps == null ||
        returnTemp == null ||
        supplyTemp == null) {
      return const AirflowIncomplete();
    }

    final deltaT = supplyTemp - returnTemp;
    if (deltaT <= 0) {
      return const AirflowInvalid(
        'Supply must be warmer than return (ΔT > 0). With electric heat '
        'running, re-check probe placement.',
      );
    }

    final cfm = volts * amps * btuPerWatt / (sensibleHeatConstant * deltaT);
    return AirflowSuccess(AirflowResult(deltaT: deltaT, cfm: cfm));
  }
}

// ---------------------------------------------------------------------------
// Target superheat (fixed-orifice charging)
// ---------------------------------------------------------------------------

enum SuperheatStatus { ok, tooLow }

class SuperheatResult {
  const SuperheatResult({required this.targetSuperheat, required this.status});

  final double targetSuperheat;
  final SuperheatStatus status;
}

class SuperheatCalculator {
  SuperheatCalculator._();

  /// Below this target (°F) do not liquid charge.
  static const double minSafeTarget = 5;

  /// Target superheat = ((3 × indoor wet bulb) − 80 − outdoor dry bulb) ÷ 2.
  ///
  /// Returns null while either input is missing.
  static SuperheatResult? calculate({
    double? indoorWetBulb,
    double? outdoorDryBulb,
  }) {
    if (indoorWetBulb == null || outdoorDryBulb == null) return null;

    final target = (3 * indoorWetBulb - 80 - outdoorDryBulb) / 2;
    return SuperheatResult(
      targetSuperheat: target,
      status:
          target < minSafeTarget ? SuperheatStatus.tooLow : SuperheatStatus.ok,
    );
  }
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/// Formats a value for display, trimming trailing zeros (12.50 → "12.5").
String formatNumber(double value, {int decimals = 2}) {
  if (value.isNaN || value.isInfinite) return '—';
  var text = value.toStringAsFixed(decimals);
  if (text.contains('.')) {
    text = text.replaceFirst(RegExp(r'0+$'), '').replaceFirst(RegExp(r'\.$'), '');
  }
  // Avoid "-0" from tiny negative values rounding to zero.
  return text == '-0' ? '0' : text;
}
