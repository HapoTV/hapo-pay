/**
 * useElectricityModal Hook
 * Manages electricity purchase modal state and handlers
 */

import { useState } from 'react';

interface Meter {
  id: string;
  name: string;
  meterNumber: string;
}

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

  const resetBuyState = () => {
    setSelectedMeterForBuy(null);
    setElectricityAmount('');
  };

  const resetMeterForm = () => {
    setNewMeterName('');
    setNewMeterNumber('');
  };

  return {
    showElectricityPage,
    setShowElectricityPage,
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
    resetBuyState,
    resetMeterForm,
  };
};
