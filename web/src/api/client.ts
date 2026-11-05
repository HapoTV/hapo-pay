import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "@/store/authStore";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.trim() ||
  (import.meta.env.DEV ? "/api/v1" : "https://api.hapopay.com/api/v1");
const api = axios.create({ baseURL: apiBaseUrl });

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _authRetry?: boolean;
}

interface ApiErrorResponse {
  detail?: string;
  message?: string;
  errors?: Record<string, string | string[]>;
  [key: string]: unknown;
}

interface TokenRefreshResponse {
  access: string;
  refresh?: string;
}

let refreshRequest: Promise<string | null> | null = null;

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const request = error.config as RetryableRequestConfig | undefined;
    const requestUrl = request?.url ?? "";
    const isAuthRequest =
      /\/auth\/(login|register|logout|refresh)\/?$/.test(requestUrl);
    const { refreshToken, clearAuth } = useAuthStore.getState();

    if (
      error.response?.status !== 401 ||
      !request ||
      request._authRetry ||
      isAuthRequest ||
      !refreshToken
    ) {
      if (error.response?.status === 401 && !isAuthRequest) clearAuth();
      return Promise.reject(error);
    }

    request._authRetry = true;
    if (!refreshRequest) {
      const refreshUrl = `${apiBaseUrl.replace(/\/$/, "")}/auth/refresh/`;
      refreshRequest = axios
        .post<TokenRefreshResponse>(refreshUrl, { refresh: refreshToken })
        .then(({ data }) => {
          useAuthStore
            .getState()
            .setTokens(data.access, data.refresh ?? refreshToken);
          return data.access;
        })
        .catch(() => {
          useAuthStore.getState().clearAuth();
          return null;
        })
        .finally(() => {
          refreshRequest = null;
        });
    }

    const accessToken = await refreshRequest;
    if (!accessToken) return Promise.reject(error);

    request.headers.Authorization = `Bearer ${accessToken}`;
    return api(request);
  }
);

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const response = error.response?.data;
    if (response?.detail) return response.detail;
    if (response?.message) return response.message;
    const fieldErrors = response?.errors ?? response;
    if (fieldErrors && typeof fieldErrors === "object") {
      const firstError = Object.values(fieldErrors).find(
        (value) => typeof value === "string" || Array.isArray(value)
      );
      if (Array.isArray(firstError)) {
        const message = firstError.find((value) => typeof value === "string");
        if (typeof message === "string") return message;
      }
      if (typeof firstError === "string") return firstError;
    }
    if (!error.response) {
      return "Unable to connect to HapoPay. Check your connection and try again.";
    }
  }

  return error instanceof Error ? error.message : fallback;
}

// API endpoints organized by backend structure
interface AuthResponse {
  status: 'success';
  message: string;
  data: {
    user: {
      id: string | number;
      email: string;
      role: 'parent' | 'student' | 'admin';
    };
    tokens: {
      access: string;
      refresh: string;
    };
  };
}

export interface CurrentUserProfile {
  id: string;
  email: string;
  role: 'parent' | 'student' | 'admin';
  full_name: string;
  avatar_url: string | null;
  phone_number: string | null;
  date_of_birth: string | null;
  address: string | null;
  city: string | null;
  country: string;
  created_at: string;
}

interface ApiResponse<T> {
  status: 'success';
  data: T;
}

export interface Wallet {
  id: string;
  user: string;
  user_email: string;
  balance: string;
  currency: string;
  is_active: boolean;
  created_at: string;
}

export interface ParentChild {
  id: string;
  email: string;
  full_name: string;
  grade: number | null;
  school_name: string;
  wallet_balance: string | null;
  is_account_frozen: boolean;
  created_at: string;
}

export interface WalletTransaction {
  id: string;
  user: string;
  user_email: string;
  amount: string;
  type: string;
  category: string;
  status: string;
  description: string | null;
  merchant_name: string | null;
  merchant_id: string | null;
  reference_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface SpendingAnalytics {
  period: string;
  total_spent: string | number;
  category_breakdown: Array<{
    category: string;
    total: string | number;
    count: number;
  }>;
  daily_spending: Array<{
    date: string;
    total: string | number;
  }>;
  top_merchants: Array<{
    merchant_name: string | null;
    total: string | number;
    count: number;
  }>;
  transaction_count: number;
}

export function getCollectionItems<T>(
  response: PaginatedResponse<T> | T[]
): T[] {
  return Array.isArray(response) ? response : response.results;
}

export const authApi = {
  login: (data: { email: string; password: string }) => 
    api.post<AuthResponse>("/auth/login/", data),
  getProfile: () =>
    api.get<ApiResponse<CurrentUserProfile>>("/auth/profile/"),
  register: (data: { email: string; password: string; confirm_password: string; full_name: string; role: 'parent' | 'student'; phone_number?: string }) =>
    api.post<AuthResponse>("/auth/register/", data),
  logout: (refresh: string) =>
    api.post("/auth/logout/", { refresh }),
  requestPasswordReset: (data: { email: string }) =>
    api.post("/auth/forgot-password/", data),
  resetPassword: (data: { token: string; new_password: string; confirm_password: string }) =>
    api.post("/auth/reset-password/", data),
  completeProfile: (data: {
    parent_email?: string;
    school_name?: string;
    grade?: number;
    weekly_allowance?: number;
    savings_goal?: number;
    occupation?: string;
    default_currency?: string;
  }) => api.post("/auth/complete-profile/", data),
  changePassword: (data: { old_password: string; new_password: string; confirm_password: string }) =>
    api.post("/auth/change-password/", data),
};

export const parentApi = {
  getWallet: () => api.get<ApiResponse<Wallet>>("/parent/wallet/"),
  getChildren: () => api.get<ApiResponse<ParentChild[]>>("/parent/children/"),
  getTransactions: () =>
    api.get<PaginatedResponse<WalletTransaction> | WalletTransaction[]>(
      "/parent/transactions/"
    ),
  getSpendingLimits: () =>
    api.get("/parent/children/limits/"),
  updateSpendingLimits: (data: {
    child_id: string;
    category: string;
    daily_limit: number;
    weekly_limit: number;
    monthly_limit: number;
    is_enabled?: boolean;
  }) =>
    api.post("/parent/children/limits/", data),
  transfer: (data: { recipient_id: string; amount: number; description?: string }) =>
    api.post("/parent/transfer/", data),
  getMoneyRequests: () => 
    api.get("/parent/money-requests/"),
  approveMoneyRequest: (request_id: string, parent_notes?: string) =>
    api.post("/parent/approve-request/", { request_id, action: "approve", parent_notes }),
  declineMoneyRequest: (request_id: string, parent_notes?: string) =>
    api.post("/parent/approve-request/", { request_id, action: "decline", parent_notes }),
  getSpendingAnalytics: (params?: { child_id?: string; period?: "week" | "month" | "year" }) =>
    api.get<ApiResponse<SpendingAnalytics>>("/parent/analytics/", { params }),
  freezeAccount: (child_id: string) => 
    api.post(`/parent/freeze-account/${child_id}/`),
};

export const studentApi = {
  getWallet: () =>
    api.get<PaginatedResponse<Wallet> | Wallet[]>("/student/wallet/"),
  getBalance: () =>
    api.get<PaginatedResponse<Wallet> | Wallet[]>("/student/wallet/"),
  getTransactions: () =>
    api.get<PaginatedResponse<WalletTransaction> | WalletTransaction[]>(
      "/student/transactions/"
    ),
  getSpendingLimits: () => 
    api.get("/student/spending-limits/"),
  createMoneyRequest: (data: { amount: number; reason: string }) => 
    api.post("/student/money-requests/", data),
  getMoneyRequests: () => 
    api.get("/student/money-requests/"),
  getRewards: () => 
    api.get("/student/rewards/"),
  getAchievements: () => 
    api.get("/student/achievements/"),
  getChallenges: () => 
    api.get("/student/challenges/"),
};

export const paymentsApi = {
  generateQR: (data?: { merchant_id?: string }) => 
    api.post("/payments/qr/generate/", data),
  scanQR: (data: { qr_code: string; amount: number }) => 
    api.post("/payments/qr/scan/", data),
  generateNFCToken: () => 
    api.post("/payments/nfc/token/"),
  payNFC: (data: { token: string; amount: number; merchant_id: string }) => 
    api.post("/payments/nfc/pay/", data),
  buyAirtime: (data: { provider: string; phone_number: string; amount: number }) => 
    api.post("/payments/airtime/buy/", data),
  getAirtimeProviders: () => 
    api.get("/payments/airtime/providers/"),
  buyTransport: (data: { route_id: string; amount: number }) => 
    api.post("/payments/transport/buy/", data),
  getTransportRoutes: () => 
    api.get("/payments/transport/routes/"),
  getMerchants: () => 
    api.get("/payments/merchants/"),
  getMerchant: (id: string) => 
    api.get(`/payments/merchants/${id}/`),
};

export const adminApi = {
  getUsers: () => 
    api.get("/admin/users/"),
  changeUserRole: (id: string, data: { role: string }) => 
    api.put(`/admin/users/${id}/role/`, data),
  verifyMerchant: (data: { is_verified: boolean }) => 
    api.post(`/admin/merchants/verify/`, data),
  updateMerchant: (id: string, data: { name?: string; category?: string; logo_url?: string }) => 
    api.put(`/admin/merchants/${id}/`, data),
  deleteMerchant: (id: string) => 
    api.delete(`/admin/merchants/${id}/`),
  getPlatformAnalytics: () => 
    api.get("/admin/analytics/platform/"),
  getFraudAlerts: () => 
    api.get("/admin/fraud/alerts/"),
  blockTransaction: (id: string) => 
    api.post(`/admin/fraud/block/${id}/`),
  getSystemHealth: () => 
    api.get("/admin/system/health/"),
  updateSystemConfig: (data: { maintenance_mode?: boolean; min_transfer_amount?: number; max_transfer_amount?: number; daily_transfer_limit?: number }) => 
    api.put("/admin/system/config/", data),
};

export default api;
