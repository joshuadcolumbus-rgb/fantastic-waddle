// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'settings_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning
/// Holds the active [CompanySettings].
///
/// Seeded with dummy defaults for the MVP; a settings screen can call
/// [update] to change them later.

@ProviderFor(SettingsController)
final settingsControllerProvider = SettingsControllerProvider._();

/// Holds the active [CompanySettings].
///
/// Seeded with dummy defaults for the MVP; a settings screen can call
/// [update] to change them later.
final class SettingsControllerProvider
    extends $NotifierProvider<SettingsController, CompanySettings> {
  /// Holds the active [CompanySettings].
  ///
  /// Seeded with dummy defaults for the MVP; a settings screen can call
  /// [update] to change them later.
  SettingsControllerProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'settingsControllerProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$settingsControllerHash();

  @$internal
  @override
  SettingsController create() => SettingsController();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(CompanySettings value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<CompanySettings>(value),
    );
  }
}

String _$settingsControllerHash() =>
    r'cc309b2067c1f60fe6772d50ef430691f5198792';

/// Holds the active [CompanySettings].
///
/// Seeded with dummy defaults for the MVP; a settings screen can call
/// [update] to change them later.

abstract class _$SettingsController extends $Notifier<CompanySettings> {
  CompanySettings build();
  @$mustCallSuper
  @override
  WhenComplete runBuild() {
    final ref = this.ref as $Ref<CompanySettings, CompanySettings>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<CompanySettings, CompanySettings>,
              CompanySettings,
              Object?,
              Object?
            >;
    return element.handleCreate(ref, build);
  }
}
