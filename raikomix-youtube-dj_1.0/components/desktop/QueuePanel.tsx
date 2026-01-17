import React, { memo, useCallback, useMemo } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import { QueueItem, DeckId } from '../../types';
import { exportQueue } from '../../utils/queueStorage';
import { useSwipeable } from '../../hooks/useSwipeable';

interface QueuePanelProps {
  queue: QueueItem[];
  onLoadToDeck: (item: QueueItem, deck: DeckId) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onReorder: (from: number, to: number) => void;
  variant?: 'desktop' | 'mobile';
}

interface RowData {
  items: QueueItem[];
  onLoadToDeck: (item: QueueItem, deck: DeckId) => void;
  onRemove: (id: string) => void;
  variant: 'desktop' | 'mobile';
}

const QueueRow: React.FC<ListChildComponentProps<RowData>> = memo(({ index, style, data }) => {
  const item = data.items[index];
  const bind = useSwipeable({
    onSwipedLeft: () => data.onRemove(item.id)
  });

  return (
    <div style={style} className="px-1">
      <div
        {...bind()}
        className="flex items-center gap-3 p-3 bg-[#1C1B1F] rounded-xl border border-white/5 min-h-[64px]"
      >
        <span className="text-[10px] font-mono text-gray-500 w-5">{index + 1}</span>
        <img src={item.thumbnailUrl} alt={item.title} className="w-12 h-12 rounded-lg object-cover" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{item.title}</p>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 truncate">{item.author || 'Unknown Artist'}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => data.onLoadToDeck(item, 'A')}
            className="min-w-[44px] min-h-[44px] rounded-lg bg-[#D0BCFF] text-black font-bold"
          >
            A
          </button>
          <button
            type="button"
            onClick={() => data.onLoadToDeck(item, 'B')}
            className="min-w-[44px] min-h-[44px] rounded-lg bg-[#F2B8B5] text-black font-bold"
          >
            B
          </button>
        </div>
      </div>
    </div>
  );
});

const QueuePanel: React.FC<QueuePanelProps> = ({ queue, onLoadToDeck, onRemove, onClear, variant = 'desktop' }) => {
  const listData = useMemo<RowData>(() => ({ items: queue, onLoadToDeck, onRemove, variant }), [queue, onLoadToDeck, onRemove, variant]);

  const handleExport = useCallback(() => exportQueue(queue), [queue]);

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Play Queue ({queue.length})</h3>
        {queue.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="min-h-[44px] px-4 rounded-lg bg-white/5 text-gray-200"
              title="Export Queue JSON"
            >
              <span className="material-symbols-outlined">download</span>
            </button>
            <button
              onClick={onClear}
              className="min-h-[44px] px-4 rounded-lg bg-red-500/20 text-red-200 text-[10px] font-bold uppercase"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0">
        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-60">
            <span className="material-symbols-outlined text-4xl mb-2">queue_music</span>
            <p className="text-xs uppercase tracking-widest font-bold">Queue is empty</p>
          </div>
        ) : (
          <List
            height={variant === 'mobile' ? 360 : 520}
            itemCount={queue.length}
            itemSize={variant === 'mobile' ? 76 : 72}
            width="100%"
            itemData={listData}
          >
            {QueueRow}
          </List>
        )}
      </div>
    </div>
  );
};

export default memo(QueuePanel);
