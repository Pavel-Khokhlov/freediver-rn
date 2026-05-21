import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FullWidthBackgroundScrollView from '@components/base/full-background-scroll-view';
import { ThemedText } from '@components/base/themed-text';
import { ThemedView } from '@components/base/themed-view';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FiDelete } from 'rn-icons/fi';
import { useStore } from '@/store';
import { LangProps } from '@/store/auth';
import VersionAppBlock from '@/navigation/VersionAppBlock';

const PIN_LENGTH = 4;

type StartScreenNavigationProps = {
  Registration: { enteredPin: string };
  Home: undefined;
};

export default function LoginScreen() {
  const navigation =
    useNavigation<StackNavigationProp<StartScreenNavigationProps>>();
  const insets = useSafeAreaInsets();

  const { authStore } = useStore();

  const { width } = useWindowDimensions();
  const marginTop = insets.top + width * 0.1;

  const [pin, setPin] = useState('');

  // const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  // const [isAuthenticated, setIsAuthenticated] = useState(false);

  /* useEffect(() => {
    checkBiometricSupport();
  }, []); */

  // Проверка поддержки биометрии на устройстве
  /* const checkBiometricSupport = async () => {
    if (Platform.OS === "android") {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();

      setIsBiometricSupported(compatible && enrolled);

      if (!compatible) {
        Alert.alert(
          "Ошибка",
          "Ваше устройство не поддерживает сканер отпечатков пальцев",
        );
      } else if (!enrolled) {
        Alert.alert(
          "Настройка",
          "Добавьте отпечаток пальца в настройках устройства",
        );
      }
    }
  }; */

  // Аутентификация по отпечатку пальца
  /* const handleBiometricAuth = async () => {
    if (Platform.OS !== "android") {
      Alert.alert("Информация", "Функция доступна только на Android");
      return;
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Войдите с помощью отпечатка пальца",
        fallbackLabel: "Использовать пароль",
        cancelLabel: "Отмена",
        disableDeviceFallback: false,
      });

      if (result.success) {
        setIsAuthenticated(true);
        Alert.alert("Успех", "Вход выполнен успешно!");
        // Здесь можно добавить навигацию на главный экран приложения
        // navigation.replace('MainApp');
      } else {
        Alert.alert("Ошибка", "Не удалось распознать отпечаток пальца");
      }
    } catch (error) {
      console.error("Biometric authentication error:", error);
      Alert.alert("Ошибка", "Произошла ошибка при аутентификации");
    }
  }; */

  const verifyPin = async (enteredPin: string) => {
    // Здесь замените "1234" на вашу логику проверки PIN-кода
    if (enteredPin === '0000') {
      if (!authStore.user) {
        navigation.navigate('Registration', { enteredPin });
      } else {
        await authStore.login(authStore.user);
      }
      // Очистка PIN после успешного входа
      setPin('');
      /* } else if (enteredPin === '1397') {
      authStore
      navigation.navigate('Home');
      // Очистка PIN после успешного входа
      setPin(''); */
    } else {
      Alert.alert('Ошибка', 'Неверный PIN-код');
      setPin('');
    }
  };

  const handleDigitPress = (digit: string) => {
    if (pin.length < PIN_LENGTH) {
      const newPin = pin + digit;
      setPin(newPin);

      // Автоматическая проверка при вводе полного PIN-кода
      if (newPin.length === PIN_LENGTH) {
        verifyPin(newPin);
      }
    }
  };

  const handleLangPress = async (value: LangProps) => {
    await authStore.setAppLang(value);
  };

  const handleDeletePress = () => {
    setPin(pin.slice(0, -1));
  };

  // Рендер кружков для отображения PIN-кода
  const renderPinDots = () => {
    const dots = [];
    for (let i = 0; i < PIN_LENGTH; i++) {
      dots.push(
        <View key={i} style={styles.pinDot}>
          {i < pin.length && <View style={styles.pinDotFilled} />}
        </View>,
      );
    }
    return dots;
  };

  // Данные для клавиатуры: цифры + пустое место + 0 + удаление
  const keypadButtons = [
    { value: '1' },
    { value: '2' },
    { value: '3' },
    { value: '4' },
    { value: '5' },
    { value: '6' },
    { value: '7' },
    { value: '8' },
    { value: '9' },
    { value: 'globe', isLang: true },
    { value: '0' },
    { value: 'delete', isDelete: true },
  ];

  const paddingBottom = insets.bottom;

  return (
    <FullWidthBackgroundScrollView
      backgroundImage={require('@/assets/backgrounds/login.jpg')}
      overlayOpacity={0.6} // Adjust overlay darkness
      customTabbarHeight={insets.bottom}
    >
      <ThemedView
        transparent={true}
        style={[styles.screenWrapper, { marginTop, paddingBottom }]}
      >
        <ThemedText type="title" style={styles.title}>
          Be Freediver
        </ThemedText>

        {/* Отображение введенного PIN-кода (кружки) */}
        <View style={styles.pinContainer}>{renderPinDots()}</View>

        {/* Персональная цифровая клавиатура */}
        <ThemedView style={styles.keypadContainer} transparent={true}>
          {keypadButtons.map((btn, index) => {
            if (btn.isLang) {
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.keypadButton}
                  onPress={() =>
                    handleLangPress(authStore.appLang === 'ru' ? 'en' : 'ru')
                  }
                  activeOpacity={0.8}
                >
                  <ThemedText type="subtitle" style={styles.keypadButtonText}>
                    {authStore.appLang}
                  </ThemedText>
                  {/* <FiGlobe size={20} color="#fff" /> */}
                </TouchableOpacity>
              );
            }
            if (btn.isDelete) {
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.keypadButton}
                  onPress={handleDeletePress}
                  activeOpacity={0.8}
                >
                  <FiDelete size={22} color="#fff" />
                </TouchableOpacity>
              );
            }
            return (
              <TouchableOpacity
                key={index}
                style={styles.keypadButton}
                onPress={() => handleDigitPress(btn.value)}
                activeOpacity={0.8}
              >
                <ThemedText type="title">{btn.value}</ThemedText>
              </TouchableOpacity>
            );
          })}
        </ThemedView>
      </ThemedView>
      <View style={[styles.bottom, { bottom: paddingBottom }]}>
        <VersionAppBlock />
      </View>
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
  logoContainer: {
    marginBottom: 20,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.5)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 40,
  },
  // Контейнер с кружками для PIN-кода
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    gap: 20,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDotFilled: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(65,105,225, 1)',
  },
  // Кнопка биометрии
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginBottom: 30,
    gap: 10,
  },
  biometricButtonText: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: '600',
  },
  // Контейнер цифровой клавиатуры
  keypadContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
    gap: 10,
  },
  keypadButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  keypadButtonText: {
    textTransform: 'capitalize',
  },
  bottom: {
    position: 'absolute',
    marginHorizontal: 20,
    left: 0,
    width: '100%',
  },
});
