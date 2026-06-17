/**
 * useAccountTransfer Hook
 * Manages account-to-account transfer state
 */

import { useState } from 'react';

export const useAccountTransfer = (familyBalance: number, savings: number) => {
  const [transferSource, setTransferSource] = useState<'family' | 'savings'>('family');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferMessage, setTransferMessage] = useState('');

  const resetState = () => {
    setTransferSource('family');
    setTransferAmount('');
    setTransferMessage('');
  };

  const setSuccessMessage = (amount: number, from: string, to: string) => {
    setTransferMessage(`Successfully transferred R${amount.toFixed(2)} from ${from} to ${to}.`);
    setTransferAmount('');
  };

  const setErrorMessage = (error: string) => {
    setTransferMessage(error);
  };

  return {
    transferSource,
    setTransferSource,
    transferAmount,
    setTransferAmount,
    transferMessage,
    setTransferMessage,
    familyBalance,
    savings,
    resetState,
    setSuccessMessage,
    setErrorMessage,
  };
};
