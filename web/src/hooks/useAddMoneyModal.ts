/**
 * useAddMoneyModal Hook
 * Manages add money modal state and handlers
 */

import { useState } from 'react';

export const useAddMoneyModal = () => {
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  const openModal = () => {
    setShowAddMoneyModal(true);
  };

  const closeModal = () => {
    setShowAddMoneyModal(false);
    setAddMoneyAmount('');
    setSelectedPaymentMethod('');
  };

  const resetState = () => {
    setAddMoneyAmount('');
    setSelectedPaymentMethod('');
  };

  return {
    showAddMoneyModal,
    setShowAddMoneyModal,
    addMoneyAmount,
    setAddMoneyAmount,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    openModal,
    closeModal,
    resetState,
  };
};
