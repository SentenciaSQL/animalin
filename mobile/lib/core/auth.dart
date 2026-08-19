import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'api.dart';
import 'l10n.dart';

class AuthStore extends ChangeNotifier {
  final _storage = const FlutterSecureStorage();
  String? accessToken;
  String? refreshToken;
  Map<String, dynamic>? user;

  bool get isLoggedIn => accessToken != null;

  late final ApiClient api = ApiClient(this);

  Future<void> restore() async {
    await I18n.instance.load('es');
    accessToken = await _storage.read(key: 'access');
    refreshToken = await _storage.read(key: 'refresh');
    final raw = await _storage.read(key: 'user');
    if (raw != null) {
      user = jsonDecode(raw) as Map<String, dynamic>;
      final locale = (user?['locale'] as String?) ?? 'es';
      await I18n.instance.load(locale);
    }
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    final data = await api.post('/auth/login', {'email': email, 'password': password});
    await _persist(data as Map<String, dynamic>);
  }

  Future<void> register(Map<String, String> payload) async {
    final data = await api.post('/auth/register', payload);
    await _persist(data as Map<String, dynamic>);
  }

  Future<void> logout() async {
    if (refreshToken != null) {
      try {
        await api.post('/auth/logout', {'refreshToken': refreshToken});
      } catch (_) {}
    }
    accessToken = null;
    refreshToken = null;
    user = null;
    await _storage.deleteAll();
    notifyListeners();
  }

  Future<void> setLocale(String locale) async {
    await I18n.instance.load(locale);
    if (isLoggedIn) {
      await api.patch('/auth/me', {'locale': locale});
    }
  }

  Future<void> _persist(Map<String, dynamic> data) async {
    accessToken = data['accessToken'] as String?;
    refreshToken = data['refreshToken'] as String?;
    user = data['user'] as Map<String, dynamic>?;
    await _storage.write(key: 'access', value: accessToken);
    await _storage.write(key: 'refresh', value: refreshToken);
    await _storage.write(key: 'user', value: jsonEncode(user));
    final locale = (user?['locale'] as String?) ?? 'es';
    await I18n.instance.load(locale);
    notifyListeners();
  }
}
