/**
 * useAddChildModal Hook
 * Manages add child modal state and handlers
 */

import { useState } from 'react';

export const useAddChildModal = () => {
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [childFirstName, setChildFirstName] = useState('');
  const [childLastName, setChildLastName] = useState('');
  const [childUsername, setChildUsername] = useState('');
  const [childPassword, setChildPassword] = useState('');
  const [childWeeklyLimit, setChildWeeklyLimit] = useState('');
  const [childDailyLimit, setChildDailyLimit] = useState('');

  const openModal = () => {
    setShowAddChildModal(true);
  };

  const closeModal = () => {
    resetState();
    setShowAddChildModal(false);
  };

  const resetState = () => {
    setChildFirstName('');
    setChildLastName('');
    setChildUsername('');
    setChildPassword('');
    setChildWeeklyLimit('');
    setChildDailyLimit('');
  };

  return {
    showAddChildModal,
    setShowAddChildModal,
    childFirstName,
    setChildFirstName,
    childLastName,
    setChildLastName,
    childUsername,
    setChildUsername,
    childPassword,
    setChildPassword,
    childWeeklyLimit,
    setChildWeeklyLimit,
    childDailyLimit,
    setChildDailyLimit,
    openModal,
    closeModal,
    resetState,
  };
};
