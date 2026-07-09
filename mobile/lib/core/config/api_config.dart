class ApiConfig {
  static const String baseUrl = String.fromEnvironment('API_BASE_URL',
      defaultValue: 'https://api.example.com');

  static const String accountsPath = '/accounts';
}
