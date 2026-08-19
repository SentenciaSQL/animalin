import 'package:flutter/material.dart';
import '../core/auth.dart';
import '../core/l10n.dart';

class MessagesScreen extends StatefulWidget {
  const MessagesScreen({super.key, required this.auth});
  final AuthStore auth;
  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  List convos = [];
  @override
  void initState() {
    super.initState();
    widget.auth.api.get('/messages').then((v) => setState(() => convos = v as List? ?? []));
  }

  @override
  Widget build(BuildContext context) {
    final i = I18n.instance;
    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Text(i.t('messages'), style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          Text(i.t('emergency'), style: Theme.of(context).textTheme.bodySmall),
          const SizedBox(height: 12),
          if (convos.isEmpty) Text(i.t('empty')),
          for (final c in convos)
            Card(child: ListTile(title: Text('${c['ownerName'] ?? c['subject']}'), subtitle: Text('${c['lastMessage'] ?? ''}'))),
        ],
      ),
    );
  }
}
