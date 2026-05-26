import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().clearAuth();
    }
    return Promise.reject(err);
  }
);

// API endpoints organized by backend structure
export const authApi = {
  login: (data: { email: string; password: string }) => 
    api.post("/auth/login/", data),
  register: (data: { email: string; password: string; first_name: string; last_name: string; role: string }) => 
    api.post("/auth/register/", data),
  logout: () => 
    api.post("/auth/logout/"),
  refresh: (data: { refresh: string }) => 
    api.post("/auth/refresh/", data),
  verifyEmail: (data: { email: string; otp: string }) => 
    api.post("/auth/verify-email/", data),
  resetPassword: (data: { email: string }) => 
    api.post("/auth/reset-password/", data),
  resetPasswordConfirm: (data: { token: string; new_password: string }) => 
    api.post("/auth/reset-password-confirm/", data),
  getMe: () => 
    api.get("/auth/me/"),
  updateMe: (data: { first_name?: string; last_name?: string; phone?: string }) => 
    api.put("/auth/me/", data),
};

export const parentApi = {
  getChildren: () => 
    api.get("/parent/children/"),
  createChild: (data: { first_name: string; last_name: string; date_of_birth: string; allowance_amount: number; allowance_frequency: string }) => 
    api.post("/parent/children/", data),
  getChild: (id: string) => 
    api.get(`/parent/children/${id}/`),
  updateChild: (id: string, data: { first_name?: string; last_name?: string; allowance_amount?: number; allowance_frequency?: string }) => 
    api.put(`/parent/children/${id}/`, data),
  deleteChild: (id: string) => 
    api.delete(`/parent/children/${id}/`),
  getChildTransactions: (id: string) => 
    api.get(`/parent/children/${id}/transactions/`),
  getSpendingLimits: (id: string) => 
    api.get(`/parent/children/${id}/spending-limits/`),
  updateSpendingLimits: (id: string, data: { daily_limit?: number; weekly_limit?: number; monthly_limit?: number; per_transaction_limit?: number }) => 
    api.put(`/parent/children/${id}/spending-limits/`, data),
  transfer: (data: { child_id: string; amount: number; description?: string }) => 
    api.post("/parent/transfer/", data),
  getMoneyRequests: () => 
    api.get("/parent/money-requests/"),
  approveMoneyRequest: (id: string) => 
    api.post(`/parent/money-requests/${id}/approve/`),
  declineMoneyRequest: (id: string) => 
    api.post(`/parent/money-requests/${id}/decline/`),
  getSpendingAnalytics: () => 
    api.get("/parent/analytics/spending/"),
  freezeAccount: (child_id: string) => 
    api.post(`/parent/freeze-account/${child_id}/`),
};

export const studentApi = {
  getBalance: () => 
    api.get("/student/balance/"),
  getTransactions: () => 
    api.get("/student/transactions/"),
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
