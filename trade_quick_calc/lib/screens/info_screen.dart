import 'package:flutter/material.dart';

import '../logic/calculators.dart';
import '../state/app_state.dart';
import '../theme/app_theme.dart';

/// Formula reference, field notes, and the global Reset All action.
class InfoScreen extends StatelessWidget {
  const InfoScreen({super.key, required this.appState});

  final AppState appState;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 32),
      children: [
        const Text(
          'Info',
          style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 4),
        const Text(
          'Formulas, field notes, and app controls',
          style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
        ),
        const SizedBox(height: 24),
        _InfoSection(
          icon: Icons.thermostat_rounded,
          title: 'Delta T',
          lines: [
            'ΔT = Return air − Supply air',
            'Typical cooling target: '
                '${formatNumber(DeltaTCalculator.targetMin)}–'
                '${formatNumber(DeltaTCalculator.targetMax)} °F',
            'Low ΔT → possible low charge or excessive airflow',
            'High ΔT → possible restricted airflow (filter/coil)',
          ],
        ),
        const SizedBox(height: 16),
        _InfoSection(
          icon: Icons.air_rounded,
          title: 'Airflow CFM (sensible heat)',
          lines: [
            'ΔT = Supply − Return  (electric heat running)',
            'CFM = (V × A × ${formatNumber(AirflowCalculator.btuPerWatt, decimals: 3)}) ÷ '
                '(${formatNumber(AirflowCalculator.sensibleHeatConstant)} × ΔT)',
            'ΔT must be above zero — supply warmer than return',
          ],
        ),
        const SizedBox(height: 16),
        _InfoSection(
          icon: Icons.device_thermostat_rounded,
          title: 'Target superheat (fixed orifice)',
          lines: [
            'Target = ((3 × Indoor WB) − 80 − Outdoor DB) ÷ 2',
            'Below ${formatNumber(SuperheatCalculator.minSafeTarget)} °F → '
                'do not liquid charge',
            'TXV systems charge by subcooling instead',
          ],
        ),
        const SizedBox(height: 16),
        _InfoSection(
          icon: Icons.bolt_rounded,
          title: "Ohm's Law",
          lines: const [
            'V = I × R    (volts)',
            'I = V ÷ R    (amps)',
            'R = V ÷ I    (ohms)',
            'P = V × I    (watts)',
          ],
        ),
        const SizedBox(height: 16),
        _InfoSection(
          icon: Icons.battery_charging_full_rounded,
          title: 'Capacitor under load',
          lines: [
            'MFD = (Start Amps × ${formatNumber(CapacitorCalculator.loadConstant, decimals: 0)}) ÷ Cap Volts',
            'Within ±${formatNumber(CapacitorCalculator.tolerancePercent)}% of rated → healthy',
            'Beyond ±${formatNumber(CapacitorCalculator.tolerancePercent)}% → weak, replace',
          ],
        ),
        const SizedBox(height: 24),
        ListenableBuilder(
          listenable: appState,
          builder: (context, _) => OutlinedButton.icon(
            onPressed: appState.hasAnyInput
                ? () {
                    appState.resetAll();
                    ScaffoldMessenger.of(context)
                      ..hideCurrentSnackBar()
                      ..showSnackBar(const SnackBar(
                        content: Text('All calculator inputs cleared.'),
                      ));
                  }
                : null,
            icon: const Icon(Icons.restart_alt_rounded),
            label: const Text('Reset All'),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.danger,
              disabledForegroundColor:
                  AppColors.textSecondary.withValues(alpha: 0.4),
              side: BorderSide(
                color: appState.hasAnyInput
                    ? AppColors.danger.withValues(alpha: 0.7)
                    : AppColors.outline,
              ),
              padding: const EdgeInsets.symmetric(vertical: 16),
              textStyle:
                  const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
          ),
        ),
        const SizedBox(height: 24),
        const Text(
          'Trade Quick-Calc is a field reference only. Always verify readings '
          'with calibrated instruments and follow local codes and '
          'manufacturer specifications.',
          style: TextStyle(
            color: AppColors.textSecondary,
            fontSize: 12,
            height: 1.4,
          ),
        ),
      ],
    );
  }
}

class _InfoSection extends StatelessWidget {
  const _InfoSection({
    required this.icon,
    required this.title,
    required this.lines,
  });

  final IconData icon;
  final String title;
  final List<String> lines;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.outline),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: AppColors.neonCyan, size: 22),
              const SizedBox(width: 10),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          for (final line in lines)
            Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Text(
                line,
                style: const TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 14,
                  height: 1.35,
                  fontFeatures: [FontFeature.tabularFigures()],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
