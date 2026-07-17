import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:printing/printing.dart';

import '../../../settings/presentation/providers/settings_provider.dart';
import '../../domain/pdf_service.dart';
import '../../domain/share/share_pdf_io.dart'
    if (dart.library.js_interop) '../../domain/share/share_pdf_web.dart';
import '../providers/quote_providers.dart';

const _pdfFileName = 'snapquote_quote.pdf';

/// Live preview of the branded quote PDF with print and share/download
/// actions. On mobile browsers Share opens the native web share sheet;
/// on desktop browsers it downloads the .pdf file.
class PdfPreviewScreen extends ConsumerWidget {
  const PdfPreviewScreen({required this.signature, super.key});

  final Uint8List signature;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final items = ref.watch(quoteItemListProvider);
    final settings = ref.watch(settingsControllerProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Quote Preview')),
      body: PdfPreview(
        build: (format) => PdfService.buildQuotePdf(
          items: items,
          settings: settings,
          signature: signature,
        ),
        pdfFileName: _pdfFileName,
        allowPrinting: true,
        allowSharing: false,
        canChangeOrientation: false,
        canChangePageFormat: false,
        canDebug: false,
        actions: [
          PdfPreviewAction(
            icon: const Icon(Icons.ios_share),
            onPressed: (context, build, pageFormat) async {
              final bytes = await build(pageFormat);
              await sharePdf(bytes, _pdfFileName);
            },
          ),
        ],
      ),
    );
  }
}
