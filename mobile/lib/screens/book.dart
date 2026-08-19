import 'package:flutter/material.dart';
import '../core/auth.dart';
import '../core/l10n.dart';

class BookScreen extends StatefulWidget {
  const BookScreen({super.key, required this.auth, required this.pets});
  final AuthStore auth;
  final List pets;
  @override
  State<BookScreen> createState() => _BookScreenState();
}

class _BookScreenState extends State<BookScreen> {
  int step = 0;
  Map? pet;
  int? tenantId;
  List branches = [];
  List services = [];
  List vets = [];
  List slots = [];
  int? branchId;
  int? serviceId;
  int? vetId;
  DateTime date = DateTime.now().add(const Duration(days: 1));
  String? slotStart;
  final reason = TextEditingController();
  bool loading = false;

  I18n get i => I18n.instance;

  Future<void> loadCatalog() async {
    tenantId = pet?['tenantId'] as int?;
    if (tenantId == null) return;
    branches = await widget.auth.api.get('/branches/tenant/$tenantId') as List? ?? [];
    services = await widget.auth.api.get('/services/tenant/$tenantId') as List? ?? [];
    vets = await widget.auth.api.get('/veterinarians/tenant/$tenantId') as List? ?? [];
    setState(() {});
  }

  Future<void> loadSlots() async {
    if (vetId == null) return;
    final day = '${date.year.toString().padLeft(4, '0')}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
    slots = await widget.auth.api.get('/appointments/availability', {
      'veterinarianId': '$vetId',
      if (branchId != null) 'branchId': '$branchId',
      if (serviceId != null) 'serviceId': '$serviceId',
      'date': day,
    }) as List? ?? [];
    setState(() {});
  }

  Future<void> submit() async {
    setState(() => loading = true);
    try {
      await widget.auth.api.post('/appointments', {
        'petId': pet?['id'],
        'veterinarianId': vetId,
        'serviceId': serviceId,
        'branchId': branchId,
        'startAt': slotStart,
        'reason': reason.text,
      });
      if (mounted) Navigator.pop(context);
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(i.t('book'))),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            if (step == 0) Expanded(child: ListView(children: [
              for (final p in widget.pets)
                ListTile(
                  title: Text('${p['name']}'),
                  subtitle: Text('${p['tenantName'] ?? ''}'),
                  onTap: () async {
                    pet = p as Map;
                    await loadCatalog();
                    setState(() => step = 1);
                  },
                ),
            ])),
            if (step == 1) Expanded(child: ListView(children: [
              Text(i.t('branch')),
              for (final b in branches)
                ListTile(title: Text('${b['name']}'), onTap: () { branchId = b['id'] as int?; setState(() => step = 2); }),
            ])),
            if (step == 2) Expanded(child: ListView(children: [
              Text(i.t('service')),
              for (final s in services)
                ListTile(title: Text('${s['nameEs']}'), onTap: () { serviceId = s['id'] as int?; setState(() => step = 3); }),
            ])),
            if (step == 3) Expanded(child: ListView(children: [
              Text(i.t('vet')),
              for (final v in vets)
                ListTile(title: Text('${v['fullName']}'), onTap: () async { vetId = v['id'] as int?; await loadSlots(); setState(() => step = 4); }),
            ])),
            if (step == 4) Expanded(child: ListView(children: [
              Text(i.t('slot')),
              if (slots.isEmpty) Text(i.t('empty')),
              for (final s in slots)
                ListTile(title: Text('${s['startAt']}'), onTap: () { slotStart = s['startAt'] as String?; setState(() => step = 5); }),
            ])),
            if (step == 5) Expanded(child: ListView(children: [
              TextField(controller: reason, decoration: InputDecoration(labelText: i.t('reason'))),
              const SizedBox(height: 16),
              FilledButton(onPressed: loading ? null : submit, child: Text(i.t('confirm'))),
            ])),
          ],
        ),
      ),
    );
  }
}
