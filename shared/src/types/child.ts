export interface Child {
  id: string;
  parent: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  allowance_amount: number;
  allowance_frequency: 'weekly' | 'monthly';
  points: number;
  is_frozen: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateChildRequest {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  allowance_amount: number;
  allowance_frequency: 'weekly' | 'monthly';
}

export interface UpdateChildRequest {
  first_name?: string;
  last_name?: string;
  allowance_amount?: number;
  allowance_frequency?: 'weekly' | 'monthly';
}

export interface SpendingLimits {
  daily_limit: number;
  weekly_limit: number;
  monthly_limit: number;
  per_transaction_limit: number;
}

export interface UpdateSpendingLimitsRequest {
  daily_limit?: number;
  weekly_limit?: number;
  monthly_limit?: number;
  per_transaction_limit?: number;
}

export interface TransferRequest {
  child_id: string;
  amount: number;
  description?: string;
}

export interface MoneyRequest {
  id: string;
  child: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'declined';
  created_at: string;
}

export interface CreateMoneyRequestRequest {
  amount: number;
  reason: string;
}
