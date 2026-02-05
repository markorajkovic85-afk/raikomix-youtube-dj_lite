import React from 'react';
import type { SheetRoute } from '../../types/ui';

type TabConfig = {
  id: SheetRoute;
  label: string;
  icon: string;
};

const TABS: TabConfig[] = [
  { id: 'library', label: 'Library', icon: 'library_music' },
  { id: 'queue', label: 'Queue', icon: 'queue_music' },
  { id: 'fx', label: 'FX', icon: 'auto_fix_high' },
  { id: 'pads', label: 'Pads', icon: 'grid_view' },
  { id: 'settings', label: 'Settings', icon: 'settings' }
];

interface SheetTabsProps {
  route: SheetRoute;
  onChange: (route: SheetRoute) => void;
}

const SheetTabs: React.FC<SheetTabsProps> = ({ route, onChange }) => {
  return (
    <div className="panel-sheet__tabs" role="tablist" aria-label="Sheet tabs">
      {TABS.map(tab => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`panel-tab m3-touch touch-target ${route === tab.id ? 'is-active' : ''}`}
          aria-pressed={route === tab.id}
          role="tab"
        >
          <span className="material-icons text-base mr-2" aria-hidden="true">
            {tab.icon}
          </span>
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default SheetTabs;
