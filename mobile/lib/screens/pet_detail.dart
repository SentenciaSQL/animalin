import 'package:flutter/material.dart';
import '../core/auth.dart';
import '../core/l10n.dart';

class PetDetailScreen extends StatefulWidget {
  const PetDetailScreen({super.key, required this.auth, required this.pet});
  final AuthStore auth;
  final Map pet;
  @override
  State<PetDetailScreen> createState() => _PetDetailScreenState();
}

class _PetDetailScreenState extends State<PetDetailScreen> {
  List timeline = [];
  List vaccines = [];

  @override
  void initState() {
    super.initState();
    final id = widget.pet['id'];
    widget.auth.api.get('/pets/$id/timeline').then((v) => setState(() => timeline = v as List? ?? []));
    widget.auth.api.get('/pets/$id/vaccinations').then((v) => setState(() => vaccines = v as List? ?? []));
  }

  @override
  Widget build(BuildContext context) {
    final i = I18n.instance;
    final pet = widget.pet;
    return Scaffold(
      appBar: AppBar(title: Text('${pet['name']}')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Text('${pet['breed'] ?? ''} · ${pet['age'] ?? ''} · ${pet['weightKg'] ?? ''} kg', style: Theme.of(context).textTheme.titleMedium),
          Text('${i.t('clinic')}: ${pet['tenantName'] ?? ''}'),
          Text('${i.t('vet')}: ${pet['veterinarianName'] ?? ''}'),
          if (pet['allergies'] != null) Card(color: const Color(0xFFFFF1F2), child: ListTile(title: Text('${i.t('allergies')}: ${pet['allergies']}'))),
          if (pet['medicalConditions'] != null) Card(color: const Color(0xFFFFFBEB), child: ListTile(title: Text('${i.t('conditions')}: ${pet['medicalConditions']}'))),
          const SizedBox(height: 16),
          Text(i.t('history'), style: Theme.of(context).textTheme.titleMedium),
          for (final e in timeline)
            ListTile(title: Text('${e['title']}'), subtitle: Text('${e['type']} · ${e['at']}')),
          Text(i.t('vaccines'), style: Theme.of(context).textTheme.titleMedium),
          for (final v in vaccines)
            ListTile(title: Text('${v['vaccineName']}'), subtitle: Text('${v['status']} · ${v['appliedAt']}')),
        ],
      ),
    );
  }
}
