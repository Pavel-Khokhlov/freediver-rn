import FullWidthBackgroundScrollView from '@/components/base/full-background-scroll-view';
import {
  StyleSheet,
} from 'react-native';
import { ThemedText } from '@/components/base/themed-text';
import { ThemedView } from '@/components/base/themed-view';
import { useTranslator } from '@/contexts/TranslatorContext';
import ProfileForm from '@/components/common/ProfileForm';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function RegistrationScreen() {
  const {t} = useTranslator();
  const insets = useSafeAreaInsets();

  return (
    <FullWidthBackgroundScrollView
      backgroundImage={require('@/assets/backgrounds/profile.webp')}
      overlayOpacity={0.6}
      customTabbarHeight={insets.bottom || 30}
    >
      <ThemedView transparent={true} style={[styles.screenWrapper]}>
        <ThemedText type="title" style={styles.title}>
          {t('mainTitle.registration')}
        </ThemedText>
        <ProfileForm />
      </ThemedView>
    </FullWidthBackgroundScrollView>
  );
}

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
  },
});
