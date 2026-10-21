import { t } from "../../features/preferences/translation-runtime";
import { useEffect, useRef, useState } from 'react';
import {
  Animated, I18nManager, Platform, Pressable, StyleSheet, Text, View,
  useColorScheme, useWindowDimensions,
} from 'react-native';
import { GlassMaterial } from '../glass/LeftGlass';
import { SymbolView } from 'expo-symbols';
import type { FooterDestination } from '../../app/leftConfig';
import { LeftIcon } from '../icons';
import { navigationColors } from '../theme/navigation';
import { TAB_DESTINATIONS, getTabBarGeometry } from './tab-bar-model';
import { useNavigationAccessibility } from './use-navigation-accessibility';

/** Uses the existing navigation callbacks; no router or screen ownership lives here. */
export function LiquidGlassTabBar({ activeDestination, onNavigate }: {
  activeDestination: FooterDestination;
  onNavigate: (destination: FooterDestination) => void;
}) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = navigationColors[scheme];
  const { fontScale } = useWindowDimensions();
  const { reduceTransparency, reduceMotion } = useNavigationAccessibility();
  const [width, setWidth] = useState(0);
  const geometry = getTabBarGeometry(width, fontScale, I18nManager.isRTL);
  const selected = Math.max(0, TAB_DESTINATIONS.findIndex(item => item.key === activeDestination));
  const translateX = useRef(new Animated.Value(selected)).current;
  useEffect(() => {
    translateX.stopAnimation();
    if (reduceMotion) {
      translateX.setValue(selected);
      return;
    }
    const animation = Animated.spring(translateX, {
      toValue: selected, useNativeDriver: true, tension: 190, friction: 24,
      overshootClamping: true,
    });
    animation.start();
    return () => animation.stop();
  }, [selected, reduceMotion, translateX]);

  return (
    <View
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
      style={[s.bar, { height: geometry.height, shadowColor: colors.shadow }]}
    >
      <GlassMaterial pointerEvents="none" reduceTransparency={reduceTransparency}
        fallbackColor={colors.surface} blurFallback colorScheme={scheme}
        style={[StyleSheet.absoluteFill, s.capsule]} />
      {width > 0 ? (
        <Animated.View pointerEvents="none" style={[s.selection, {
          width: geometry.slotWidth,
          transform: [{ translateX: translateX.interpolate({ inputRange: [0, 1, 2, 3], outputRange: geometry.positions }) }],
        }]}>
          <GlassMaterial reduceTransparency={reduceTransparency} fallbackColor={colors.selection}
            glassEffectStyle="clear" colorScheme={scheme} tintColor={colors.selectionTint}
            isInteractive style={[StyleSheet.absoluteFill, s.capsule]} />
        </Animated.View>
      ) : null}
      <View style={s.items}>
        {TAB_DESTINATIONS.map(item => {
          const active = item.key === activeDestination;
          const color = active ? colors.active : colors.inactive;
          return (
            <Pressable key={item.key} accessibilityRole="tab" accessibilityLabel={t(item.label)}
              accessibilityState={{ selected: active }}
              onPress={() => onNavigate(item.key)}
              android_ripple={{ color: colors.selection, borderless: false }}
              style={s.item}>
              {({ pressed }) => (
                <View style={[s.itemContent, pressed && s.pressed]}>
                  {Platform.OS === 'ios' ? (
                    <SymbolView name={active ? item.selectedSymbol : item.symbol} size={23}
                      weight={active ? 'semibold' : 'regular'} tintColor={color} style={s.icon} />
                  ) : (
                    <LeftIcon name={item.icon} active={active} size={23} color={color} />
                  )}
                  <Text maxFontSizeMultiplier={1.5} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}
                    style={[s.label, { color: active ? colors.content : colors.inactive, fontWeight: active ? '600' : '500' }]}>{t(item.label)}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    alignSelf: 'center', width: '100%', maxWidth: 420,
    borderRadius: 999, backgroundColor: 'transparent',
    shadowOpacity: 0.1, shadowRadius: 18, shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  capsule: { borderRadius: 999 },
  selection: { position: 'absolute', left: 0, top: 6, bottom: 6 },
  items: { flex: 1, flexDirection: 'row', padding: 6 },
  item: { flex: 1, minHeight: 44, minWidth: 44, borderRadius: 999, justifyContent: 'center' },
  itemContent: { alignItems: 'center', justifyContent: 'center', gap: 3 },
  pressed: { opacity: 0.65 },
  icon: { width: 25, height: 25 },
  label: { width: '100%', fontSize: 11, lineHeight: 14, textAlign: 'center' },
});
