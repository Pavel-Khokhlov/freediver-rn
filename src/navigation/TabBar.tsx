import React, { useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { IconType } from 'rn-icons';
import { ThemedText } from '@/components/base/themed-text';
import { useTranslator } from '@/contexts/TranslatorContext';

import { FiHome, FiMenu, FiClock } from 'rn-icons/fi';
import { BsPersonBoundingBox } from "rn-icons/bs";
import { useStore } from '@/store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TabIcons: { [k: string]: IconType } = {
  Home: FiHome,
  Training: FiClock,
  Profile: BsPersonBoundingBox,
  More: FiMenu,
};

const TabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const { t } = useTranslator();
  const insets = useSafeAreaInsets();
  const { globalUIStore } = useStore();

  const [isHeightMeasured, setIsHeightMeasured] = useState<boolean>(false);

  const handleLayout = (event: {
    nativeEvent: { layout: { height: any } };
  }) => {
    const { height } = event.nativeEvent.layout;

    // Сохраняем высоту в сторе, если она изменилась
    if (globalUIStore.tabbarHeight !== height) {
      globalUIStore.setTabbarHeight(height);
      if (!isHeightMeasured) setIsHeightMeasured(true);
    }
  };

  const bottom = insets.bottom;

  return (
    <View style={[styles.wrapper, {bottom}]} onLayout={handleLayout}>
      <View style={styles.content}>
        {state.routes.map((route, index) => {
          const descriptor = descriptors[route.key];

          // Проверяем существование дескриптора
          if (!descriptor) return null;
          const { options } = descriptor;
          const label =
            options.tabBarLabel || options.title || t(`route.${route.name}`);
          const isFocused = state.index === index;
          const tabColor = isFocused
            ? 'rgba(255,255,255,1)'
            : 'rgba(255,255,255,0.4)';

          const RouteIcon = TabIcons[route.name];

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            let targetRouteName = route.name;
            if (
              Platform.OS === 'ios' &&
              index === state.routes.length - 1 &&
              route.state?.routes?.length
            ) {
              targetRouteName = route?.state?.routes[0]?.name || '';
            }

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(targetRouteName, { merge: true });
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              style={[styles.tabWrapper]}
              onPress={onPress}
              activeOpacity={0.8}
            >
              {RouteIcon && (
                <RouteIcon color={tabColor} width={30} height={30}/>
              )}
              <ThemedText style={[styles.tabTitle]} darkColor={tabColor}>
                {label as string}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default TabBar;

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    position: 'absolute',
    left: 0,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    margin: 20,
    backgroundColor: 'rgba(8, 49, 74, 0.3)',
    borderWidth: 0.2,
    borderColor: '',
    borderRadius: 30,
    overflow: 'hidden',
  },
  tabWrapper: {
    width: 70,
    height: 55,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 9,
  },
  tabTitle: {
    fontSize: 8,
    lineHeight: 12,
  },
});
