import React, { ReactNode } from 'react';
import type { SheetRoute } from '../../types/ui';
import SheetTabs from './SheetTabs';

type PanelMap = Record<SheetRoute, ReactNode>;

interface MobileBottomSheetProps {
  open: boolean;
  route: SheetRoute;
  onRouteChange: (route: SheetRoute) => void;
  onOpenChange: (open: boolean) => void;
  expanded: boolean;
  onExpandedToggle: () => void;
  panels: PanelMap;
  ariaLabel?: string;
}

const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  open,
  route,
  onRouteChange,
  onOpenChange,
  expanded,
  onExpandedToggle,
  panels,
  ariaLabel = 'Mobile sheet hub'
}) => {
  if (!open) return null;

  return (
    <div
      className="panel-sheet elevation-4"
      data-expanded={expanded}
      role="dialog"
      aria-label={ariaLabel}
      // Encourage vertical interactions inside the sheet (helps reduce accidental sideways drags).
      style={{ touchAction: 'pan-y' }}
    >
      <div className="flex justify-center pt-3">
        <div className="panel-sheet__handle" aria-hidden="true" />
      </div>

      <div className="panel-sheet__header">
        <SheetTabs
          route={route}
          onChange={(next) => {
            if (next === route) return;
            onRouteChange(next);
          }}
        />

        <div className="panel-sheet__actions">
          <button
            type="button"
            onClick={onExpandedToggle}
            className="utility-button m3-touch touch-target"
            aria-label={expanded ? 'Collapse panel' : 'Expand panel'}
          >
            <span className="material-icons text-base">{expanded ? 'expand_more' : 'expand_less'}</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="utility-button m3-touch touch-target"
            aria-label="Close panel"
          >
            <span className="material-icons text-base">close</span>
          </button>
        </div>
      </div>

      <div className="panel-sheet__body" style={{ touchAction: 'pan-y' }}>
        {/* Single host: only the selected panel is rendered. */}
        <div className="panel-sheet__panel">{panels[route]}</div>
      </div>
    </div>
  );
};

export default MobileBottomSheet;
