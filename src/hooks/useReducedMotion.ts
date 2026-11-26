import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Mengikuti preferensi "Reduce Motion" dari sistem operasi (Android/iOS/Web).
 * Aman dijalankan di lingkungan pengujian maupun platform yang belum mendukung event listener.
 */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    let mounted = true;

    if (typeof AccessibilityInfo?.isReduceMotionEnabled === 'function') {
      AccessibilityInfo.isReduceMotionEnabled()
        .then((enabled) => {
          if (mounted) setReducedMotion(Boolean(enabled));
        })
        .catch(() => {
          // Abaikan jika platform tidak mendukung query reduce motion
        });
    }

    const subscription =
      typeof AccessibilityInfo?.addEventListener === 'function'
        ? AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
            if (mounted) setReducedMotion(Boolean(enabled));
          })
        : null;

    return () => {
      mounted = false;
      subscription?.remove();
    };
  }, []);

  return reducedMotion;
}
