import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../../core/utils/calculator_engine.dart';
import '../../../settings/presentation/providers/settings_provider.dart';
import '../../domain/quote_item.dart';

part 'quote_providers.g.dart';

/// The line items currently on the quote being built.
@riverpod
class QuoteItemList extends _$QuoteItemList {
  @override
  List<QuoteItem> build() => const [];

  void add({
    required String name,
    required double materialCost,
    required double estimatedHours,
  }) {
    state = [
      ...state,
      QuoteItem(
        id: '${DateTime.now().microsecondsSinceEpoch}_${state.length}',
        name: name,
        materialCost: materialCost,
        estimatedHours: estimatedHours,
      ),
    ];
  }

  void remove(String id) =>
      state = state.where((item) => item.id != id).toList();

  void clear() => state = const [];
}

/// Aggregated pricing for the current quote, recomputed instantly whenever
/// the item list or company settings change.
class QuoteTotals {
  const QuoteTotals({required this.minimumPrice, required this.netProfit});

  final double minimumPrice;
  final double netProfit;
}

@riverpod
QuoteTotals quoteTotal(Ref ref) {
  final items = ref.watch(quoteItemListProvider);
  final settings = ref.watch(settingsControllerProvider);
  const engine = CalculatorEngine();

  final materials =
      items.fold<double>(0, (sum, item) => sum + item.materialCost);
  final hours =
      items.fold<double>(0, (sum, item) => sum + item.estimatedHours);

  if (items.isEmpty) {
    return const QuoteTotals(minimumPrice: 0, netProfit: 0);
  }

  return QuoteTotals(
    minimumPrice: engine.calculateMinimumPrice(
      directMaterialCosts: materials,
      laborHours: hours,
      settings: settings,
    ),
    netProfit: engine.calculateNetProfit(
      directMaterialCosts: materials,
      laborHours: hours,
      settings: settings,
    ),
  );
}
