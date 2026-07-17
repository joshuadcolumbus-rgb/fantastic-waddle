import 'package:freezed_annotation/freezed_annotation.dart';

part 'company_settings.freezed.dart';

/// Company-wide pricing configuration used by the [CalculatorEngine]
/// to derive the minimum acceptable price for a quote.
@freezed
abstract class CompanySettings with _$CompanySettings {
  const factory CompanySettings({
    /// Fully-burdened labor rate charged per hour, in dollars.
    required double hourlyRate,

    /// Flat overhead fee applied to every job, in dollars.
    required double overheadFee,

    /// Target gross margin as a percentage (e.g. 40 means 40%).
    required double targetMargin,
  }) = _CompanySettings;
}
