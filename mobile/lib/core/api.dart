import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth.dart';

class ApiClient {
  ApiClient(this.auth, {String? baseUrl})
      : baseUrl = baseUrl ??
            const String.fromEnvironment('API_URL', defaultValue: 'http://localhost:8080/api/v1');

  final AuthStore auth;
  final String baseUrl;

  Future<dynamic> get(String path, [Map<String, String>? query]) async {
    final uri = Uri.parse('$baseUrl$path').replace(queryParameters: query);
    final res = await http.get(uri, headers: _headers());
    return _decode(res);
  }

  Future<dynamic> post(String path, [Map<String, dynamic>? body]) async {
    final res = await http.post(Uri.parse('$baseUrl$path'),
        headers: _headers(), body: jsonEncode(body ?? {}));
    return _decode(res);
  }

  Future<dynamic> patch(String path, Map<String, dynamic> body) async {
    final res = await http.patch(Uri.parse('$baseUrl$path'),
        headers: _headers(), body: jsonEncode(body));
    return _decode(res);
  }

  Map<String, String> _headers() {
    final headers = {'Content-Type': 'application/json', 'Accept': 'application/json'};
    if (auth.accessToken != null) {
      headers['Authorization'] = 'Bearer ${auth.accessToken}';
    }
    return headers;
  }

  dynamic _decode(http.Response res) {
    if (res.statusCode == 401 && auth.refreshToken != null) {
      throw UnauthorizedException();
    }
    if (res.statusCode >= 400) {
      throw ApiException(res.statusCode, res.body);
    }
    if (res.body.isEmpty) return null;
    return jsonDecode(res.body);
  }
}

class ApiException implements Exception {
  ApiException(this.status, this.body);
  final int status;
  final String body;
  @override
  String toString() => body;
}

class UnauthorizedException implements Exception {}
