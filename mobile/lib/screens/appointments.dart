import 'package:flutter/material.dart';
import '../core/auth.dart';
import '../core/l10n.dart';
import 'book.dart';

class AppointmentsScreen extends StatefulWidget {
  const AppointmentsScreen({super.key, required this.auth});
  final AuthStore auth;
  @override
  State<AppointmentsScreen> createState() => _AppointmentsScreenState();
}

class _AppointmentsScreenState extends State<AppointmentsScreen> {
  List items = [];
  List pets = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final a = await widget.auth.api.get('/appointments/mine');
    final p = await widget.auth.api.get('/pets/mine');
    setState(() {
      items = a as List? ?? [];
      pets = p as List? ?? [];
    });
  }

  Future<void> _cancel(dynamic id) async {
    await widget.auth.api.post('/appointments/$id/status', {'status': 'CANCELLED'});
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    final i = I18n.instance;
    return SafeArea(
      child: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Row(children: [
              Expanded(child: Text(i.t('appointments'), style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700))),
              FilledButton(onPressed: pets.isEmpty ? null : () => Navigator.push(context, MaterialPageRoute(builder: (_) => BookScreen(auth: widget.auth, pets: pets))).then((_) => _load()), child: Text(i.t('book'))),
            ]),
            const SizedBox(height: 12),
            if (items.isEmpty) Text(i.t('empty')),
            for (final a in items)
              Card(
                child: ListTile(
                  leading: (a['tenantLogoUrl'] as String?)?.isNotEmpty == true
                      ? CircleAvatar(backgroundImage: NetworkImage(a['tenantLogoUrl']))
                      : const CircleAvatar(child: Icon(Icons.local_hospital_outlined)),
                  title: Text('${a['petName']} · ${a['serviceName'] ?? ''}'),
                  subtitle: Text('${a['startAt']}\n${a['tenantName'] ?? ''} · ${a['veterinarianName'] ?? ''} · ${a['status']}'),
                  isThreeLine: true,
                  trailing: ['REQUESTED', 'PENDING', 'CONFIRMED'].contains(a['status'])
                      ? IconButton(icon: const Icon(Icons.close), onPressed: () => _cancel(a['id']))
                      : null,
                ),
              ),
          ],
        ),
      ),
    );
  }
}
