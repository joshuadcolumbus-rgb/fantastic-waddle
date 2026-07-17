// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'quote_providers.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning
/// The line items currently on the quote being built.

@ProviderFor(QuoteItemList)
final quoteItemListProvider = QuoteItemListProvider._();

/// The line items currently on the quote being built.
final class QuoteItemListProvider
    extends $NotifierProvider<QuoteItemList, List<QuoteItem>> {
  /// The line items currently on the quote being built.
  QuoteItemListProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'quoteItemListProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$quoteItemListHash();

  @$internal
  @override
  QuoteItemList create() => QuoteItemList();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(List<QuoteItem> value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<List<QuoteItem>>(value),
    );
  }
}

String _$quoteItemListHash() => r'1f3f14496cac1565d248924d52e9e8930ab54671';

/// The line items currently on the quote being built.

abstract class _$QuoteItemList extends $Notifier<List<QuoteItem>> {
  List<QuoteItem> build();
  @$mustCallSuper
  @override
  WhenComplete runBuild() {
    final ref = this.ref as $Ref<List<QuoteItem>, List<QuoteItem>>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<List<QuoteItem>, List<QuoteItem>>,
              List<QuoteItem>,
              Object?,
              Object?
            >;
    return element.handleCreate(ref, build);
  }
}

@ProviderFor(quoteTotal)
final quoteTotalProvider = QuoteTotalProvider._();

final class QuoteTotalProvider
    extends $FunctionalProvider<QuoteTotals, QuoteTotals, QuoteTotals>
    with $Provider<QuoteTotals> {
  QuoteTotalProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'quoteTotalProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$quoteTotalHash();

  @$internal
  @override
  $ProviderElement<QuoteTotals> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  QuoteTotals create(Ref ref) {
    return quoteTotal(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(QuoteTotals value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<QuoteTotals>(value),
    );
  }
}

String _$quoteTotalHash() => r'00ccfd56bc3813ca2467c795a0c4cac237b5e3bf';
