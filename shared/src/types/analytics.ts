export interface SpendingAnalytics {
  period: 'daily' | 'weekly' | 'monthly';
  total_spent: number;
  transaction_count: number;
  average_transaction: number;
  category_breakdown: CategorySpending[];
}

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
}

export interface PlatformAnalytics {
  total_users: number;
  total_transactions: number;
  total_volume: number;
  active_users: number;
  new_signups: number;
  period: string;
}

export interface FraudAlert {
  id: string;
  transaction_id: string;
  user_id: string;
  risk_level: 'low' | 'medium' | 'high';
  reason: string;
  created_at: string;
  status: 'open' | 'investigating' | 'resolved';
}
