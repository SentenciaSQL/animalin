import 'package:flutter/material.dart';
import '../core/auth.dart';
import '../core/l10n.dart';
import 'book.dart';
import 'pet_detail.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key, required this.auth});
  final AuthStore auth;
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List pets = [];
  List appointments = [];
  bool loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final p = await widget.auth.api.get('/pets/mine');
      final a = await widget.auth.api.get('/appointments/mine');
      setState(() {
        pets = p as List? ?? [];
        appointments = a as List? ?? [];
        loading = false;
      });
    } catch (_) {
      setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final i = I18n.instance;
    final name = widget.auth.user?['firstName'] ?? '';
    final upcoming = appointments.where((e) => e['status'] != 'CANCELLED' && e['status'] != 'COMPLETED').toList();
    return SafeArea(
      child: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Text('${i.t('hello')}, $name', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700)),
            const SizedBox(height: 16),
            SizedBox(
              height: 108,
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: [
                  for (final pet in pets)
                    Padding(
                      padding: const EdgeInsets.only(right: 12),
                      child: InkWell(
                        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => PetDetailScreen(auth: widget.auth, pet: pet))),
                        child: Chip(avatar: CircleAvatar(child: Text('${pet['name']}'.substring(0, 1))), label: Text('${pet['name']}')),
                      ),
                    ),
                ],
              ),
            ),
            Card(
              child: ListTile(
                title: Text(i.t('nextAppointment')),
                subtitle: Text(upcoming.isEmpty ? i.t('empty') : '${upcoming.first['petName']} · ${upcoming.first['startAt']}'),
              ),
            ),
            const SizedBox(height: 12),
            FilledButton.icon(
              onPressed: pets.isEmpty ? null : () => Navigator.push(context, MaterialPageRoute(builder: (_) => BookScreen(auth: widget.auth, pets: pets))),
              icon: const Icon(Icons.add),
              label: Text(i.t('book')),
            ),
          ],
        ),
      ),
    );
  }
}
