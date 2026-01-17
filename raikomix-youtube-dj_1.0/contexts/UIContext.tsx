import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { BREAKPOINTS, MobileTab } from '../types';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useTheme } from '../hooks/useTheme';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface UIContextValue {
  isMobile: boolean;
  isMobileLandscape: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  activeMobileTab: MobileTab;
  setActiveMobileTab: (tab: MobileTab) => void;
  isMixerOpen: boolean;
  openMixer: () => void;
  closeMixer: () => void;
  toggleMixer: () => void;
  showQueue: boolean;
  setShowQueue: (value: boolean) => void;
  desktopPanelTab: 'LIBRARY' | 'QUEUE';
  setDesktopPanelTab: (tab: 'LIBRARY' | 'QUEUE') => void;
  toast: ToastState | null;
  showToast: (message: string, type?: ToastState['type']) => void;
  clearToast: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const UIContext = createContext<UIContextValue | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isMobile = useMediaQuery(BREAKPOINTS.mobile);
  const isMobileLandscape = useMediaQuery(BREAKPOINTS.mobileLandscape);
  const isTablet = useMediaQuery(BREAKPOINTS.tablet);
  const isDesktop = useMediaQuery(BREAKPOINTS.desktop);
  const [activeMobileTab, setActiveMobileTab] = useState<MobileTab>('MIX');
  const [isMixerOpen, setIsMixerOpen] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [desktopPanelTab, setDesktopPanelTab] = useState<'LIBRARY' | 'QUEUE'>('LIBRARY');
  const [toast, setToast] = useState<ToastState | null>(null);
  const { theme, toggleTheme } = useTheme();

  const openMixer = useCallback(() => setIsMixerOpen(true), []);
  const closeMixer = useCallback(() => setIsMixerOpen(false), []);
  const toggleMixer = useCallback(() => setIsMixerOpen(prev => !prev), []);

  const showToast = useCallback((message: string, type: ToastState['type'] = 'info') => {
    setToast({ message, type });
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  const value = useMemo(
    () => ({
      isMobile,
      isMobileLandscape,
      isTablet,
      isDesktop,
      activeMobileTab,
      setActiveMobileTab,
      isMixerOpen,
      openMixer,
      closeMixer,
      toggleMixer,
      showQueue,
      setShowQueue,
      desktopPanelTab,
      setDesktopPanelTab,
      toast,
      showToast,
      clearToast,
      theme,
      toggleTheme
    }),
    [
      activeMobileTab,
      clearToast,
      closeMixer,
      desktopPanelTab,
      isDesktop,
      isMobile,
      isMobileLandscape,
      isMixerOpen,
      isTablet,
      openMixer,
      setActiveMobileTab,
      setDesktopPanelTab,
      setShowQueue,
      showQueue,
      showToast,
      theme,
      toast,
      toggleMixer,
      toggleTheme
    ]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = (): UIContextValue => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
