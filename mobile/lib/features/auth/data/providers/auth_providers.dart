import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hapopay/core/network/client.dart';
import 'package:hapopay/core/storage/secure_storage_service.dart';
import 'package:hapopay/features/auth/data/application/auth_notifier.dart';
import 'package:hapopay/features/auth/data/application/auth_state.dart';
import 'package:hapopay/features/auth/data/application/biometric_service.dart';
import 'package:hapopay/features/auth/presentation/repository/auth_repository.dart';

final secureStorageProvider = Provider<SecureStorageService>(
  (ref) => SecureStorageService(),
);

final dioClientProvider = Provider<DioClient>(
  (ref) => DioClient(ref.watch(secureStorageProvider)),
);

final dioProvider = Provider<Dio>(
  (ref) => ref.watch(dioClientProvider).dio,
);

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(
    ref.watch(dioProvider),
    ref.watch(secureStorageProvider),
  );
});

final biometricServiceProvider = Provider<BiometricService>(
  (ref) => BiometricService(ref.watch(secureStorageProvider)),
);

final authNotifierProvider =
    StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final notifier = AuthNotifier(
    ref.watch(authRepositoryProvider),
    ref.watch(biometricServiceProvider),
  );
  // Wire session-expiry callback here to avoid a circular provider dependency.
  ref.watch(dioClientProvider).onSessionExpired = notifier.logout;
  return notifier;
});
