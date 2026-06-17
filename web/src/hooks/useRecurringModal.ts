/**
 * useRecurringModal Hook
 * Manages recurring payment modal state and handlers
 */

import { useState } from 'react';

export const useRecurringModal = () => {
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [showRecurringFormModal, setShowRecurringFormModal] = useState(false);

  const openRecurringModal = () => {
    setShowRecurringModal(true);
  };

  const closeRecurringModal = () => {
    setShowRecurringModal(false);
  };

  const openRecurringFormModal = () => {
    setShowRecurringModal(false);
    setShowRecurringFormModal(true);
  };

  const closeRecurringFormModal = () => {
    setShowRecurringFormModal(false);
  };

  const closeAllModals = () => {
    setShowRecurringModal(false);
    setShowRecurringFormModal(false);
  };

  return {
    showRecurringModal,
    setShowRecurringModal,
    showRecurringFormModal,
    setShowRecurringFormModal,
    openRecurringModal,
    closeRecurringModal,
    openRecurringFormModal,
    closeRecurringFormModal,
    closeAllModals,
  };
};
