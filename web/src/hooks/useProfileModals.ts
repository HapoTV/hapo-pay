/**
 * useProfileModals Hook
 * Manages profile-related modals (edit, delete, change password)
 */

import { useState } from 'react';

export const useProfileModals = () => {
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const openEditProfile = () => {
    setShowEditProfileModal(true);
  };

  const closeEditProfile = () => {
    setShowEditProfileModal(false);
  };

  const openDeleteAccount = () => {
    setShowDeleteAccountModal(true);
  };

  const closeDeleteAccount = () => {
    setShowDeleteAccountModal(false);
  };

  const openChangePassword = () => {
    setPasswordError('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowChangePasswordModal(true);
  };

  const closeChangePassword = () => {
    setShowChangePasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };

  const resetPasswordState = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };

  return {
    showEditProfileModal,
    setShowEditProfileModal,
    showDeleteAccountModal,
    setShowDeleteAccountModal,
    showChangePasswordModal,
    setShowChangePasswordModal,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passwordError,
    setPasswordError,
    openEditProfile,
    closeEditProfile,
    openDeleteAccount,
    closeDeleteAccount,
    openChangePassword,
    closeChangePassword,
    resetPasswordState,
  };
};
