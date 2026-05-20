import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslator } from '@/contexts/TranslatorContext';

// Components
import { ThemedText } from '@/components/base/themed-text';
import FullWidthBackgroundScrollView from '@/components/base/full-background-scroll-view';
// import { useNavigation } from '@react-navigation/native';
// import { StackNavigationProp } from '@react-navigation/stack';
// import { useStore } from 'app/store';

/* type HomeParamList = {
  Conference: undefined;
}; */

const MoreScreen = () => {
  const { t } = useTranslator();
  // const {globalUIStore} = useStore();
  //const navigation = useNavigation<StackNavigationProp<HomeParamList>>();

  const handleProfileClick = () => {
    console.log('Conference');
  };

  return (
    <FullWidthBackgroundScrollView
      backgroundImage={require('@/assets/backgrounds/login.jpg')}
      overlayOpacity={0.6} // Adjust overlay darkness
    >
      <TouchableOpacity
        style={styles.homeButton}
        activeOpacity={0.8}
        onPress={handleProfileClick}
      >
        <ThemedText style={styles.titleLayout}>{t('More')}</ThemedText>
      </TouchableOpacity>
    </FullWidthBackgroundScrollView>
  );
};

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  titleLayout: {
    width: '100%',
    textAlign: 'center',
    marginVertical: 40,
  },
  homeButton: {
    width: '100%',
    height: 200,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: 'white',
  },
});

export default MoreScreen;
