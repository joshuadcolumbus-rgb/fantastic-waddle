import 'package:flex_color_scheme/flex_color_scheme.dart';
import 'package:flutter/material.dart';

/// SnapQuote's high-contrast Material 3 dark theme: deep navy surfaces
/// with an electric blue accent.
abstract final class AppTheme {
  static const Color electricBlue = Color(0xFF2979FF);
  static const Color electricCyan = Color(0xFF00E5FF);
  static const Color deepNavy = Color(0xFF0A1128);
  static const Color navyScaffold = Color(0xFF050B18);

  static ThemeData get dark => FlexThemeData.dark(
        colors: FlexSchemeColor.from(
          primary: electricBlue,
          secondary: electricCyan,
          tertiary: const Color(0xFF82B1FF),
          brightness: Brightness.dark,
        ),
        surfaceMode: FlexSurfaceMode.levelSurfacesLowScaffold,
        blendLevel: 12,
        scaffoldBackground: navyScaffold,
        surface: deepNavy,
        subThemesData: const FlexSubThemesData(
          blendOnLevel: 14,
          defaultRadius: 12,
          cardRadius: 16,
          inputDecoratorBorderType: FlexInputBorderType.outline,
          inputDecoratorRadius: 12,
        ),
        visualDensity: FlexColorScheme.comfortablePlatformDensity,
      );
}
