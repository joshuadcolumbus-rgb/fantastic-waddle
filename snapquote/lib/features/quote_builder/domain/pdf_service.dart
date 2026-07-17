import 'dart:typed_data';

import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;

import '../../../core/utils/calculator_engine.dart';
import '../../settings/domain/company_settings.dart';
import 'quote_item.dart';

/// Renders the current quote as a branded, customer-facing PDF.
class PdfService {
  const PdfService._();

  static const PdfColor _navy = PdfColor.fromInt(0xFF0A1128);
  static const PdfColor _blue = PdfColor.fromInt(0xFF2979FF);

  static String _money(double value) => '\$${value.toStringAsFixed(2)}';

  static Future<Uint8List> buildQuotePdf({
    required List<QuoteItem> items,
    required CompanySettings settings,
    Uint8List? signature,
  }) async {
    const engine = CalculatorEngine();
    final materials =
        items.fold<double>(0, (sum, item) => sum + item.materialCost);
    final hours =
        items.fold<double>(0, (sum, item) => sum + item.estimatedHours);
    final total = items.isEmpty
        ? 0.0
        : engine.calculateMinimumPrice(
            directMaterialCosts: materials,
            laborHours: hours,
            settings: settings,
          );

    final now = DateTime.now();
    final dateLabel = '${now.month}/${now.day}/${now.year}';
    final doc = pw.Document();

    doc.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.letter,
        margin: const pw.EdgeInsets.all(40),
        build: (context) => [
          // Branded header bar.
          pw.Container(
            padding: const pw.EdgeInsets.all(20),
            decoration: pw.BoxDecoration(
              color: _navy,
              borderRadius: pw.BorderRadius.circular(8),
            ),
            child: pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              crossAxisAlignment: pw.CrossAxisAlignment.center,
              children: [
                pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: [
                    pw.Text(
                      'Delta T Heating and Cooling',
                      style: pw.TextStyle(
                        color: PdfColors.white,
                        fontSize: 20,
                        fontWeight: pw.FontWeight.bold,
                      ),
                    ),
                    pw.SizedBox(height: 4),
                    pw.Text(
                      'Service Quote',
                      style: const pw.TextStyle(
                        color: _blue,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
                pw.Text(
                  dateLabel,
                  style: const pw.TextStyle(
                    color: PdfColors.white,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          pw.SizedBox(height: 24),

          // Itemized grid of services.
          pw.TableHelper.fromTextArray(
            headers: ['Service', 'Materials', 'Est. Hours'],
            data: [
              for (final item in items)
                [
                  item.name,
                  _money(item.materialCost),
                  item.estimatedHours.toStringAsFixed(2),
                ],
            ],
            headerStyle: pw.TextStyle(
              color: PdfColors.white,
              fontWeight: pw.FontWeight.bold,
            ),
            headerDecoration: const pw.BoxDecoration(color: _navy),
            cellAlignments: {
              0: pw.Alignment.centerLeft,
              1: pw.Alignment.centerRight,
              2: pw.Alignment.centerRight,
            },
            cellPadding:
                const pw.EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            border: pw.TableBorder.all(color: PdfColors.grey400, width: 0.5),
          ),
          pw.SizedBox(height: 16),

          // Bold total footer.
          pw.Container(
            padding:
                const pw.EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: pw.BoxDecoration(
              color: _blue,
              borderRadius: pw.BorderRadius.circular(8),
            ),
            child: pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              children: [
                pw.Text(
                  'TOTAL',
                  style: pw.TextStyle(
                    color: PdfColors.white,
                    fontSize: 14,
                    fontWeight: pw.FontWeight.bold,
                  ),
                ),
                pw.Text(
                  _money(total),
                  style: pw.TextStyle(
                    color: PdfColors.white,
                    fontSize: 18,
                    fontWeight: pw.FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),

          // Customer signature block.
          if (signature != null) ...[
            pw.SizedBox(height: 32),
            pw.Text(
              'Approved by customer:',
              style: const pw.TextStyle(fontSize: 11),
            ),
            pw.SizedBox(height: 8),
            pw.Container(
              height: 90,
              padding: const pw.EdgeInsets.all(8),
              decoration: pw.BoxDecoration(
                border: pw.Border.all(color: PdfColors.grey400),
                borderRadius: pw.BorderRadius.circular(6),
              ),
              child: pw.Image(
                pw.MemoryImage(signature),
                fit: pw.BoxFit.contain,
              ),
            ),
            pw.SizedBox(height: 6),
            pw.Text(
              'Signed $dateLabel',
              style: const pw.TextStyle(
                fontSize: 9,
                color: PdfColors.grey600,
              ),
            ),
          ],
        ],
        footer: (context) => pw.Container(
          alignment: pw.Alignment.center,
          padding: const pw.EdgeInsets.only(top: 12),
          child: pw.Text(
            'Generated with SnapQuote · Delta T Heating and Cooling',
            style: const pw.TextStyle(fontSize: 8, color: PdfColors.grey600),
          ),
        ),
      ),
    );

    return doc.save();
  }
}
