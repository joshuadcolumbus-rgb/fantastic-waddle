import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../settings/presentation/screens/subscription_screen.dart';
import '../../domain/quote_item.dart';
import '../providers/quote_providers.dart';
import '../widgets/signature_modal.dart';
import 'pdf_preview_screen.dart';

String _money(double value) => '\$${value.toStringAsFixed(2)}';

/// A service offered in the standard HVAC catalog.
class CatalogService {
  const CatalogService(this.name, this.materialCost, this.estimatedHours);

  final String name;
  final double materialCost;
  final double estimatedHours;
}

const List<CatalogService> hvacCatalog = [
  CatalogService('AC Diagnostic Visit', 0, 1),
  CatalogService('Refrigerant Recharge (R-410A)', 85, 1.5),
  CatalogService('Capacitor Replacement', 45, 0.75),
  CatalogService('Contactor Replacement', 55, 1),
  CatalogService('Condenser Coil Cleaning', 25, 1.5),
  CatalogService('Condensate Drain Line Flush', 15, 0.5),
  CatalogService('Smart Thermostat Install', 210, 1),
  CatalogService('Furnace Ignitor Replacement', 60, 1),
  CatalogService('Full System Tune-Up', 40, 2),
  CatalogService('Ductwork Repair (per section)', 120, 2),
  CatalogService('Blower Motor Replacement', 320, 2.5),
  CatalogService('UV Air Purifier Install', 400, 1.5),
  CatalogService('Evaporator Coil Replacement', 650, 4),
  CatalogService('Air Handler Replacement', 1400, 6),
  CatalogService('Mini-Split Install (Single Zone)', 1850, 8),
];

/// Main workspace: browse the service catalog, build the current quote,
/// and watch live pricing in the floating glass bottom bar.
class BuilderScreen extends ConsumerStatefulWidget {
  const BuilderScreen({super.key});

  @override
  ConsumerState<BuilderScreen> createState() => _BuilderScreenState();
}

class _BuilderScreenState extends ConsumerState<BuilderScreen> {
  String _search = '';

  List<CatalogService> get _filteredCatalog {
    final query = _search.trim().toLowerCase();
    if (query.isEmpty) return hvacCatalog;
    return hvacCatalog
        .where((service) => service.name.toLowerCase().contains(query))
        .toList();
  }

  Future<void> _signAndPreview() async {
    final signature = await showSignatureModal(context);
    if (signature == null || !mounted) return;
    await Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => PdfPreviewScreen(signature: signature),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final itemCount = ref.watch(quoteItemListProvider).length;

    return LayoutBuilder(
      builder: (context, constraints) {
        final isWide = constraints.maxWidth >= 900;
        return DefaultTabController(
          length: 2,
          child: Scaffold(
            appBar: AppBar(
              title: const Text(
                'SnapQuote',
                style: TextStyle(fontWeight: FontWeight.w700),
              ),
              actions: [
                IconButton(
                  tooltip: 'Upgrade to Pro',
                  icon: const Icon(Icons.workspace_premium_outlined),
                  onPressed: () => Navigator.of(context).push(
                    MaterialPageRoute<void>(
                      builder: (_) => const SubscriptionScreen(),
                    ),
                  ),
                ),
                IconButton(
                  tooltip: 'Sign out',
                  icon: const Icon(Icons.logout),
                  onPressed: () =>
                      ref.read(authControllerProvider.notifier).signOut(),
                ),
              ],
              bottom: isWide
                  ? null
                  : TabBar(
                      tabs: [
                        const Tab(
                          icon: Icon(Icons.grid_view_rounded),
                          text: 'Catalog',
                        ),
                        Tab(
                          icon: const Icon(Icons.receipt_long_outlined),
                          text: 'Quote ($itemCount)',
                        ),
                      ],
                    ),
            ),
            body: Stack(
              children: [
                if (isWide)
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Expanded(flex: 5, child: _buildCatalogPane()),
                      const VerticalDivider(width: 1),
                      Expanded(flex: 7, child: _buildQuotePane()),
                    ],
                  )
                else
                  TabBarView(
                    children: [_buildCatalogPane(), _buildQuotePane()],
                  ),
                Align(
                  alignment: Alignment.bottomCenter,
                  child: _GlassTotalsBar(onSignAndPreview: _signAndPreview),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildCatalogPane() {
    final services = _filteredCatalog;
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: TextField(
            decoration: const InputDecoration(
              prefixIcon: Icon(Icons.search),
              hintText: 'Search HVAC services…',
            ),
            onChanged: (value) => setState(() => _search = value),
          ),
        ),
        Expanded(
          child: services.isEmpty
              ? const Center(child: Text('No services match your search.'))
              : ListView.builder(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 140),
                  itemCount: services.length,
                  itemBuilder: (context, index) {
                    final service = services[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: ListTile(
                        title: Text(service.name),
                        subtitle: Text(
                          '${_money(service.materialCost)} materials · '
                          '${service.estimatedHours} hrs',
                        ),
                        trailing: const Icon(Icons.add_circle_outline),
                        onTap: () =>
                            ref.read(quoteItemListProvider.notifier).add(
                                  name: service.name,
                                  materialCost: service.materialCost,
                                  estimatedHours: service.estimatedHours,
                                ),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildQuotePane() {
    final items = ref.watch(quoteItemListProvider);
    if (items.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.receipt_long_outlined,
              size: 56,
              color: Theme.of(context).colorScheme.primary,
            ),
            const SizedBox(height: 12),
            const Text('Your quote is empty.'),
            const SizedBox(height: 4),
            Text(
              'Tap services in the catalog to add them.',
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 140),
      itemCount: items.length,
      itemBuilder: (context, index) {
        final item = items[index];
        return _QuoteItemTile(key: ValueKey(item.id), item: item);
      },
    );
  }
}

/// One line item on the current quote. Slides/fades in on add and plays
/// the same animation in reverse before it is removed from state.
class _QuoteItemTile extends ConsumerStatefulWidget {
  const _QuoteItemTile({required this.item, super.key});

  final QuoteItem item;

  @override
  ConsumerState<_QuoteItemTile> createState() => _QuoteItemTileState();
}

class _QuoteItemTileState extends ConsumerState<_QuoteItemTile> {
  static const _animDuration = Duration(milliseconds: 260);
  bool _removing = false;

  Future<void> _remove() async {
    setState(() => _removing = true);
    await Future<void>.delayed(_animDuration);
    if (!mounted) return;
    ref.read(quoteItemListProvider.notifier).remove(widget.item.id);
  }

  @override
  Widget build(BuildContext context) {
    final item = widget.item;
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor:
              Theme.of(context).colorScheme.primary.withValues(alpha: 0.15),
          child: Icon(
            Icons.build_outlined,
            size: 20,
            color: Theme.of(context).colorScheme.primary,
          ),
        ),
        title: Text(item.name),
        subtitle: Text(
          '${_money(item.materialCost)} materials · ${item.estimatedHours} hrs',
        ),
        trailing: IconButton(
          tooltip: 'Remove',
          icon: const Icon(Icons.delete_outline),
          onPressed: _removing ? null : _remove,
        ),
      ),
    )
        .animate(target: _removing ? 0 : 1)
        .fadeIn(duration: _animDuration, curve: Curves.easeOut)
        .slideX(
          begin: 0.12,
          end: 0,
          duration: _animDuration,
          curve: Curves.easeOutCubic,
        );
  }
}

/// Floating glassmorphism bottom bar showing live quote totals.
class _GlassTotalsBar extends ConsumerWidget {
  const _GlassTotalsBar({required this.onSignAndPreview});

  final Future<void> Function() onSignAndPreview;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final totals = ref.watch(quoteTotalProvider);
    final hasItems = ref.watch(quoteItemListProvider).isNotEmpty;
    final colorScheme = Theme.of(context).colorScheme;

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 720),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(24),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 18, sigmaY: 18),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              decoration: BoxDecoration(
                color: colorScheme.surface.withValues(alpha: 0.55),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(
                  color: Colors.white.withValues(alpha: 0.10),
                ),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: _TotalReadout(
                      label: 'MINIMUM PRICE',
                      value: totals.minimumPrice,
                      color: colorScheme.primary,
                    ),
                  ),
                  Expanded(
                    child: _TotalReadout(
                      label: 'NET PROFIT',
                      value: totals.netProfit,
                      color: colorScheme.secondary,
                    ),
                  ),
                  FilledButton.icon(
                    onPressed: hasItems ? onSignAndPreview : null,
                    icon: const Icon(Icons.draw_outlined),
                    label: const Text('Sign & PDF'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// A labeled dollar amount that re-animates every time its value changes.
class _TotalReadout extends StatelessWidget {
  const _TotalReadout({
    required this.label,
    required this.value,
    required this.color,
  });

  final String label;
  final double value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          label,
          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                letterSpacing: 1.2,
                color: Colors.white70,
              ),
        ),
        const SizedBox(height: 2),
        Text(
          _money(value),
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w700,
                color: color,
              ),
        )
            .animate(key: ValueKey(value))
            .fadeIn(duration: 250.ms)
            .slideY(begin: 0.35, end: 0, curve: Curves.easeOutCubic),
      ],
    );
  }
}
