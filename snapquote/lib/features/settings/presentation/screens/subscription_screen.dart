import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

/// Placeholder Stripe Payment Link — swap for the real link created in the
/// Stripe dashboard before launch.
final Uri _stripePaymentLink =
    Uri.parse('https://buy.stripe.com/test_REPLACE_WITH_PAYMENT_LINK');

const _proFeatures = [
  'Unlimited quotes & PDF exports',
  'Custom company branding on PDFs',
  'Saved service catalogs',
  'Customer signature capture',
  'Priority support',
];

/// 'Pro Plan' pricing tier with a Stripe-powered subscribe button.
class SubscriptionScreen extends StatelessWidget {
  const SubscriptionScreen({super.key});

  Future<void> _subscribe(BuildContext context) async {
    final launched = await launchUrl(
      _stripePaymentLink,
      mode: LaunchMode.externalApplication,
    );
    if (!launched && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not open the checkout page.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(title: const Text('Upgrade')),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 420),
            child: Card(
              elevation: 4,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(24),
                side: BorderSide(
                  color: colorScheme.primary.withValues(alpha: 0.6),
                  width: 1.5,
                ),
              ),
              child: Padding(
                padding: const EdgeInsets.all(28),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      children: [
                        Icon(
                          Icons.workspace_premium,
                          color: colorScheme.primary,
                          size: 32,
                        ),
                        const SizedBox(width: 12),
                        Text(
                          'Pro Plan',
                          style: textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color:
                                colorScheme.primary.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(999),
                          ),
                          child: Text(
                            'MOST POPULAR',
                            style: textTheme.labelSmall?.copyWith(
                              color: colorScheme.primary,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 1,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          r'$19.99',
                          style: textTheme.displaySmall?.copyWith(
                            fontWeight: FontWeight.w800,
                            color: colorScheme.primary,
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.only(bottom: 6, left: 4),
                          child: Text(
                            '/ month',
                            style: textTheme.bodyLarge?.copyWith(
                              color: colorScheme.onSurfaceVariant,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    const Divider(),
                    const SizedBox(height: 12),
                    for (final feature in _proFeatures)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 6),
                        child: Row(
                          children: [
                            Icon(
                              Icons.check_circle,
                              size: 20,
                              color: colorScheme.secondary,
                            ),
                            const SizedBox(width: 10),
                            Expanded(child: Text(feature)),
                          ],
                        ),
                      ),
                    const SizedBox(height: 24),
                    FilledButton.icon(
                      style: FilledButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      onPressed: () => _subscribe(context),
                      icon: const Icon(Icons.lock_open_outlined),
                      label: const Text(
                        'Subscribe Now',
                        style: TextStyle(fontWeight: FontWeight.w700),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Secure checkout powered by Stripe. Cancel anytime.',
                      textAlign: TextAlign.center,
                      style: textTheme.bodySmall?.copyWith(
                        color: colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
