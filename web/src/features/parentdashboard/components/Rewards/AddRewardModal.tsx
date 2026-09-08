import React from 'react';
import type { RewardIconOption } from './types';

interface AddRewardModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  points: string;
  icon: string;
  category: string;
  rewardIcons: RewardIconOption[];
  rewardCategories: string[];
  onChangeTitle: (value: string) => void;
  onChangeDescription: (value: string) => void;
  onChangePoints: (value: string) => void;
  onChangeIcon: (value: string) => void;
  onChangeCategory: (value: string) => void;
  onSave: () => void;
  disabled: boolean;
}

export const AddRewardModal: React.FC<AddRewardModalProps> = ({
  open,
  onClose,
  title,
  description,
  points,
  icon,
  category,
  rewardIcons,
  rewardCategories,
  onChangeTitle,
  onChangeDescription,
  onChangePoints,
  onChangeIcon,
  onChangeCategory,
  onSave,
  disabled,
}) => {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#1A1830] border border-gray-200 dark:border-[#2A2740] shadow-xl overflow-hidden transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-[#2A2740]">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Add New Reward
            </h2>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create a reward that your child can redeem with points.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4 px-5 py-5">

          {/* Reward Title */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Reward Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) => onChangeTitle(e.target.value)}
              placeholder="e.g., Extra Gaming Time"
              className="mt-3 w-full rounded-2xl border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:border-[#7C5CFC] focus:outline-none transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) => onChangeDescription(e.target.value)}
              rows={3}
              placeholder="Describe what the child will get..."
              className="mt-3 w-full rounded-2xl border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:border-[#7C5CFC] focus:outline-none transition-colors"
            />
          </div>

          {/* Points / Icon / Category */}
          <div className="grid gap-3 sm:grid-cols-3">

            {/* Points Cost */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Points Cost
              </label>

              <input
                type="number"
                min="0"
                value={points}
                onChange={(e) => onChangePoints(e.target.value)}
                placeholder="100"
                className="mt-3 w-full rounded-2xl border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:border-[#7C5CFC] focus:outline-none transition-colors"
              />
            </div>

            {/* Icon */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Icon
              </label>

              <select
                value={icon}
                onChange={(e) => onChangeIcon(e.target.value)}
                className="mt-3 w-full rounded-2xl border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] px-4 py-3 text-sm text-gray-900 dark:text-white shadow-sm focus:border-[#7C5CFC] focus:outline-none transition-colors"
              >
                {rewardIcons.map((rewardIcon) => (
                  <option
                    key={rewardIcon.value}
                    value={rewardIcon.value}
                  >
                    {rewardIcon.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
              </label>

              <select
                value={category}
                onChange={(e) => onChangeCategory(e.target.value)}
                className="mt-3 w-full rounded-2xl border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] px-4 py-3 text-sm text-gray-900 dark:text-white shadow-sm focus:border-[#7C5CFC] focus:outline-none transition-colors"
              >
                {rewardCategories.map((rewardCategory) => (
                  <option
                    key={rewardCategory}
                    value={rewardCategory}
                  >
                    {rewardCategory}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-4 border-t border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] transition-colors duration-200">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end sm:items-center">

            {/* Cancel */}
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-full border border-gray-200 dark:border-[#2A2740] bg-white dark:bg-[#1A1830] px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-[#2A2740] sm:w-auto"
            >
              Cancel
            </button>

            {/* Add Reward */}
            <button
              type="button"
              onClick={onSave}
              disabled={disabled}
              className="w-full rounded-full bg-[#7C5CFC] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6A4CE0] disabled:cursor-not-allowed disabled:bg-[#7C5CFC]/30 sm:w-auto"
            >
              Add Reward
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};