/**
 * useAirtimeModal Hook
 * Manages airtime/data purchase modal state and handlers
 */

import { useState } from 'react';

interface Contact {
  id: string;
  number: string;
  name: string;
  network: string;
}

export const useAirtimeModal = (initialContacts: Contact[]) => {
  const [showAirtimePage, setShowAirtimePage] = useState(false);
  const [airtimeTab, setAirtimeTab] = useState<'buy' | 'history'>('buy');
  const [contacts, setContacts] = useState(initialContacts);
  const [showAddContactForm, setShowAddContactForm] = useState(false);
  const [newContactNumber, setNewContactNumber] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newContactNetwork, setNewContactNetwork] = useState('');
  const [selectedContactForBuy, setSelectedContactForBuy] = useState<string | null>(null);
  const [buyAccount, setBuyAccount] = useState('');
  const [buyProductType, setBuyProductType] = useState('');
  const [airtimeAmount, setAirtimeAmount] = useState('');
  const [selectedDataBundle, setSelectedDataBundle] = useState('');
  const [showAirtimeConfirmation, setShowAirtimeConfirmation] = useState(false);

  const openModal = () => {
    setShowAirtimePage(true);
  };

  const closeModal = () => {
    setShowAirtimePage(false);
    setAirtimeTab('buy');
    setShowAddContactForm(false);
    setNewContactNumber('');
    setNewContactName('');
    setNewContactNetwork('');
    setSelectedContactForBuy(null);
    setBuyAccount('');
    setBuyProductType('');
    setAirtimeAmount('');
    setSelectedDataBundle('');
    setShowAirtimeConfirmation(false);
  };

  const resetBuyState = () => {
    setSelectedContactForBuy(null);
    setBuyAccount('');
    setBuyProductType('');
    setAirtimeAmount('');
    setSelectedDataBundle('');
  };

  const resetContactForm = () => {
    setNewContactNumber('');
    setNewContactName('');
    setNewContactNetwork('');
  };

  return {
    showAirtimePage,
    setShowAirtimePage,
    airtimeTab,
    setAirtimeTab,
    contacts,
    setContacts,
    showAddContactForm,
    setShowAddContactForm,
    newContactNumber,
    setNewContactNumber,
    newContactName,
    setNewContactName,
    newContactNetwork,
    setNewContactNetwork,
    selectedContactForBuy,
    setSelectedContactForBuy,
    buyAccount,
    setBuyAccount,
    buyProductType,
    setBuyProductType,
    airtimeAmount,
    setAirtimeAmount,
    selectedDataBundle,
    setSelectedDataBundle,
    showAirtimeConfirmation,
    setShowAirtimeConfirmation,
    openModal,
    closeModal,
    resetBuyState,
    resetContactForm,
  };
};
