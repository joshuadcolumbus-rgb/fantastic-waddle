import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

/// Glowing readout panel for a computed value.
///
/// [accent] drives the border, glow, and value color — pass a status color
/// (success/warning/danger) or leave the default neon cyan.
class ResultCard extends StatelessWidget {
  const ResultCard({
    super.key,
    required this.label,
    required this.value,
    this.unit,
    this.caption,
    this.icon,
    this.accent = AppColors.neonCyan,
    this.emphasized = true,
  });

  final String label;
  final String value;
  final String? unit;
  final String? caption;
  final IconData? icon;
  final Color accent;

  /// When false the card renders smaller and without the glow — useful for
  /// secondary readouts (e.g. echoing the inputs alongside a solved value).
  final bool emphasized;

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      padding: EdgeInsets.all(emphasized ? 20 : 14),
      decoration: BoxDecoration(
        color: AppColors.surfaceRaised,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: accent.withValues(alpha: emphasized ? 0.7 : 0.35),
          width: emphasized ? 1.4 : 1,
        ),
        boxShadow: emphasized
            ? [
                BoxShadow(
                  color: accent.withValues(alpha: 0.18),
                  blurRadius: 24,
                  spreadRadius: 1,
                ),
              ]
            : null,
      ),
      child: Row(
        children: [
          if (icon != null) ...[
            Icon(icon, color: accent, size: emphasized ? 30 : 22),
            SizedBox(width: emphasized ? 16 : 12),
          ],
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label.toUpperCase(),
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.2,
                  ),
                ),
                const SizedBox(height: 4),
                Text.rich(
                  TextSpan(
                    text: value,
                    style: TextStyle(
                      color: accent,
                      fontSize: emphasized ? 34 : 22,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.5,
                    ),
                    children: [
                      if (unit != null)
                        TextSpan(
                          text: ' $unit',
                          style: TextStyle(
                            color: accent.withValues(alpha: 0.75),
                            fontSize: emphasized ? 18 : 14,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                    ],
                  ),
                ),
                if (caption != null) ...[
                  const SizedBox(height: 6),
                  Text(
                    caption!,
                    style: const TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 13,
                      height: 1.35,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
