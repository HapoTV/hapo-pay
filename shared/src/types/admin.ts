export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'parent' | 'student' | 'admin';
  is_active: boolean;
  created_at: string;
}

export interface ChangeRoleRequest {
  role: 'parent' | 'student' | 'admin';
}

export interface VerifyMerchantRequest {
  is_verified: boolean;
}

export interface UpdateMerchantRequest {
  name?: string;
  category?: string;
  logo_url?: string;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  database: 'connected' | 'disconnected';
  redis: 'connected' | 'disconnected';
  uptime: number;
  version: string;
}

export interface SystemConfig {
  maintenance_mode: boolean;
  min_transfer_amount: number;
  max_transfer_amount: number;
  daily_transfer_limit: number;
}
