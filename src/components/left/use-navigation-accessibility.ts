import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

type Preference = 'transparency' | 'motion';

/** Shared preference handling for glass surfaces and animated controls. */
function useAccessibilityPreference(preference: Preference, iosOnly = false) {
  const [reduced, setReduced] = useState(preference === 'transparency' && Platform.OS === 'web' ? false : true);
  useEffect(() => {
    if (Platform.OS === 'web' || (iosOnly && Platform.OS !== 'ios')) return;
    const query = preference === 'transparency'
      ? AccessibilityInfo.isReduceTransparencyEnabled
      : AccessibilityInfo.isReduceMotionEnabled;
    if (typeof query !== 'function') return;
    let active = true;
    let changed = false;
    const event = preference === 'transparency' ? 'reduceTransparencyChanged' : 'reduceMotionChanged';
    const subscription = AccessibilityInfo.addEventListener(event, value => {
      changed = true;
      setReduced(value);
    });
    void query().then(value => {
      if (active && !changed) setReduced(value);
    }).catch(() => { /* Keep the safe opaque/still default. */ });
    return () => { active = false; subscription.remove(); };
  }, [preference, iosOnly]);
  return reduced;
}

export function useReducedTransparency(iosOnly = false) {
  return useAccessibilityPreference('transparency', iosOnly);
}

export function useReducedMotion() {
  return useAccessibilityPreference('motion');
}

export function useNavigationAccessibility() {
  const reduceTransparency = useReducedTransparency(true);
  const reduceMotion = useReducedMotion();
  return { reduceTransparency, reduceMotion };
}
