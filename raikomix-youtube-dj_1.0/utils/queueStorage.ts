import { QueueItem } from '../types';

const STORAGE_KEY = 'raikomix_queue';
const STORAGE_VERSION = 1;

export const loadQueue = (): QueueItem[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const data = JSON.parse(saved);
    const items = Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
        ? data.items
        : [];
    if (!Array.isArray(items)) return [];
    return items
      .filter(item => item && typeof item === 'object')
      .map(item => ({
        id: item.id || `${Date.now()}_${item.videoId || 'queue'}`,
        videoId: item.videoId || '',
        url: item.url || '',
        title: item.title || 'Untitled Track',
        thumbnailUrl: item.thumbnailUrl || '',
        addedAt: item.addedAt || Date.now(),
        author: item.author,
        sourceType: item.sourceType
      })) as QueueItem[];
  } catch (error) {
    console.error('Failed to load queue:', error);
    return [];
  }
};

export const saveQueue = (queue: QueueItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, items: queue }));
  } catch (error) {
    console.error('Failed to save queue:', error);
  }
};

export const exportQueue = (queue: QueueItem[]): void => {
  const dataStr = JSON.stringify(queue, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `raikomix-queue-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
};
