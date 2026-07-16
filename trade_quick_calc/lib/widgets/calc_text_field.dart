import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../theme/app_theme.dart';

/// Numeric input styled for the dark workbench theme: neon focus ring,
/// unit suffix, and a filter that only lets numbers through.
class CalcTextField extends StatelessWidget {
  const CalcTextField({
    super.key,
    required this.controller,
    required this.label,
    required this.unit,
    this.icon,
    this.hint,
  });

  final TextEditingController controller;
  final String label;
  final String unit;
  final IconData? icon;
  final String? hint;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      keyboardType:
          const TextInputType.numberWithOptions(decimal: true, signed: true),
      inputFormatters: [
        FilteringTextInputFormatter.allow(RegExp(r'[-0-9.]')),
      ],
      cursorColor: AppColors.neonCyan,
      style: const TextStyle(
        color: AppColors.textPrimary,
        fontSize: 18,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.3,
      ),
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        hintStyle: const TextStyle(color: AppColors.textSecondary),
        labelStyle: const TextStyle(color: AppColors.textSecondary),
        floatingLabelStyle: const TextStyle(color: AppColors.neonCyan),
        prefixIcon: icon == null
            ? null
            : Icon(icon, color: AppColors.electricBlue, size: 22),
        suffixText: unit,
        suffixStyle: const TextStyle(
          color: AppColors.electricBlue,
          fontWeight: FontWeight.w700,
        ),
        filled: true,
        fillColor: AppColors.surface,
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.outline),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.neonCyan, width: 1.6),
        ),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
      ),
    );
  }
}
