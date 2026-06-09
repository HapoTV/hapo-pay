import React from 'react';
import { PlusIcon, PersonIcon } from '../../../components/icons';
import type { Child } from '../types';

interface ChildrenSectionProps {
  children: Child[];
  onAddChild?: () => void;
  onChildClick?: (child: Child) => void;
  onChangeCurrency?: (child: Child) => void;
}

export const ChildrenSection: React.FC<ChildrenSectionProps> = ({
  children,
  onAddChild,
  onChildClick,
  onChangeCurrency,
}) => {
  const hasChildren = children && children.length > 0;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-slate-950">Your Children</h3>
        <button
          onClick={onAddChild}
          className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          Add Child
        </button>
      </div>

      {!hasChildren ? (
        <div className="bg-white rounded-2xl p-8 text-center border-2 border-dashed border-slate-200">
          <PersonIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 text-sm">No children yet. Click "Add Child" to create an account.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {children.map((child) => (
            <li key={child.id}>
              <div className="w-full bg-white rounded-xl p-1 shadow-sm hover:shadow-md transition flex items-center justify-between gap-1.5">
                <div
                  onClick={() => onChildClick?.(child)}
                  className="flex-1 flex items-center gap-1.5 cursor-pointer"
                >
                  {child.avatar ? (
                    <img
                      src={child.avatar}
                      alt={child.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-rose-200 flex items-center justify-center">
                      <span className="text-rose-600 font-bold text-[0.65rem]">
                        {child.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-slate-950 text-[0.85rem]">{child.name}</h4>
                    <p className="text-[0.62rem] text-slate-500">{child.email}</p>
                  </div>
                </div>

                <div className="flex-shrink-0 w-40">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[0.65rem] text-slate-600">Limit</span>
                    <span className="text-[0.85rem] font-semibold text-slate-950">
                      R{child.spendLimit.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className="bg-rose-500 h-1.5 rounded-full transition-all"
                      style={{
                        width: `${Math.min((child.currentSpending / child.spendLimit) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="text-right mt-1">
                    <span className="text-[0.6rem] text-slate-600">
                      Used: R{child.currentSpending.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onChangeCurrency?.(child)}
                    className="mt-1 inline-flex w-max rounded-full bg-violet-200 px-2 py-0.5 text-[0.62rem] font-semibold text-slate-950 transition hover:bg-violet-300"
                  >
                    Change Currency
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};