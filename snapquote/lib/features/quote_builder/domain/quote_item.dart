import 'package:freezed_annotation/freezed_annotation.dart';

part 'quote_item.freezed.dart';

/// A single line item on a quote: one service pulled from the catalog.
@freezed
abstract class QuoteItem with _$QuoteItem {
  const factory QuoteItem({
    required String id,
    required String name,
    required double materialCost,
    required double estimatedHours,
  }) = _QuoteItem;
}
