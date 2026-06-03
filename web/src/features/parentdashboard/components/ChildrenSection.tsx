import React from 'react';
import type { Child } from '../types';

interface ChildrenSectionProps {
  children: Child[];
  onAddChild?: () => void;
  onChildClick?: (child: Child) => void;
}

export const ChildrenSection: React.FC<ChildrenSectionProps> = ({
  children,
  onAddChild,
  onChildClick,
}) => {
  const hasChildren = children && children.length > 0;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">Your Children</h3>
        <button
          onClick={onAddChild}
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Child
        </button>
      </div>

      {!hasChildren ? (
        <div className="bg-white rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <p className="text-gray-600 text-sm">No children yet. Click "Add Child" to create an account.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => onChildClick?.(child)}
              className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition transform hover:scale-105 text-left"
            >
              <div className="flex items-center gap-3 mb-3">
                {child.avatar ? (
                  <img
                    src={child.avatar}
                    alt={child.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-pink-200 flex items-center justify-center">
                    <span className="text-pink-600 font-bold">
                      {child.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-gray-900">{child.name}</h4>
                  <p className="text-xs text-gray-500">{child.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Spending Limit</span>
                  <span className="text-sm font-semibold text-gray-900">
                    R{child.spendLimit.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-pink-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min((child.currentSpending / child.spendLimit) * 100, 100)}%`,
                    }}
                  />
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-600">
                    Used: R{child.currentSpending.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};