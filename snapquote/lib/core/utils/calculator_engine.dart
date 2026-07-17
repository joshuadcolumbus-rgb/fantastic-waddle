import '../../features/settings/domain/company_settings.dart';

/// Thrown when [CompanySettings.targetMargin] makes the pricing formula
/// mathematically impossible (a margin of 100% or more divides by zero
/// or produces a negative price).
class MarginException implements Exception {
  const MarginException(this.message);

  final String message;

  @override
  String toString() => 'MarginException: $message';
}

/// Pure, stateless pricing engine.
///
/// Price = (materials + labor + overhead) / (1 - margin / 100)
class CalculatorEngine {
  const CalculatorEngine();

  /// The minimum price to charge for a job so that the company still hits
  /// its [CompanySettings.targetMargin] after direct costs and overhead.
  double calculateMinimumPrice({
    required double directMaterialCosts,
    required double laborHours,
    required CompanySettings settings,
  }) {
    final marginFraction = settings.targetMargin / 100;
    if (marginFraction >= 1) {
      throw const MarginException(
        'targetMargin must be below 100%: a margin of 100% or more makes '
        'the price undefined (division by zero or negative).',
      );
    }

    final totalCost = directMaterialCosts +
        (laborHours * settings.hourlyRate) +
        settings.overheadFee;
    return totalCost / (1 - marginFraction);
  }

  /// Exact gross profit for a job: the minimum price minus every dollar of
  /// cost that went into it (materials, labor, and overhead).
  double calculateNetProfit({
    required double directMaterialCosts,
    required double laborHours,
    required CompanySettings settings,
  }) {
    final price = calculateMinimumPrice(
      directMaterialCosts: directMaterialCosts,
      laborHours: laborHours,
      settings: settings,
    );
    final totalCost = directMaterialCosts +
        (laborHours * settings.hourlyRate) +
        settings.overheadFee;
    return price - totalCost;
  }
}
