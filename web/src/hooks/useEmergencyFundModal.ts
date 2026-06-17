/**
 * useEmergencyFundModal Hook
 * Manages emergency fund transfer modal state and handlers
 */

import { useState } from 'react';

export const useEmergencyFundModal = () => {
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [emergencyAmount, setEmergencyAmount] = useState('');

  const openModal = () => {
    setShowEmergencyModal(true);
    setSelectedChildId('');
    setEmergencyAmount('');
  };

  const closeModal = () => {
    setShowEmergencyModal(false);
    setSelectedChildId('');
    setEmergencyAmount('');
  };

  const resetState = () => {
    setSelectedChildId('');
    setEmergencyAmount('');
  };

  return {
    showEmergencyModal,
    setShowEmergencyModal,
    selectedChildId,
    setSelectedChildId,
    emergencyAmount,
    setEmergencyAmount,
    openModal,
    closeModal,
    resetState,
  };
};
