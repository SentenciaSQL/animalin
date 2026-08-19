import 'package:flutter/material.dart';
import '../core/auth.dart';
import '../core/l10n.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key, required this.auth});
  final AuthStore auth;

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final email = TextEditingController();
  final password = TextEditingController();
  bool loading = false;
  String? error;
  bool register = false;
  final firstName = TextEditingController();
  final lastName = TextEditingController();

  I18n get i => I18n.instance;

  Future<void> submit() async {
    setState(() {
      loading = true;
      error = null;
    });
    try {
      if (register) {
        await widget.auth.register({
          'firstName': firstName.text,
          'lastName': lastName.text,
          'email': email.text,
          'password': password.text,
          'locale': i.locale,
        });
      } else {
        await widget.auth.login(email.text.trim(), password.text);
      }
    } catch (_) {
      setState(() => error = i.t('invalid'));
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(24),
          children: [
            const SizedBox(height: 32),
            CircleAvatar(
              radius: 28,
              backgroundColor: const Color(0xFF0F766E),
              child: Text('A', style: Theme.of(context).textTheme.titleLarge?.copyWith(color: Colors.white)),
            ),
            const SizedBox(height: 16),
            Text(i.t('appName'), style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w700)),
            Text(i.t('tagline'), style: Theme.of(context).textTheme.bodyMedium),
            const SizedBox(height: 32),
            if (register) ...[
              TextField(controller: firstName, decoration: InputDecoration(labelText: i.t('firstName'))),
              const SizedBox(height: 12),
              TextField(controller: lastName, decoration: InputDecoration(labelText: i.t('lastName'))),
              const SizedBox(height: 12),
            ],
            TextField(controller: email, keyboardType: TextInputType.emailAddress, decoration: InputDecoration(labelText: i.t('email'))),
            const SizedBox(height: 12),
            TextField(controller: password, obscureText: true, decoration: InputDecoration(labelText: i.t('password'))),
            if (error != null) Padding(padding: const EdgeInsets.only(top: 12), child: Text(error!, style: const TextStyle(color: Colors.red))),
            const SizedBox(height: 20),
            FilledButton(onPressed: loading ? null : submit, child: Text(register ? i.t('register') : i.t('login'))),
            TextButton(
              onPressed: () => setState(() => register = !register),
              child: Text(register ? i.t('login') : i.t('register')),
            ),
          ],
        ),
      ),
    );
  }
}
