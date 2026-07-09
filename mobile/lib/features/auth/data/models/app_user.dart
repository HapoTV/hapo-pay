class AppUser{
  final String id;
  final String email;
  final String role;
  final String? phoneNumber;

  const AppUser({
    required this.id,
    required this.email,
    required this.role,
    this.phoneNumber,
  });

  factory AppUser.fromJson(Map<String, dynamic> json) => AppUser(
        id: json['id'] as String,
        email: json['email'] as String,
        role: json['role'] as String,
        phoneNumber: json['phoneNumber'] as String?,
      );


}