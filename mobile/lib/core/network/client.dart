import 'package:dio/dio.dart';
import 'package:hapopay/core/config/api_config.dart';
import 'package:hapopay/core/storage/secure_storage_service.dart';

class DioClient {
  DioClient(this._secureStorage) {
    _dio = Dio(
      BaseOptions(
        baseUrl: ApiConfig.baseUrl,
        connectTimeout: Duration(seconds: 15),
        receiveTimeout: Duration(seconds: 15),
        headers: {'Content-Type': 'application/json'},
      ),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final isAuthEndpoint = options.path.contains('/login') ||
              options.path.contains('/register') ||
              options.path.contains('/token/refresh');

          if (!isAuthEndpoint) {
            final token = await _secureStorage.getAccessToken();
            if (token != null) {
              options.headers['Authorization'] = 'Bearer $token';
            }
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          final isRefreshCall =
              error.requestOptions.path.contains('/token/refresh');
          if (error.response?.statusCode == 401 && !isRefreshCall) {
            try {
              final newAccess = await _refreshAccessToken();
              final retryOptions = error.requestOptions;
              retryOptions.headers['Authorization'] = 'Bearer $newAccess';
              final response = await _dio.fetch(retryOptions);
              return handler.resolve(response);
            } catch (_) {
              await _secureStorage.clearTokens();
              onSessionExpired?.call();
              return handler.reject(error);
            }
          }
          handler.next(error);
        },
      ),
    );
  }

  late final Dio _dio;
  final SecureStorageService _secureStorage;
  void Function()? onSessionExpired;
  Dio get dio => _dio;
  Future<String>? _refreshFuture;

  Future<String> _refreshAccessToken() {
    _refreshFuture ??=
        _performRefresh().whenComplete(() => _refreshFuture = null);
    return _refreshFuture!;
  }

  Future<String> _performRefresh() async {
    final refreshToken = await _secureStorage.getRefreshToken();
    if (refreshToken == null) {
      throw DioException(
        requestOptions: RequestOptions(path: '/token/refresh'),
        error: 'No refresh token stored',
      );
    }
    final plainDio = Dio(BaseOptions(baseUrl: ApiConfig.baseUrl));
    final response = await plainDio.post(
      '${ApiConfig.accountsPath}/token/refresh/',
      data: {'refresh': refreshToken},
    );

    final tokens = response.data['data']['tokens'];
    final newAccess = tokens['access'] as String;
    final newRefresh = tokens['refresh'] as String? ?? refreshToken;

    await _secureStorage.saveTokens(access: newAccess, refresh: newRefresh);
    return newAccess;
  }
}
