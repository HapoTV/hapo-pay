class Child {
  final String id;
  final String parent;
  final String firstName;
  final String lastName;
  final DateTime dateOfBirth;
  final double allowanceAmount;
  final String allowanceFrequency;
  final int points;
  final DateTime createdAt;
  final DateTime updatedAt;

  Child({
    required this.id,
    required this.parent,
    required this.firstName,
    required this.lastName,
    required this.dateOfBirth,
    required this.allowanceAmount,
    required this.allowanceFrequency,
    required this.points,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Child.fromJson(Map<String, dynamic> json) {
    return Child(
      id: json['id'] as String,
      parent: json['parent'] as String,
      firstName: json['first_name'] as String,
      lastName: json['last_name'] as String,
      dateOfBirth: DateTime.parse(json['date_of_birth'] as String),
      allowanceAmount: (json['allowance_amount'] as num).toDouble(),
      allowanceFrequency: json['allowance_frequency'] as String,
      points: json['points'] as int,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'parent': parent,
      'first_name': firstName,
      'last_name': lastName,
      'date_of_birth': dateOfBirth.toIso8601String(),
      'allowance_amount': allowanceAmount,
      'allowance_frequency': allowanceFrequency,
      'points': points,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}
