import 'package:flutter/material.dart';
import '../core/auth.dart';
import '../core/l10n.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key, required this.auth});
  final AuthStore auth;

  @override
  Widget build(BuildContext context) {
    final i = I18n.instance;
    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Text(i.t('profile'), style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700)),
          ListTile(title: Text('${auth.user?['fullName'] ?? ''}'), subtitle: Text('${auth.user?['email'] ?? ''}')),
          ListTile(
            title: Text(i.t('language')),
            trailing: DropdownButton<String>(
              value: i.locale,
              items: const [DropdownMenuItem(value: 'es', child: Text('ES')), DropdownMenuItem(value: 'en', child: Text('EN'))],
              onChanged: (v) { if (v != null) auth.setLocale(v); },
            ),
          ),
          FilledButton(onPressed: auth.logout, child: Text(i.t('logout'))),
        ],
      ),
    );
  }
}
