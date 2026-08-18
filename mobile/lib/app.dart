import 'package:flutter/material.dart';
import 'core/auth.dart';
import 'core/l10n.dart';
import 'core/theme.dart';
import 'screens/login.dart';
import 'screens/shell.dart';

class AnimalinApp extends StatefulWidget {
  const AnimalinApp({super.key});

  @override
  State<AnimalinApp> createState() => _AnimalinAppState();
}

class _AnimalinAppState extends State<AnimalinApp> {
  final auth = AuthStore();
  bool ready = false;

  @override
  void initState() {
    super.initState();
    auth.restore().then((_) {
      if (mounted) setState(() => ready = true);
    });
  }

  @override
  Widget build(BuildContext context) {
    if (!ready) {
      return const MaterialApp(home: Scaffold(body: Center(child: CircularProgressIndicator())));
    }
    return AnimatedBuilder(
      animation: Listenable.merge([auth, I18n.instance]),
      builder: (context, _) {
        return MaterialApp(
          title: 'Animalin',
          debugShowCheckedModeBanner: false,
          locale: Locale(I18n.instance.locale),
          theme: AnimalinTheme.light,
          darkTheme: AnimalinTheme.dark,
          themeMode: ThemeMode.system,
          home: auth.isLoggedIn ? ShellScreen(auth: auth) : LoginScreen(auth: auth),
        );
      },
    );
  }
}
