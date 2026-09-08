import React from 'react';
import { PlusIcon, PersonIcon } from '../../../components/icons';
import type { Child } from '../types';

interface ChildrenSectionProps {
  children: Child[];
  onAddChild?: () => void;
  onChildClick?: (child: Child) => void;
  onChangeCurrency?: (child: Child) => void;
}

// Cycle through accent colors per child, mirroring the mobile app
// (Amara = purple, Kwame = teal/green, and so on)
const CHILD_ACCENTS = [
  {
    avatarBg: 'bg-[#7C5CFC]/20',
    avatarText: 'text-[#6D4AFF] dark:text-[#B39DFF]',
    bar: 'bg-[#7C5CFC]',
    ring: 'border-gray-200 dark:border-[#2A2740]',
  },
  {
    avatarBg: 'bg-[#22C55E]/20',
    avatarText: 'text-[#16A34A] dark:text-[#4ADE80]',
    bar: 'bg-[#3ED9C2]',
    ring: 'border-green-200 dark:border-[#22C55E]/40',
  },
];

export const ChildrenSection: React.FC<ChildrenSectionProps> = ({
  children,
  onAddChild,
  onChildClick,
  onChangeCurrency,
}) => {
  const hasChildren = children && children.length > 0;

  return (
    <div className="mb-8">

      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
          Your Children
        </h3>

        <button
          onClick={onAddChild}
          className="bg-[#7C5CFC] hover:bg-[#6A4CE0] text-white px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          Add Child
        </button>
      </div>

      {/* No Children */}
      {!hasChildren ? (
        <div className="bg-white dark:bg-[#1A1830] rounded-2xl p-8 text-center border-2 border-dashed border-gray-300 dark:border-[#2A2740] transition-colors duration-200">
          <PersonIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />

          <p className="text-gray-600 dark:text-gray-400 text-sm">
            No children yet. Click "Add Child" to create an account.
          </p>
        </div>
      ) : (

        /* Children List */
        <ul className="space-y-2">
          {children.map((child, index) => {
            const accent = CHILD_ACCENTS[index % CHILD_ACCENTS.length];

            return (
              <li key={child.id}>
                <div
                  className={`w-full bg-white dark:bg-[#1A1830] rounded-xl p-1 border ${accent.ring} shadow-sm hover:shadow-md transition flex items-center justify-between gap-1.5`}
                >

                  {/* Child Information */}
                  <div
                    onClick={() => onChildClick?.(child)}
                    className="flex-1 flex items-center gap-1.5 cursor-pointer min-w-0"
                  >
                    {child.avatar ? (
                      <img
                        src={child.avatar}
                        alt={child.name}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div
                        className={`w-8 h-8 rounded-full ${accent.avatarBg} flex items-center justify-center flex-shrink-0`}
                      >
                        <span
                          className={`${accent.avatarText} font-bold text-[0.65rem]`}
                        >
                          {child.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    <div className="min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-[0.85rem] truncate">
                        {child.name}
                      </h4>

                      <p className="text-[0.62rem] text-gray-600 dark:text-gray-400 truncate">
                        {child.email}
                      </p>
                    </div>
                  </div>

                  {/* Spending Limit */}
                  <div className="flex-shrink-0 w-40">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[0.65rem] text-gray-600 dark:text-gray-400">
                        Limit
                      </span>

                      <span className="text-[0.85rem] font-semibold text-gray-900 dark:text-white">
                        R
                        {child.spendLimit.toLocaleString('en-ZA', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>

                    {/* Spending Progress */}
                    <div className="w-full bg-gray-200 dark:bg-[#2A2740] rounded-full h-1.5">
                      <div
                        className={`${accent.bar} h-1.5 rounded-full transition-all`}
                        style={{
                          width: `${Math.min(
                            (child.currentSpending / child.spendLimit) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>

                    {/* Current Spending */}
                    <div className="text-right mt-1">
                      <span className="text-[0.6rem] text-gray-600 dark:text-gray-400">
                        Used: R
                        {child.currentSpending.toLocaleString('en-ZA', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>

                    {/* Change Currency */}
                    <button
                      type="button"
                      onClick={() => onChangeCurrency?.(child)}
                      className="mt-1 inline-flex w-max rounded-full bg-[#7C5CFC]/20 px-2 py-0.5 text-[0.62rem] font-semibold text-[#6D4AFF] dark:text-[#B39DFF] transition hover:bg-[#7C5CFC]/30"
                    >
                      Change Currency
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};