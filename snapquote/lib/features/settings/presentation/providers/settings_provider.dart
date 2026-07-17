import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../domain/company_settings.dart';

part 'settings_provider.g.dart';

/// Holds the active [CompanySettings].
///
/// Seeded with dummy defaults for the MVP; a settings screen can call
/// [update] to change them later.
@riverpod
class SettingsController extends _$SettingsController {
  @override
  CompanySettings build() => const CompanySettings(
        hourlyRate: 100,
        overheadFee: 50,
        targetMargin: 40,
      );

  void update(CompanySettings settings) => state = settings;
}
