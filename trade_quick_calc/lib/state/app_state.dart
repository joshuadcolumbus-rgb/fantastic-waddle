import 'package:flutter/material.dart';

import '../logic/calculators.dart';

/// Single source of truth for every calculator input in the app.
///
/// Screens listen via [ListenableBuilder]; text fields bind directly to the
/// controllers. Keeping all controllers here lets "Reset All" clear every
/// screen at once, and inputs survive tab switches inside the IndexedStack.
class AppState extends ChangeNotifier {
  AppState() {
    for (final controller in _allControllers) {
      controller.addListener(notifyListeners);
    }
  }

  // Delta T inputs (°F).
  final returnTempController = TextEditingController();
  final supplyTempController = TextEditingController();

  // Ohm's Law inputs.
  final voltsController = TextEditingController();
  final ampsController = TextEditingController();
  final ohmsController = TextEditingController();

  // Capacitor under load inputs.
  final ratedMfdController = TextEditingController();
  final startAmpsController = TextEditingController();
  final capVoltsController = TextEditingController();

  // Airflow CFM (sensible heat) inputs.
  final heaterVoltsController = TextEditingController();
  final heaterAmpsController = TextEditingController();
  final cfmReturnTempController = TextEditingController();
  final cfmSupplyTempController = TextEditingController();

  // Target superheat inputs (°F).
  final indoorWetBulbController = TextEditingController();
  final outdoorDryBulbController = TextEditingController();

  List<TextEditingController> get _allControllers => [
        returnTempController,
        supplyTempController,
        voltsController,
        ampsController,
        ohmsController,
        ratedMfdController,
        startAmpsController,
        capVoltsController,
        heaterVoltsController,
        heaterAmpsController,
        cfmReturnTempController,
        cfmSupplyTempController,
        indoorWetBulbController,
        outdoorDryBulbController,
      ];

  double? _parse(TextEditingController controller) {
    final text = controller.text.trim();
    return text.isEmpty ? null : double.tryParse(text);
  }

  DeltaTResult? get deltaTResult => DeltaTCalculator.calculate(
        returnTemp: _parse(returnTempController),
        supplyTemp: _parse(supplyTempController),
      );

  OhmsLawOutcome get ohmsLawOutcome => OhmsLawCalculator.solve(
        volts: _parse(voltsController),
        amps: _parse(ampsController),
        ohms: _parse(ohmsController),
      );

  CapacitorOutcome get capacitorOutcome => CapacitorCalculator.evaluate(
        ratedMfd: _parse(ratedMfdController),
        startAmps: _parse(startAmpsController),
        capVolts: _parse(capVoltsController),
      );

  AirflowOutcome get airflowOutcome => AirflowCalculator.calculate(
        volts: _parse(heaterVoltsController),
        amps: _parse(heaterAmpsController),
        returnTemp: _parse(cfmReturnTempController),
        supplyTemp: _parse(cfmSupplyTempController),
      );

  SuperheatResult? get superheatResult => SuperheatCalculator.calculate(
        indoorWetBulb: _parse(indoorWetBulbController),
        outdoorDryBulb: _parse(outdoorDryBulbController),
      );

  /// True when any field has content — used to enable the Reset All button.
  bool get hasAnyInput =>
      _allControllers.any((controller) => controller.text.isNotEmpty);

  /// Clears every input on every screen.
  void resetAll() {
    for (final controller in _allControllers) {
      controller.clear();
    }
    notifyListeners();
  }

  @override
  void dispose() {
    for (final controller in _allControllers) {
      controller.dispose();
    }
    super.dispose();
  }
}
