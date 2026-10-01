/**
 * useElectricityModal Hook
 * Manages electricity purchase modal state and handlers
 */

import { useState } from 'react';
import type { Meter } from '@/features/parentdashboard/types/dashboard.types';

export const useElectricityModal = (initialMeters: Meter[]) => {
  const [showElectricityPage, setShowElectricityPage] = useState(false);
  const [electricityTab, setElectricityTab] = useState<'buy' | 'history'>('buy');
  const [electricityMeters, setElectricityMeters] = useState(initialMeters);
  const [showAddMeterForm, setShowAddMeterForm] = useState(false);
  const [newMeterName, setNewMeterName] = useState('');
  const [newMeterNumber, setNewMeterNumber] = useState('');
  const [selectedMeterForBuy, setSelectedMeterForBuy] = useState<string | null>(null);
  const [electricityAmount, setElectricityAmount] = useState('');
  const [showElectricityConfirmation, setShowElectricityConfirmation] = useState(false);

  const openModal = () => {
    setShowElectricityPage(true);
  };

  const closeModal = () => {
    setShowElectricityPage(false);
    setElectricityTab('buy');
    setShowAddMeterForm(false);
    setNewMeterName('');
    setNewMeterNumber('');
    setSelectedMeterForBuy(null);
    setElectricityAmount('');
    setShowElectricityConfirmation(false);
  };

  return {
    showElectricityPage,
    electricityTab,
    setElectricityTab,
    electricityMeters,
    setElectricityMeters,
    showAddMeterForm,
    setShowAddMeterForm,
    newMeterName,
    setNewMeterName,
    newMeterNumber,
    setNewMeterNumber,
    selectedMeterForBuy,
    setSelectedMeterForBuy,
    electricityAmount,
    setElectricityAmount,
    showElectricityConfirmation,
    setShowElectricityConfirmation,
    openModal,
    closeModal,
  };
};
