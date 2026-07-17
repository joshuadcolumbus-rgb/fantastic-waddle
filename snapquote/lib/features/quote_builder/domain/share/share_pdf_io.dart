import 'dart:typed_data';

import 'package:printing/printing.dart';

/// Non-web fallback: delegate to the printing package's native share sheet.
Future<void> sharePdf(Uint8List bytes, String filename) =>
    Printing.sharePdf(bytes: bytes, filename: filename);
