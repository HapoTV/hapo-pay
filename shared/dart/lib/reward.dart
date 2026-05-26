class RewardPoints {
  final String childId;
  final int totalPoints;
  final int availablePoints;
  final int redeemedPoints;

  RewardPoints({
    required this.childId,
    required this.totalPoints,
    required this.availablePoints,
    required this.redeemedPoints,
  });

  factory RewardPoints.fromJson(Map<String, dynamic> json) {
    return RewardPoints(
      childId: json['child_id'] as String,
      totalPoints: json['total_points'] as int,
      availablePoints: json['available_points'] as int,
      redeemedPoints: json['redeemed_points'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'child_id': childId,
      'total_points': totalPoints,
      'available_points': availablePoints,
      'redeemed_points': redeemedPoints,
    };
  }
}

class Achievement {
  final String id;
  final String child;
  final String title;
  final String description;
  final int pointsRequired;
  final String icon;
  final DateTime? unlockedAt;
  final DateTime createdAt;

  Achievement({
    required this.id,
    required this.child,
    required this.title,
    required this.description,
    required this.pointsRequired,
    required this.icon,
    this.unlockedAt,
    required this.createdAt,
  });

  factory Achievement.fromJson(Map<String, dynamic> json) {
    return Achievement(
      id: json['id'] as String,
      child: json['child'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      pointsRequired: json['points_required'] as int,
      icon: json['icon'] as String,
      unlockedAt: json['unlocked_at'] != null
          ? DateTime.parse(json['unlocked_at'] as String)
          : null,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'child': child,
      'title': title,
      'description': description,
      'points_required': pointsRequired,
      'icon': icon,
      'unlocked_at': unlockedAt?.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
    };
  }
}
