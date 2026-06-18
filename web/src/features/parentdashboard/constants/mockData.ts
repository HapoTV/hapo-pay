/**
 * Mock data for parent dashboard development and testing
 * This file contains all static mock data used across the parent dashboard
 */

export const mockParentData = {
  id: 'parent-1',
  name: 'Olwethu Madubela',
  email: 'olwethu.madubela.hapo@gmail.com',
  familyBalance: 500.0,
  monthlySpending: 150.0,
  savings: 1250.0,
  currency: 'R',
  children: [
    {
      id: '1',
      name: 'Thabo Madubela',
      email: 'thabo@hapo.com',
      spendLimit: 500,
      currentSpending: 250,
      avatar: undefined,
    },
    {
      id: '2',
      name: 'Nomsa Madubela',
      email: 'nomsa@hapo.com',
      spendLimit: 450,
      currentSpending: 180,
      avatar: undefined,
    },
  ],
};

export const mockContacts = [
  { id: '1', number: '+27 71 234 5678', name: 'Thabo', network: 'Vodacom' },
  { id: '2', number: '+27 82 345 6789', name: 'Nomsa', network: 'MTN' },
  { id: '3', number: '+27 73 456 7890', name: 'Brother', network: 'Cell C' },
];

export const mockAirtimeHistory = [
  { id: '1', number: '+27 71 234 5678', type: 'Airtime', amount: 50, date: '2025-01-15', status: 'Success' },
  { id: '2', number: '+27 82 345 6789', type: 'Data', amount: 30, date: '2025-01-12', status: 'Success' },
  { id: '3', number: '+27 73 456 7890', type: 'Airtime', amount: 100, date: '2025-01-10', status: 'Success' },
  { id: '4', number: '+27 71 234 5678', type: 'Data', amount: 20, date: '2025-01-08', status: 'Success' },
];

export const mockElectricityHistory = [
  { id: '1', meterName: 'Home', meterNumber: '1234567890', amount: 500, date: '2025-01-18', status: 'Success' },
  { id: '2', meterName: 'Home', meterNumber: '1234567890', amount: 300, date: '2025-01-14', status: 'Success' },
  { id: '3', meterName: 'Home', meterNumber: '1234567890', amount: 250, date: '2025-01-10', status: 'Success' },
  { id: '4', meterName: 'Home', meterNumber: '1234567890', amount: 400, date: '2025-01-05', status: 'Success' },
];

export const mockTvHistory = [
  { id: '1', accountHolder: 'John Doe', accountNumber: '6789012345', amount: 800, date: '2025-01-16', status: 'Success' },
  { id: '2', accountHolder: 'John Doe', accountNumber: '6789012345', amount: 800, date: '2025-01-01', status: 'Success' },
  { id: '3', accountHolder: 'Jane Smith', accountNumber: '5678901234', amount: 480, date: '2024-12-20', status: 'Success' },
];

export const mockQrPayments = [
  { id: '1', merchant: 'GoodFood Cafe', amount: 120, date: 'Today', status: 'Paid' },
  { id: '2', merchant: 'Market Express', amount: 85, date: 'Yesterday', status: 'Paid' },
  { id: '3', merchant: 'Bookstore', amount: 210, date: '2 days ago', status: 'Paid' },
];

export const dataBundlesByNetwork: Record<string, { id: string; label: string }[]> = {
  Vodacom: [
    { id: 'vodacom-100mb', label: '100MB' },
    { id: 'vodacom-250mb', label: '250MB' },
    { id: 'vodacom-500mb', label: '500MB' },
    { id: 'vodacom-1gb', label: '1GB' },
  ],
  MTN: [
    { id: 'mtn-150mb', label: '150MB' },
    { id: 'mtn-500mb', label: '500MB' },
    { id: 'mtn-1gb', label: '1GB' },
    { id: 'mtn-2gb', label: '2GB' },
  ],
  'Cell C': [
    { id: 'cellc-100mb', label: '100MB' },
    { id: 'cellc-300mb', label: '300MB' },
    { id: 'cellc-1gb', label: '1GB' },
  ],
  'Telkom Mobile': [
    { id: 'telkom-100mb', label: '100MB' },
    { id: 'telkom-400mb', label: '400MB' },
    { id: 'telkom-1-5gb', label: '1.5GB' },
  ],
};
