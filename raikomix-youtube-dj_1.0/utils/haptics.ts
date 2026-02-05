/**
 * Haptic feedback utility for mobile devices
 * Provides tactile feedback for touch interactions
 */

/**
 * Check if haptic feedback is supported
 */
export const isHapticsSupported = (): boolean => {
  return 'vibrate' in navigator;
};

/**
 * Trigger haptic feedback with predefined patterns or custom vibration
 * @param pattern - Predefined pattern name or custom vibration array
 */
export const triggerHaptic = (
  pattern: 'light' | 'medium' | 'heavy' | 'success' | 'error' | number[]
): void => {
  if (!isHapticsSupported()) {
    return;
  }

  try {
    switch (pattern) {
      case 'light':
        // Quick, subtle tap - for button presses
        navigator.vibrate(10);
        break;
        
      case 'medium':
        // Moderate feedback - for pad triggers
        navigator.vibrate(25);
        break;
        
      case 'heavy':
        // Strong feedback - for important actions
        navigator.vibrate(50);
        break;
        
      case 'success':
        // Double tap for successful actions
        navigator.vibrate([20, 50, 20]);
        break;
        
      case 'error':
        // Triple short burst for errors
        navigator.vibrate([50, 50, 50, 50, 50]);
        break;
        
      default:
        // Custom pattern
        if (Array.isArray(pattern)) {
          navigator.vibrate(pattern);
        }
    }
  } catch (error) {
    // Silently fail if vibration fails
    console.debug('Haptic feedback failed:', error);
  }
};

/**
 * Cancel any ongoing vibration
 */
export const cancelHaptic = (): void => {
  if (isHapticsSupported()) {
    navigator.vibrate(0);
  }
};

/**
 * Haptic feedback for specific DJ actions
 */
export const haptics = {
  // Button and control interactions
  buttonPress: () => triggerHaptic('light'),
  buttonToggle: () => triggerHaptic('medium'),
  
  // Pad interactions
  padTrigger: () => triggerHaptic('medium'),
  padStop: () => triggerHaptic('light'),
  
  // Mixer actions
  crossfaderSnap: () => triggerHaptic('light'),
  knobAdjust: () => triggerHaptic([5]), // Very subtle
  
  // Navigation
  tabSwitch: () => triggerHaptic('light'),
  panelOpen: () => triggerHaptic('light'),
  panelClose: () => triggerHaptic('light'),
  
  // Track actions
  trackLoad: () => triggerHaptic('medium'),
  trackPlay: () => triggerHaptic('medium'),
  trackPause: () => triggerHaptic('light'),
  trackCue: () => triggerHaptic('heavy'),
  
  // Queue actions
  trackQueued: () => triggerHaptic('light'),
  trackRemoved: () => triggerHaptic('light'),
  
  // Effects
  effectEnabled: () => triggerHaptic('medium'),
  effectDisabled: () => triggerHaptic('light'),
  
  // Auto DJ
  autoDjEnabled: () => triggerHaptic('success'),
  autoDjDisabled: () => triggerHaptic('light'),
  autoDjMixStarting: () => triggerHaptic([30, 50, 30]),
  
  // Notifications
  success: () => triggerHaptic('success'),
  error: () => triggerHaptic('error'),
  warning: () => triggerHaptic([40, 50, 40]),
  
  // Cancel all
  cancel: () => cancelHaptic()
};
