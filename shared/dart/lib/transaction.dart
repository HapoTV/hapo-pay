class Transaction {
  final String id;
  final String child;
  final double amount;
  final String description;
  final String merchant;
  final String category;
  final String status;
  final DateTime createdAt;
  final DateTime updatedAt;

  Transaction({
    required this.id,
    required this.child,
    required this.amount,
    required this.description,
    required this.merchant,
    required this.category,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Transaction.fromJson(Map<String, dynamic> json) {
    return Transaction(
      id: json['id'] as String,
      child: json['child'] as String,
      amount: (json['amount'] as num).toDouble(),
      description: json['description'] as String,
      merchant: json['merchant'] as String,
      category: json['category'] as String,
      status: json['status'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'child': child,
      'amount': amount,
      'description': description,
      'merchant': merchant,
      'category': category,
      'status': status,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}
