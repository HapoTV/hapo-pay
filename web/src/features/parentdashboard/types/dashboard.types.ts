/**
 * Shared types and interfaces for parent dashboard
 */

export type TabType = 'home' | 'payments' | 'wallet' | 'pay' | 'rewards' | 'settings';
export type BalanceSource = 'family' | 'savings';
export type ProductType = 'Airtime' | 'Data';

export interface Child {
  id: string;
  name: string;
  email: string;
  spendLimit: number;
  currentSpending: number;
  avatar?: string;
}

export interface ParentData {
  id: string;
  name: string;
  email: string;
  familyBalance: number;
  monthlySpending: number;
  savings: number;
  currency: string;
  children: Child[];
}

export interface Contact {
  id: string;
  number: string;
  name: string;
  network: string;
}

export interface TransactionHistory {
  id: string;
  number?: string;
  type?: string;
  meterName?: string;
  meterNumber?: string;
  accountHolder?: string;
  accountNumber?: string;
  amount: number;
  date: string;
  status: string;
}

export interface Meter {
  id: string;
  name: string;
  meterNumber: string;
}

export interface DataBundle {
  id: string;
  label: string;
}

export interface QrPayment {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  status: string;
}
