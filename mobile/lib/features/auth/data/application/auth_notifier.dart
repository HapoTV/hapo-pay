import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hapopay/features/auth/data/application/auth_state.dart';
import 'package:hapopay/features/auth/data/application/biometric_service.dart';
import 'package:hapopay/features/auth/presentation/repository/auth_repository.dart';

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier(this._repository, this._biometricService) : super(AuthState()) {
    _checkInitialSession();
  }

  final AuthRepository _repository;
  final BiometricService _biometricService;

  Future<void> _checkInitialSession() async {
    final hasSession = await _repository.hasStoredSession();
    state = state.copyWith(
      status:
          hasSession ? AuthStatus.authenticated : AuthStatus.unauthenticated,
    );
  }

  Future<void> login({required String email, required String password}) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final result = await _repository.login(email: email, password: password);
      state = state.copyWith(
        status: AuthStatus.authenticated,
        user: result.user,
        isLoading: false,
      );
    } on AuthException catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.message);
    }
  }

  Future<void> register({
    required String email,
    required String password,
    required String confirmPassword,
    required String fullName,
    required String role,
    String? phoneNumber,
  }) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      await _repository.register(
        email: email,
        password: password,
        confirmPassword: confirmPassword,
        fullName: fullName,
        role: role,
        phoneNumber: phoneNumber,
      );
      state =
          state.copyWith(status: AuthStatus.authenticated, isLoading: false);
    } on AuthException catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.message);
    }
  }

  Future<void> logout() async {
    await _repository.logout();
    state = AuthState(status: AuthStatus.unauthenticated);
  }

  Future<bool> unlockWithBiometric() async {
    final enabled = await _biometricService.isBiometricEnabled();
    if (!enabled) return true;
    return _biometricService.authenticate(reason: 'Unlock HapoPay');
  }

  Future<void> setBiometricEnabled(bool enabled) async {
    if (enabled) {
      await _biometricService.enableBiometric();
    } else {
      await _biometricService.disableBiometric();
    }
  }
}
