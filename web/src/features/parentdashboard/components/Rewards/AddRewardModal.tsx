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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Add New Reward</h2>
            <p className="text-sm text-slate-500">Create a reward that your child can redeem with points.</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div>
            <label className="text-sm font-medium text-slate-700">Reward Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => onChangeTitle(e.target.value)}
              placeholder="e.g., Extra Gaming Time"
              className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => onChangeDescription(e.target.value)}
              rows={3}
              placeholder="Describe what the child will get..."
              className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-slate-700">Points Cost</label>
              <input
                type="number"
                min="0"
                value={points}
                onChange={(e) => onChangePoints(e.target.value)}
                placeholder="100"
                className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Icon</label>
              <select
                value={icon}
                onChange={(e) => onChangeIcon(e.target.value)}
                className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none"
              >
                {rewardIcons.map((rewardIcon) => (
                  <option key={rewardIcon.value} value={rewardIcon.value}>{rewardIcon.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Category</label>
              <select
                value={category}
                onChange={(e) => onChangeCategory(e.target.value)}
                className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none"
              >
                {rewardCategories.map((rewardCategory) => (
                  <option key={rewardCategory} value={rewardCategory}>{rewardCategory}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-200 bg-slate-50">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end sm:items-center">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={disabled}
              className="w-full rounded-full bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-rose-300 sm:w-auto"
            >
              Add Reward
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
