import React, { useEffect, useMemo } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/base/themed-text';
import { useTranslator } from '@/contexts/TranslatorContext';
import FullWidthBackgroundScrollView from '@/components/base/full-background-scroll-view';
import VersionAppBlock from './VersionAppBlock';

const LoadingScreen = () => {
  const { t } = useTranslator();
  const opacityValue = useMemo(() => new Animated.Value(0.3), []);

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0.3,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
      opacityValue.removeAllListeners(); // Cleanup
    };
  }, [opacityValue]);

  return (
    <FullWidthBackgroundScrollView
          backgroundImage={require('@/assets/backgrounds/login.jpg')}
          overlayOpacity={0.6}
        >
      {/* <FiSave color={'white'} width={200} /> */}
      <Animated.Text style={[styles.loading, { opacity: opacityValue }]}>
        <ThemedText style={styles.text} type="subtitle">{t('mainTitle.loading')}</ThemedText>
      </Animated.Text>

      <VersionAppBlock style={styles.version} />
    </FullWidthBackgroundScrollView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: {
    width: '100%',
    marginTop: 200,
  },
  text: {
    textAlign: 'center'
  },
  version: {
    marginTop: 'auto',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
});

export default LoadingScreen;
