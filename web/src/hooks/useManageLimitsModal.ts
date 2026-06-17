/**
 * useManageLimitsModal Hook
 * Manages spending limits modal state and handlers
 */

import { useState } from 'react';

export const useManageLimitsModal = () => {
  const [showManageLimitsModal, setShowManageLimitsModal] = useState(false);

  const openModal = () => {
    setShowManageLimitsModal(true);
  };

  const closeModal = () => {
    setShowManageLimitsModal(false);
  };

  return {
    showManageLimitsModal,
    setShowManageLimitsModal,
    openModal,
    closeModal,
  };
};
