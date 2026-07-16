import 'package:flutter/material.dart';

import '../logic/calculators.dart';
import '../state/app_state.dart';
import '../theme/app_theme.dart';
import '../widgets/calc_text_field.dart';
import '../widgets/result_card.dart';

enum _HvacCalc { deltaT, airflow, superheat }

/// HVAC Suite: Delta T, Airflow CFM (sensible heat), and Target Superheat,
/// switched with a segmented control. Inputs live in [AppState], so they
/// survive both segment switches and bottom-tab switches.
class HvacScreen extends StatefulWidget {
  const HvacScreen({super.key, required this.appState});

  final AppState appState;

  @override
  State<HvacScreen> createState() => _HvacScreenState();
}

class _HvacScreenState extends State<HvacScreen> {
  _HvacCalc _selected = _HvacCalc.deltaT;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 32),
      children: [
        const Text(
          'HVAC Suite',
          style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 4),
        const Text(
          'Temperature split, airflow, and charging targets',
          style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
        ),
        const SizedBox(height: 20),
        SegmentedButton<_HvacCalc>(
          segments: const [
            ButtonSegment(
              value: _HvacCalc.deltaT,
              label: Text('Delta T'),
              icon: Icon(Icons.thermostat_rounded, size: 18),
            ),
            ButtonSegment(
              value: _HvacCalc.airflow,
              label: Text('Airflow CFM'),
              icon: Icon(Icons.air_rounded, size: 18),
            ),
            ButtonSegment(
              value: _HvacCalc.superheat,
              label: Text('Superheat'),
              icon: Icon(Icons.device_thermostat_rounded, size: 18),
            ),
          ],
          selected: {_selected},
          onSelectionChanged: (selection) =>
              setState(() => _selected = selection.first),
          showSelectedIcon: false,
        ),
        const SizedBox(height: 24),
        switch (_selected) {
          _HvacCalc.deltaT => _DeltaTView(appState: widget.appState),
          _HvacCalc.airflow => _AirflowView(appState: widget.appState),
          _HvacCalc.superheat => _SuperheatView(appState: widget.appState),
        },
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Delta T
// ---------------------------------------------------------------------------

class _DeltaTView extends StatelessWidget {
  const _DeltaTView({required this.appState});

  final AppState appState;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text(
          'Evaporator temperature split — cooling mode',
          style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
        ),
        const SizedBox(height: 16),
        CalcTextField(
          controller: appState.returnTempController,
          label: 'Return air temperature',
          unit: '°F',
          icon: Icons.arrow_downward_rounded,
          hint: 'e.g. 75',
        ),
        const SizedBox(height: 16),
        CalcTextField(
          controller: appState.supplyTempController,
          label: 'Supply air temperature',
          unit: '°F',
          icon: Icons.arrow_upward_rounded,
          hint: 'e.g. 57',
        ),
        const SizedBox(height: 24),
        ListenableBuilder(
          listenable: appState,
          builder: (context, _) {
            final result = appState.deltaTResult;
            if (result == null) {
              return const ResultCard(
                label: 'Delta T',
                value: '—',
                icon: Icons.thermostat_rounded,
                accent: AppColors.electricBlue,
                caption: 'Enter both temperatures to calculate the split.',
                emphasized: false,
              );
            }
            final (accent, statusText) = switch (result.status) {
              DeltaTStatus.low => (
                  AppColors.warning,
                  'Below the ${formatNumber(DeltaTCalculator.targetMin)}–'
                      '${formatNumber(DeltaTCalculator.targetMax)} °F target. '
                      'Possible low refrigerant charge or excessive airflow.',
                ),
              DeltaTStatus.inRange => (
                  AppColors.success,
                  'Within the typical ${formatNumber(DeltaTCalculator.targetMin)}–'
                      '${formatNumber(DeltaTCalculator.targetMax)} °F cooling range.',
                ),
              DeltaTStatus.high => (
                  AppColors.danger,
                  'Above the ${formatNumber(DeltaTCalculator.targetMin)}–'
                      '${formatNumber(DeltaTCalculator.targetMax)} °F target. '
                      'Check for restricted airflow — dirty filter or coil.',
                ),
            };
            return ResultCard(
              label: 'Delta T',
              value: formatNumber(result.deltaT, decimals: 1),
              unit: '°F',
              icon: Icons.thermostat_rounded,
              accent: accent,
              caption: statusText,
            );
          },
        ),
        const SizedBox(height: 16),
        const Text(
          'ΔT = Return − Supply. Target range assumes standard residential '
          'cooling; heat pumps in heating mode read differently.',
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

// ---------------------------------------------------------------------------
// Airflow CFM (sensible heat method)
// ---------------------------------------------------------------------------

class _AirflowView extends StatelessWidget {
  const _AirflowView({required this.appState});

  final AppState appState;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text(
          'Sensible heat method — run electric heat, measure at the unit',
          style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
        ),
        const SizedBox(height: 16),
        CalcTextField(
          controller: appState.heaterVoltsController,
          label: 'Heater voltage',
          unit: 'V',
          icon: Icons.bolt_rounded,
          hint: 'e.g. 240',
        ),
        const SizedBox(height: 16),
        CalcTextField(
          controller: appState.heaterAmpsController,
          label: 'Heater current',
          unit: 'A',
          icon: Icons.electric_meter_rounded,
          hint: 'e.g. 20',
        ),
        const SizedBox(height: 16),
        CalcTextField(
          controller: appState.cfmReturnTempController,
          label: 'Return air temperature',
          unit: '°F',
          icon: Icons.arrow_downward_rounded,
          hint: 'e.g. 70',
        ),
        const SizedBox(height: 16),
        CalcTextField(
          controller: appState.cfmSupplyTempController,
          label: 'Supply air temperature',
          unit: '°F',
          icon: Icons.arrow_upward_rounded,
          hint: 'e.g. 100',
        ),
        const SizedBox(height: 24),
        ListenableBuilder(
          listenable: appState,
          builder: (context, _) {
            switch (appState.airflowOutcome) {
              case AirflowIncomplete():
                return const ResultCard(
                  label: 'Airflow',
                  value: '—',
                  icon: Icons.air_rounded,
                  accent: AppColors.electricBlue,
                  caption: 'Fill in all four fields to calculate CFM.',
                  emphasized: false,
                );
              case AirflowInvalid(message: final message):
                return ResultCard(
                  label: 'Airflow',
                  value: '—',
                  icon: Icons.block_rounded,
                  accent: AppColors.danger,
                  caption: message,
                  emphasized: false,
                );
              case AirflowSuccess(result: final result):
                return Column(
                  children: [
                    ResultCard(
                      label: 'Airflow',
                      value: formatNumber(result.cfm, decimals: 0),
                      unit: 'CFM',
                      icon: Icons.air_rounded,
                      caption: 'CFM = (V × A × 3.413) ÷ (1.08 × ΔT)',
                    ),
                    const SizedBox(height: 12),
                    ResultCard(
                      label: 'Heat rise (ΔT)',
                      value: formatNumber(result.deltaT, decimals: 1),
                      unit: '°F',
                      icon: Icons.thermostat_rounded,
                      accent: AppColors.electricBlue,
                      caption: 'ΔT = Supply − Return',
                      emphasized: false,
                    ),
                  ],
                );
            }
          },
        ),
        const SizedBox(height: 16),
        const Text(
          'Assumes all heater watts go into the airstream and standard air '
          'density (1.08 constant). Kilowatt ratings on the data plate are a '
          'good cross-check: W = V × A.',
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

// ---------------------------------------------------------------------------
// Target superheat (fixed orifice)
// ---------------------------------------------------------------------------

class _SuperheatView extends StatelessWidget {
  const _SuperheatView({required this.appState});

  final AppState appState;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text(
          'Charging target for fixed-orifice (piston) systems',
          style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
        ),
        const SizedBox(height: 16),
        CalcTextField(
          controller: appState.indoorWetBulbController,
          label: 'Indoor wet bulb',
          unit: '°F WB',
          icon: Icons.water_drop_rounded,
          hint: 'e.g. 64',
        ),
        const SizedBox(height: 16),
        CalcTextField(
          controller: appState.outdoorDryBulbController,
          label: 'Outdoor dry bulb',
          unit: '°F DB',
          icon: Icons.wb_sunny_rounded,
          hint: 'e.g. 85',
        ),
        const SizedBox(height: 24),
        ListenableBuilder(
          listenable: appState,
          builder: (context, _) {
            final result = appState.superheatResult;
            if (result == null) {
              return const ResultCard(
                label: 'Target superheat',
                value: '—',
                icon: Icons.device_thermostat_rounded,
                accent: AppColors.electricBlue,
                caption: 'Enter both temperatures to calculate the target.',
                emphasized: false,
              );
            }
            final (accent, statusText) = switch (result.status) {
              SuperheatStatus.ok => (
                  AppColors.success,
                  'Charge to this superheat at the suction line.',
                ),
              SuperheatStatus.tooLow => (
                  AppColors.danger,
                  'Target Superheat too low (< '
                      '${formatNumber(SuperheatCalculator.minSafeTarget)}°F). '
                      'Do not liquid charge.',
                ),
            };
            return ResultCard(
              label: 'Target superheat',
              value: formatNumber(result.targetSuperheat, decimals: 1),
              unit: '°F',
              icon: Icons.device_thermostat_rounded,
              accent: accent,
              caption: statusText,
            );
          },
        ),
        const SizedBox(height: 16),
        const Text(
          'Target = ((3 × IWB) − 80 − ODB) ÷ 2. For fixed-orifice systems '
          'only — TXV systems charge by subcooling instead.',
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
