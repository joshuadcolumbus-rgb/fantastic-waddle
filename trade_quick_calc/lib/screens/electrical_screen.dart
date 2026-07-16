import 'package:flutter/material.dart';

import '../logic/calculators.dart';
import '../state/app_state.dart';
import '../theme/app_theme.dart';
import '../widgets/calc_text_field.dart';
import '../widgets/result_card.dart';

enum _ElectricalCalc { ohmsLaw, capacitor }

/// Electrical Suite: Ohm's Law solver and Capacitor Under Load test,
/// switched with a segmented control. Inputs live in [AppState], so they
/// survive both segment switches and bottom-tab switches.
class ElectricalScreen extends StatefulWidget {
  const ElectricalScreen({super.key, required this.appState});

  final AppState appState;

  @override
  State<ElectricalScreen> createState() => _ElectricalScreenState();
}

class _ElectricalScreenState extends State<ElectricalScreen> {
  _ElectricalCalc _selected = _ElectricalCalc.ohmsLaw;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 32),
      children: [
        const Text(
          'Electrical Suite',
          style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 4),
        const Text(
          'Circuit math and component health checks',
          style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
        ),
        const SizedBox(height: 20),
        SegmentedButton<_ElectricalCalc>(
          segments: const [
            ButtonSegment(
              value: _ElectricalCalc.ohmsLaw,
              label: Text("Ohm's Law"),
              icon: Icon(Icons.bolt_rounded, size: 18),
            ),
            ButtonSegment(
              value: _ElectricalCalc.capacitor,
              label: Text('Capacitor Under Load'),
              icon: Icon(Icons.battery_charging_full_rounded, size: 18),
            ),
          ],
          selected: {_selected},
          onSelectionChanged: (selection) =>
              setState(() => _selected = selection.first),
          showSelectedIcon: false,
        ),
        const SizedBox(height: 24),
        switch (_selected) {
          _ElectricalCalc.ohmsLaw => _OhmsLawView(appState: widget.appState),
          _ElectricalCalc.capacitor =>
            _CapacitorView(appState: widget.appState),
        },
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Ohm's Law
// ---------------------------------------------------------------------------

class _OhmsLawView extends StatelessWidget {
  const _OhmsLawView({required this.appState});

  final AppState appState;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text(
          'Enter any two values — the third is solved for you',
          style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
        ),
        const SizedBox(height: 16),
        CalcTextField(
          controller: appState.voltsController,
          label: 'Voltage',
          unit: 'V',
          icon: Icons.bolt_rounded,
          hint: 'e.g. 120',
        ),
        const SizedBox(height: 16),
        CalcTextField(
          controller: appState.ampsController,
          label: 'Current',
          unit: 'A',
          icon: Icons.electric_meter_rounded,
          hint: 'e.g. 5',
        ),
        const SizedBox(height: 16),
        CalcTextField(
          controller: appState.ohmsController,
          label: 'Resistance',
          unit: 'Ω',
          icon: Icons.linear_scale_rounded,
          hint: 'leave blank to solve',
        ),
        const SizedBox(height: 24),
        ListenableBuilder(
          listenable: appState,
          builder: (context, _) => _buildOutcome(appState.ohmsLawOutcome),
        ),
      ],
    );
  }

  Widget _buildOutcome(OhmsLawOutcome outcome) {
    switch (outcome) {
      case OhmsLawIncomplete():
        return const ResultCard(
          label: 'Solution',
          value: '—',
          icon: Icons.calculate_rounded,
          accent: AppColors.electricBlue,
          caption: 'Fill in any two of the three fields above.',
          emphasized: false,
        );
      case OhmsLawOverdetermined():
        return const ResultCard(
          label: 'Solution',
          value: '—',
          icon: Icons.rule_rounded,
          accent: AppColors.warning,
          caption:
              'All three fields are filled. Clear the one you want solved.',
          emphasized: false,
        );
      case OhmsLawDivisionByZero(message: final message):
        return ResultCard(
          label: 'Solution',
          value: '—',
          icon: Icons.block_rounded,
          accent: AppColors.danger,
          caption: message,
          emphasized: false,
        );
      case OhmsLawSuccess(result: final result):
        final (label, value, unit) = switch (result.solvedFor) {
          OhmsLawField.volts => (
              'Voltage',
              formatNumber(result.volts),
              'V',
            ),
          OhmsLawField.amps => (
              'Current',
              formatNumber(result.amps),
              'A',
            ),
          OhmsLawField.ohms => (
              'Resistance',
              formatNumber(result.ohms),
              'Ω',
            ),
        };
        return Column(
          children: [
            ResultCard(
              label: '$label (solved)',
              value: value,
              unit: unit,
              icon: Icons.calculate_rounded,
            ),
            const SizedBox(height: 12),
            ResultCard(
              label: 'Power',
              value: formatNumber(result.watts),
              unit: 'W',
              icon: Icons.power_rounded,
              accent: AppColors.electricBlue,
              caption: 'P = V × I',
              emphasized: false,
            ),
          ],
        );
    }
  }
}

// ---------------------------------------------------------------------------
// Capacitor under load
// ---------------------------------------------------------------------------

class _CapacitorView extends StatelessWidget {
  const _CapacitorView({required this.appState});

  final AppState appState;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text(
          'Test run capacitors in place — no discharge and pull needed',
          style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
        ),
        const SizedBox(height: 16),
        CalcTextField(
          controller: appState.ratedMfdController,
          label: 'Rated capacitance',
          unit: 'µF',
          icon: Icons.sell_rounded,
          hint: 'from the label, e.g. 45',
        ),
        const SizedBox(height: 16),
        CalcTextField(
          controller: appState.startAmpsController,
          label: 'Start winding amps',
          unit: 'A',
          icon: Icons.electric_meter_rounded,
          hint: 'clamp the start wire, e.g. 6',
        ),
        const SizedBox(height: 16),
        CalcTextField(
          controller: appState.capVoltsController,
          label: 'Volts across capacitor',
          unit: 'V',
          icon: Icons.bolt_rounded,
          hint: 'e.g. 360',
        ),
        const SizedBox(height: 24),
        ListenableBuilder(
          listenable: appState,
          builder: (context, _) {
            switch (appState.capacitorOutcome) {
              case CapacitorIncomplete():
                return const ResultCard(
                  label: 'Measured capacitance',
                  value: '—',
                  icon: Icons.battery_charging_full_rounded,
                  accent: AppColors.electricBlue,
                  caption: 'Fill in all three fields to test the capacitor.',
                  emphasized: false,
                );
              case CapacitorInvalid(message: final message):
                return ResultCard(
                  label: 'Measured capacitance',
                  value: '—',
                  icon: Icons.block_rounded,
                  accent: AppColors.danger,
                  caption: message,
                  emphasized: false,
                );
              case CapacitorSuccess(result: final result):
                final deviation = result.deviationPercent;
                final deviationText =
                    '${deviation >= 0 ? '+' : ''}${formatNumber(deviation, decimals: 1)}%';
                final (accent, verdict) = switch (result.status) {
                  CapacitorStatus.healthy => (
                      AppColors.success,
                      'Healthy — $deviationText of rated '
                          '${formatNumber(result.ratedMfd)} µF (within ±'
                          '${formatNumber(CapacitorCalculator.tolerancePercent)}%).',
                    ),
                  CapacitorStatus.weak => (
                      AppColors.warning,
                      'Weak / Replace — $deviationText of rated '
                          '${formatNumber(result.ratedMfd)} µF (outside ±'
                          '${formatNumber(CapacitorCalculator.tolerancePercent)}%).',
                    ),
                };
                return ResultCard(
                  label: 'Measured capacitance',
                  value: formatNumber(result.measuredMfd, decimals: 1),
                  unit: 'µF',
                  icon: Icons.battery_charging_full_rounded,
                  accent: accent,
                  caption: verdict,
                );
            }
          },
        ),
        const SizedBox(height: 16),
        const Text(
          'MFD = (Start Amps × 2,652) ÷ Capacitor Volts (60 Hz). Measure with '
          'the unit running and meter leads rated for the circuit.',
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
