/**
 * useWalletTopupModal Hook
 * Manages wallet topup modal state and handlers
 */

import { useState } from 'react';

export const useWalletTopupModal = () => {
  const [showWalletTopupModal, setShowWalletTopupModal] = useState(false);
  const [topupChildId, setTopupChildId] = useState('');
  const [topupAmount, setTopupAmount] = useState('');

  const openModal = () => {
    setShowWalletTopupModal(true);
    setTopupChildId('');
    setTopupAmount('');
  };

  const closeModal = () => {
    setShowWalletTopupModal(false);
    setTopupChildId('');
    setTopupAmount('');
  };

  const resetState = () => {
    setTopupChildId('');
    setTopupAmount('');
  };

  return {
    showWalletTopupModal,
    setShowWalletTopupModal,
    topupChildId,
    setTopupChildId,
    topupAmount,
    setTopupAmount,
    openModal,
    closeModal,
    resetState,
  };
};
