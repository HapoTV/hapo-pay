import 'package:local_auth/local_auth.dart';
import 'package:hapopay/core/storage/secure_storage_service.dart';

class BiometricService {
  BiometricService(this._secureStorage) : _auth = LocalAuthentication();

  final SecureStorageService _secureStorage;
  final LocalAuthentication _auth;

  Future<bool> isDeviceSupported() async {
    final canCheck = await _auth.canCheckBiometrics;
    final isSupported = await _auth.isDeviceSupported();
    return canCheck && isSupported;
  }

  Future<bool> authenticate({String reason = 'unlock to continue'}) async {
    try {
      return await _auth.authenticate(
        localizedReason: reason,
        options: AuthenticationOptions(
          biometricOnly: false,
          stickyAuth: true,
        ),
      );
    } catch (_) {
      return false;
    }
  }

  Future<void> enableBiometric() => _secureStorage.setBiometricEnabled(true);
  Future<void> disableBiometric() => _secureStorage.setBiometricEnabled(false);
  Future<bool> isBiometricEnabled() => _secureStorage.isBiometricEnabled();
}
