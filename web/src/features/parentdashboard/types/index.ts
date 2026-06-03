export interface Child {
  id: string;
  name: string;
  email: string;
  spendLimit: number;
  currentSpending: number;
  avatar?: string;
}

export interface ParentUser {
  id: string;
  name: string;
  email: string;
  familyBalance: number;
  monthlySpending: number;
  currency: string;
  children: Child[];
}

export interface SafetyAlert {
  id: string;
  type: 'success' | 'warning' | 'error';
  message: string;
  timestamp: Date;
}

export interface QuickAction {
  id: string;
  title: string;
  icon: string;
  description?: string;
  action: () => void;
}