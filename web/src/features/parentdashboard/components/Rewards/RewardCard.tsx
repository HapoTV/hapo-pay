import React from 'react';
import { Gift } from 'lucide-react';
import type { Reward } from './types';

interface RewardCardProps {
  reward: Reward;
  onToggleStatus: (id: string) => void;
}

export const RewardCard: React.FC<RewardCardProps> = ({ reward, onToggleStatus }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-sm">
        <Gift size={16} />
      </div>
      <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {reward.category || 'Reward'}
      </span>
    </div>

    <h3 className="mt-4 text-base font-semibold text-slate-950">{reward.title}</h3>
    <p className="mt-3 text-sm leading-6 text-slate-600">{reward.description}</p>
    <p className="mt-4 text-sm text-slate-600">
      Cost: <span className="font-semibold text-sky-600">{reward.points} points</span>
    </p>
    <button
      type="button"
      onClick={() => onToggleStatus(reward.id)}
      className="mt-4 inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
    >
      {reward.active ? 'Mark Inactive' : 'Reactivate'}
    </button>
  </div>
);
