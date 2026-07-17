import 'dart:js_interop';
import 'dart:typed_data';

import 'package:web/web.dart' as web;

/// Web share strategy:
/// - Mobile browsers that support the Web Share API (with files) get the
///   native share sheet via `navigator.share`.
/// - Desktop browsers (no file share support) fall back to downloading
///   the PDF directly.
Future<void> sharePdf(Uint8List bytes, String filename) async {
  final blobParts = <JSAny>[bytes.toJS].toJS;
  final file = web.File(
    blobParts,
    filename,
    web.FilePropertyBag(type: 'application/pdf'),
  );
  final shareData = web.ShareData(files: <web.File>[file].toJS);

  final navigator = web.window.navigator;
  if (navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData).toDart;
      return;
    } catch (_) {
      // Share dismissed or blocked — fall through to download.
    }
  }
  _downloadPdf(blobParts, filename);
}

void _downloadPdf(JSArray<JSAny> blobParts, String filename) {
  final blob = web.Blob(
    blobParts,
    web.BlobPropertyBag(type: 'application/pdf'),
  );
  final url = web.URL.createObjectURL(blob);
  final anchor = web.HTMLAnchorElement()
    ..href = url
    ..download = filename;
  web.document.body?.appendChild(anchor);
  anchor.click();
  anchor.remove();
  web.URL.revokeObjectURL(url);
}
