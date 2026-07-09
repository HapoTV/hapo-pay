import 'package:dio/dio.dart';
import 'package:hapopay/core/config/api_config.dart';
import 'package:hapopay/core/storage/secure_storage_service.dart';
import 'package:hapopay/features/auth/data/models/app_user.dart';
import 'package:hapopay/features/auth/data/models/auth_tokens.dart';

class AuthException implements Exception {
  final String message;
  AuthException(this.message);
  @override
  String toString() => message;
}

class AuthResult {
  final AppUser user;
  final AuthTokens tokens;
  AuthResult({required this.user, required this.tokens});
}

class AuthRepository {
  AuthRepository(this.dio, this.secureStorage);

  final Dio dio;
  final SecureStorageService secureStorage;

  String get _base => ApiConfig.accountsPath;

  Future<AuthResult> register({
    required String email,
    required String password,
    required String confirmPassword,
    required String fullName,
    required String role,
    String? phoneNumber,
  }) async {
    try {
      final response = await dio.post('$_base/register', data: {
        'email': email,
        'password': password,
        'confirmPassword': confirmPassword,
        'fullName': fullName,
        'role': role,
        if (phoneNumber != null) 'phoneNumber': phoneNumber,
      });
      final data = response.data['data'];
      final tokens = AuthTokens.fromJson(data['tokens']);
      final user = AppUser.fromJson(data['user']);

      await secureStorage.saveTokens(
          access: tokens.access, refresh: tokens.refresh);
      return AuthResult(user: user, tokens: tokens);
    } on DioException catch (e) {
      throw AuthException(_extractError(e));
    }
  }

  Future<AuthResult> login(
      {required String email, required String password}) async {
    try {
      final response = await dio.post('$_base/login', data: {
        'email': email,
        'password': password,
      });

      final data = response.data['data'];
      final tokens = AuthTokens.fromJson(data['tokens']);
      final user = AppUser.fromJson(data['user']);

      await secureStorage.saveTokens(
        access: tokens.access,
        refresh: tokens.refresh,
      );
      return AuthResult(user: user, tokens: tokens);
    } on DioException catch (e) {
      throw AuthException(_extractError(e));
    }
  }

  Future<void> logout() async {
    final refreshToken = await secureStorage.getRefreshToken();
    try {
      if (refreshToken != null) {
        await dio.post('$_base/logout/', data: {'refresh': refreshToken});
      }
    } on DioException catch (_) {
    } finally {
      await secureStorage.clearTokens();
    }
  }

  Future<bool> hasStoredSession() async {
    final access = await secureStorage.getAccessToken();
    return access != null;
  }

  
  String _extractError(DioException e) {
    final data = e.response?.data;
    if (data is Map && data['message'] != null)
      return data['message'].toString();
    if (data is Map && data.containsKey('email'))
      return data['email'].toString();
    return e.message ?? 'Something went wrong. Please try again';
  }
}
