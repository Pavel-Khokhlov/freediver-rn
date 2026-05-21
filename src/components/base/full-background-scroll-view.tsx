import { type PropsWithChildren } from 'react';
import { Image, StyleSheet, Dimensions, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
} from 'react-native-reanimated';

import { ThemedView } from '../base/themed-view';
import { ThemedText } from './themed-text';
import { useStore } from '@/store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type FullWidthBackgroundProps = PropsWithChildren<{
  title?: string;
  backgroundImage: any; // Image source (require, uri, etc.)
  overlayOpacity?: number; // Optional dark overlay
  customHeaderHeight?: number;
  customTabbarHeight?: number;
  hasCustomHeader?: boolean;
}>;

export default function FullWidthBackgroundScrollView({
  title,
  children,
  backgroundImage,
  overlayOpacity = 0.4,
  customHeaderHeight,
  customTabbarHeight,
  hasCustomHeader,
}: FullWidthBackgroundProps) {
  // const colorScheme = useColorScheme() ?? "light";
  const { globalUIStore, authStore } = useStore();
  const insets = useSafeAreaInsets();

  const isLogged = authStore.isLogged;

  // Проверяем имя экрана для определения типа хедера
  const getHeaderHeight = () => {
    if (customHeaderHeight) {
      return customHeaderHeight;
    }
    if (!isLogged) {
      return globalUIStore.stackHeaderHeight + insets.top + 10;
    }
    // Home таб имеет кастомный хедер
    if (hasCustomHeader) {
      return globalUIStore.appHeaderHeight + insets.top + 10;
    }

    return globalUIStore.stackHeaderHeight + insets.top + 10;
  };

  const getTabbarHeight = () => {
    if (customTabbarHeight) {
      return customTabbarHeight;
    }
    if (!isLogged) {
      return insets.bottom;
    }

    return globalUIStore.tabbarHeight + insets.bottom;
  };

  const HEADER_HEIGHT = getHeaderHeight();
  const TABBAR_HEIGHT = getTabbarHeight();

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(scrollRef);

  // Parallax effect for the background image
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 1, 0, HEADER_HEIGHT * 0.1],
          ),
        },
        {
          scale: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [1.5, 1, 1.2],
          ),
        },
      ],
    };
  });

  const paddingTop = HEADER_HEIGHT;
  const paddingBottom = TABBAR_HEIGHT;

  return (
    <Animated.ScrollView
      ref={scrollRef}
      style={styles.container}
      scrollEventThrottle={16}
      contentContainerStyle={styles.scrollContent}
      // Запрещаем overscroll эффекты
      overScrollMode="never"
      bounces={false}
      bouncesZoom={false}
      alwaysBounceVertical={false}
      showsVerticalScrollIndicator={true}
      // Ограничиваем скролл только вниз
      scrollEnabled={true}
      directionalLockEnabled={true}
    >
      {/* Full-width background image with parallax */}
      <Animated.View style={[styles.imageContainer, headerAnimatedStyle]}>
        <Image source={backgroundImage} style={[styles.backgroundImage]} />
        {/* Optional overlay for better text readability */}
        <View
          style={[
            styles.overlay,
            { backgroundColor: `rgba(0,0,0,${overlayOpacity})` },
          ]}
        />
      </Animated.View>

      {/* Content */}
      <ThemedView
        transparent={true}
        style={[styles.content, { paddingTop, paddingBottom }]}
      >
        {title && (
          <ThemedText style={styles.title} type="subtitle">
            {title}
          </ThemedText>
        )}
        {children}
      </ThemedView>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    paddingTop: 200,
  },
  backgroundImage: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    overflow: 'hidden',
    paddingHorizontal: 20,
  },
  title: {
    width: '100%',
    textAlign: 'center',
    paddingTop: 10,
    paddingBottom: 20,
  },
});
