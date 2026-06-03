import React, { useState } from 'react';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: Date;
  childName?: string;
}

export const WalletPage: React.FC = () => {
  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'debit',
      amount: 250,
      description: 'Thabo - School Payment',
      date: new Date('2024-06-01'),
      childName: 'Thabo',
    },
    {
      id: '2',
      type: 'debit',
      amount: 180,
      description: 'Nomsa - Electricity Top-up',
      date: new Date('2024-05-28'),
      childName: 'Nomsa',
    },
    {
      id: '3',
      type: 'credit',
      amount: 500,
      description: 'Added funds to family wallet',
      date: new Date('2024-05-25'),
    },
  ]);

  return (
    <div className="pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 rounded-b-3xl mb-6">
        <h1 className="text-2xl font-bold mb-2">Wallet</h1>
        <p className="text-pink-100">Manage your family finances</p>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Wallet Balance Card */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <p className="text-gray-600 text-sm font-medium mb-2">Available Balance</p>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">R 365.00</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-medium transition">
              Add Funds
            </button>
            <button className="border-2 border-pink-500 text-pink-500 hover:bg-pink-50 px-4 py-2 rounded-lg font-medium transition">
              Withdraw
            </button>
          </div>
        </div>

        {/* Transaction History */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Transaction History</h3>
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      transaction.type === 'credit'
                        ? 'bg-green-100'
                        : 'bg-red-100'
                    }`}
                  >
                    {transaction.type === 'credit' ? (
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414-1.414L13.586 7H12z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 13a1 1 0 110 2H3a1 1 0 01-1-1V9a1 1 0 112 0v3.586l4.293-4.293a1 1 0 011.414 1.414L6.414 13H8z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">
                      {transaction.date.toLocaleDateString('en-ZA')}
                    </p>
                  </div>
                </div>
                <span
                  className={`font-bold text-lg ${
                    transaction.type === 'credit'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {transaction.type === 'credit' ? '+' : '-'}R{transaction.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};