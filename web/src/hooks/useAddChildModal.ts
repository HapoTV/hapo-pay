/**
 * useAddChildModal Hook
 * Manages add child modal state and handlers
 */

import { useState } from 'react';

export const useAddChildModal = () => {
  const [showAddChildModal, setShowAddChildModal] = useState(false);

  const openModal = () => {
    setShowAddChildModal(true);
  };

  const closeModal = () => {
    setShowAddChildModal(false);
  };

  return {
    showAddChildModal,
    openModal,
    closeModal,
  };
};
