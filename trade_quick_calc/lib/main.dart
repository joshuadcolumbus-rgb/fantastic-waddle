import 'package:flutter/material.dart';

import 'screens/electrical_screen.dart';
import 'screens/hvac_screen.dart';
import 'screens/info_screen.dart';
import 'state/app_state.dart';
import 'theme/app_theme.dart';

void main() {
  runApp(const TradeQuickCalcApp());
}

class TradeQuickCalcApp extends StatelessWidget {
  const TradeQuickCalcApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Trade Quick-Calc',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.dark,
      home: const HomeShell(),
    );
  }
}

class HomeShell extends StatefulWidget {
  const HomeShell({super.key});

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  final AppState _appState = AppState();
  int _selectedIndex = 0;

  @override
  void dispose() {
    _appState.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.offline_bolt_rounded, color: AppColors.neonCyan),
            SizedBox(width: 10),
            Text('Trade Quick-Calc'),
          ],
        ),
      ),
      // IndexedStack keeps every suite alive, so inputs and the selected
      // segment survive tab switches — Reset All on the Info tab is the
      // only way to clear the inputs.
      body: IndexedStack(
        index: _selectedIndex,
        children: [
          HvacScreen(appState: _appState),
          ElectricalScreen(appState: _appState),
          InfoScreen(appState: _appState),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) =>
            setState(() => _selectedIndex = index),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.hvac_rounded),
            label: 'HVAC Suite',
          ),
          NavigationDestination(
            icon: Icon(Icons.bolt_rounded),
            label: 'Electrical Suite',
          ),
          NavigationDestination(
            icon: Icon(Icons.info_outline_rounded),
            label: 'Info',
          ),
        ],
      ),
    );
  }
}
