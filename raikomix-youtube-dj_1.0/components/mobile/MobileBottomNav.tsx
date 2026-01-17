import React, { memo, useCallback } from 'react';
import { useUI } from '../../contexts/UIContext';
import { MobileTab } from '../../types';

interface NavItem {
  id: MobileTab;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'MIX', label: 'Mix', icon: 'tune' },
  { id: 'LIBRARY', label: 'Library', icon: 'library_music' },
  { id: 'FX', label: 'FX', icon: 'graphic_eq' }
];

const MobileBottomNav: React.FC = () => {
  const { activeMobileTab, setActiveMobileTab } = useUI();

  const handleSelect = useCallback(
    (tab: MobileTab) => () => setActiveMobileTab(tab),
    [setActiveMobileTab]
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#111016] border-t border-white/10 px-4 py-2">
      <div className="flex items-center justify-between">
        {NAV_ITEMS.map(item => {
          const isActive = activeMobileTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={handleSelect(item.id)}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl min-w-[88px] min-h-[56px] transition ${
                isActive ? 'bg-[#D0BCFF] text-black' : 'text-gray-300'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="material-symbols-outlined text-2xl">{item.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default memo(MobileBottomNav);
