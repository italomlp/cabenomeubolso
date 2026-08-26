import { AccessibilityInfo } from 'react-native';

/** Project-owned accessibility semantics adapter for screen announcements. */
export function announceForAccessibility(message: string): void {
  AccessibilityInfo.announceForAccessibility(message);
}
