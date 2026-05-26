export interface Transaction {
  id: string;
  user: string;
  amount: number;
  description: string;
  merchant?: string;
  category: string;
  type: 'payment' | 'transfer' | 'airtime' | 'transport' | 'allowance';
  status: 'pending' | 'completed' | 'failed';
  payment_method: 'qr' | 'nfc' | 'card';
  created_at: string;
  updated_at: string;
}

export interface QRCode {
  qr_code: string;
  expires_at: string;
  merchant_id?: string;
}

export interface QRPaymentRequest {
  qr_code: string;
  amount: number;
}

export interface NFCToken {
  token: string;
  expires_at: string;
}

export interface NFCPaymentRequest {
  token: string;
  amount: number;
  merchant_id: string;
}

export interface AirtimePurchaseRequest {
  provider: string;
  phone_number: string;
  amount: number;
}

export interface AirtimeProvider {
  id: string;
  name: string;
  logo_url: string;
}

export interface TransportPurchaseRequest {
  route_id: string;
  amount: number;
}

export interface TransportRoute {
  id: string;
  name: string;
  origin: string;
  destination: string;
  price: number;
}

export interface Merchant {
  id: string;
  name: string;
  category: string;
  logo_url?: string;
  is_verified: boolean;
  created_at: string;
}
