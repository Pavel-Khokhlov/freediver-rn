import {
  ScrollView,
  TextInput,
  View,
  StyleSheet,
  Platform,
  ViewStyle,
} from 'react-native';
import { ThemedText } from '../base/themed-text';
import ButtonAnimated from '../base/button-animated';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '@/store';
import { useTranslator } from '@/contexts/TranslatorContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { useEffect, useMemo, useRef, useState } from 'react';
import { UserProps } from '@/store/auth';

const INPUT_HEIGHT = 40;

type ScreenNavigationProps = {
  Login: undefined;
};

export interface ProfileFormProps {
  location?: string;
}

const ProfileForm = ({ location }: ProfileFormProps) => {
  const { authStore } = useStore();
  const { t } = useTranslator();
  const navigation =
    useNavigation<StackNavigationProp<ScreenNavigationProps>>();

  const scrollViewRef = useRef<ScrollView>(null);

  const isLogged = authStore.isLogged;

  // Формируем начальные данные
  const getInitialData = useMemo((): UserProps => {
    // Для режима редактирования используем переданные данные или данные пользователя
    if (isLogged) {
      return {
        name: authStore.user?.name || 'Freediver',
        birthDate: authStore.user?.birthDate || '',
        gender: authStore.user?.gender || 'male',
        timePB: authStore.user?.timePB || '',
        datePB: authStore.user?.datePB || '',
        created_at: authStore.user?.created_at || new Date(),
      };
    }

    // Для режима регистрации используем значения по умолчанию
    return {
      name: 'Freediver',
      birthDate: '',
      gender: 'male',
      timePB: '',
      datePB: '',
      created_at: new Date(),
    };
  }, [
    authStore.user?.birthDate,
    authStore.user?.datePB,
    authStore.user?.gender,
    authStore.user?.name,
    authStore.user?.timePB,
    authStore.user?.created_at,
    isLogged,
  ]);

  const initialData = getInitialData;
  // Form state
  const [formData, setFormData] = useState<UserProps>(initialData);

  useEffect(() => {
    if (isLogged && authStore.user) {
      setFormData({
        name: authStore.user.name || '',
        birthDate: authStore.user.birthDate || '',
        gender: authStore.user.gender || 'male',
        timePB: authStore.user.timePB || '',
        datePB: authStore.user.datePB || '',
        created_at: authStore.user.created_at || new Date(),
      });
    }
  }, [authStore.user, isLogged]);

  const handleInputChange = (field: string, value: string) => {
    let currentValue = value || '';

    if (field === 'timePB') {
      // Только цифры и двоеточие
      const validChars = /[0-9:]/g;
      let filtered = value
        .split('')
        .filter(char => char.match(validChars))
        .join('');

      // Дополнительная проверка: не более одного двоеточия
      const colonCount = (filtered.match(/:/g) || []).length;
      if (colonCount > 1) {
        // Оставляем только первое двоеточие
        const firstColon = filtered.indexOf(':');
        filtered =
          filtered.slice(0, firstColon + 1) +
          filtered.slice(firstColon + 1).replace(/:/g, '');
      }

      if (filtered.length > 5) {
        filtered = filtered.slice(0, 5);
      }

      if (filtered === '') {
        currentValue = '';
      } else {
        const prevValue = formData.timePB;
        const isDeleting = prevValue.length > filtered.length;

        if (isDeleting) {
          if (prevValue === '00:0' && filtered === '00:') {
            currentValue = '00:';
          } else if (filtered.length === 2) {
            currentValue = filtered.slice(0, -1);
          } else {
            currentValue = filtered;
          }
        } else {
          let cleanValue = filtered.replace(/:/g, '');

          if (cleanValue.length === 2) {
            currentValue = cleanValue + ':';
          } else if (cleanValue.length > 2) {
            let minutes = cleanValue.slice(0, 2);
            let seconds = cleanValue.slice(2, 4);
            currentValue = minutes + ':' + seconds;
            if (currentValue.length > 5) {
              currentValue = currentValue.slice(0, 5);
            }
          } else {
            currentValue = cleanValue;
          }
        }
      }
    }

    if (field === 'gender') {
      currentValue = value;
    }

    if (field === 'birthDate' || field === 'datePB') {
      // 1. Фильтруем только цифры и точки
      let filteredValue = value.replace(/[^0-9.]/g, '');

      // 2. Проверяем, что не более 2 точек
      const dotCount = (filteredValue.match(/\./g) || []).length;
      if (dotCount > 2) {
        // Оставляем только первые две точки
        const dotIndices: number[] = [];
        for (let i = 0; i < filteredValue.length; i++) {
          if (filteredValue[i] === '.') dotIndices.push(i);
        }
        if (dotIndices.length > 2) {
          filteredValue = filteredValue.slice(0, dotIndices[2]);
        }
      }

      // 3. Ограничиваем длину
      if (filteredValue.length > 10) {
        filteredValue = filteredValue.slice(0, 10);
      }

      // 4. Валидация формата: не может начинаться с точки
      if (filteredValue.startsWith('.')) {
        filteredValue = '';
      }

      // 5. Не может быть двух точек подряд
      if (filteredValue.includes('..')) {
        filteredValue = filteredValue.replace(/\.\./g, '.');
      }

      if (filteredValue === '') {
        currentValue = '';
      } else {
        const prevValue = formData[field];
        const isDeleting = prevValue.length > filteredValue.length;

        if (isDeleting) {
          if (prevValue === '00.0' && filteredValue === '00.') {
            currentValue = '00.';
          } else if (filteredValue.length === 2 || filteredValue.length === 5) {
            currentValue = filteredValue.slice(0, -1);
          } else {
            currentValue = filteredValue;
          }
        } else {
          if (filteredValue.length === 2 || filteredValue.length === 5) {
            currentValue = filteredValue + '.';
          } else {
            currentValue = filteredValue;
          }
        }
      }
    }

    setFormData(prev => ({ ...prev, [field]: currentValue }));
  };

  // Проверка, изменились ли данные
  const hasChanges = useMemo(() => {
    if (isLogged) {
      return JSON.stringify(formData) !== JSON.stringify(initialData);
    }
    return true;
  }, [formData, initialData, isLogged]);

  const handleFocus = (value: string) => {
    console.log('handleSubmit', value);
  };

  const handleCancel = () => {
    if (isLogged) {
      const originalData: UserProps = {
        name: authStore.user?.name || 'Freediver',
        birthDate: authStore.user?.birthDate || '',
        gender: authStore.user?.gender || 'male',
        timePB: authStore.user?.timePB || '',
        datePB: authStore.user?.datePB || '',
        created_at: authStore.user?.created_at || new Date(),
      };

      setFormData(originalData);
    } else {
      navigation.navigate('Login');
    }
  };

  const handleSubmit = async () => {
    try {
      if (isLogged) {
        // Обновление профиля
        await authStore.updateProfile(formData);
      } else {
        // Регистрация
        await authStore.login(formData);
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleRemoveUser = async () => {
    await authStore.removeUser();
  };

  const handleLogout = async () => {
    await authStore.logout();
  };

  const StyleButtonContainer: ViewStyle = {
    flexDirection: isLogged && location === 'ProfileMain' ? 'column' : 'row',
    justifyContent:
      isLogged && location === 'ProfileMain' ? 'flex-start' : 'space-between',
    marginBottom: isLogged && location === 'ProfileMain' ? 12 : 0,
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      showsVerticalScrollIndicator={false}
      style={styles.scrollWrapper}
      contentContainerStyle={styles.scrollContentContainer}
    >
      <View>
        <View style={styles.inputContainer}>
          <ThemedText style={styles.label}>{t('label.name')}</ThemedText>
          <TextInput
            style={[styles.input]}
            placeholder={t('placeholder.name')}
            placeholderTextColor="#999"
            keyboardType="default"
            value={formData.name}
            onChangeText={text => handleInputChange('name', text)}
            onFocus={() => handleFocus('name')}
          />
        </View>
        <View style={styles.inputContainer}>
          <ThemedText style={styles.label}>{t('label.birthday')}</ThemedText>
          <TextInput
            style={[styles.input]}
            placeholder={t('placeholder.date')}
            placeholderTextColor="#999"
            value={formData.birthDate}
            keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
            keyboardAppearance="dark"
            onChangeText={text => handleInputChange('birthDate', text)}
            onFocus={() => handleFocus('dateBD')}
            cursorColor={'#fff'}
          />
        </View>

        {/* Gender Selection */}
        <View style={styles.inputContainer}>
          <ThemedText style={styles.label}>{t('label.gender')}</ThemedText>
          <View style={styles.genderContainer}>
            {['male', 'female'].map(option => (
              <ButtonAnimated
                key={option}
                title={t(`gender.${option}`)}
                onPress={() => handleInputChange('gender', option)}
                variant={formData.gender === option ? 'primary' : 'secondary'}
                size="medium"
              />
            ))}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <ThemedText style={styles.label}>{t('label.pb')}</ThemedText>
          <View style={styles.genderContainer}>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input]}
                placeholder={t('placeholder.time')}
                placeholderTextColor="#999"
                value={formData.timePB}
                keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
                keyboardAppearance="dark"
                onChangeText={text => handleInputChange('timePB', text)}
                onFocus={() => handleFocus('timePB')}
                cursorColor={'#fff'}
              />
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input]}
                placeholder={t('placeholder.date')}
                placeholderTextColor="#999"
                value={formData.datePB}
                keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
                keyboardAppearance="dark"
                onChangeText={text => handleInputChange('datePB', text)}
                onFocus={() => handleFocus('datePB')}
                cursorColor={'#fff'}
              />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.spacer} />

      {/* Action Buttons */}
      <View style={[styles.buttonContainer, StyleButtonContainer]}>
        <View style={styles.buttonWrapper}>
          <ButtonAnimated
            title={t('button.cancel')}
            onPress={handleCancel}
            variant="outline"
            size="medium"
            disabled={!hasChanges}
          />
        </View>
        <View style={styles.buttonWrapper}>
          <ButtonAnimated
            title={t('button.save')}
            onPress={handleSubmit}
            variant="submit"
            size="medium"
            disabled={!hasChanges}
          />
        </View>
        {isLogged && location === 'ProfileMain' && (
          <>
            <ButtonAnimated
              title={t('button.remove')}
              onPress={handleRemoveUser}
              variant="danger"
              size="medium"
              fullWidth={true}
            />
            <ButtonAnimated
              title={t('button.logout')}
              onPress={handleLogout}
              variant="danger"
              size="medium"
              fullWidth={true}
            />
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default ProfileForm;

const styles = StyleSheet.create({
  dateBirth: {
    justifyContent: 'flex-start',
    paddingHorizontal: 14,
  },
  scrollWrapper: {
    flex: 1,
    width: '100%',
  },
  scrollContentContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  inputContainer: {
    marginBottom: 10,
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    boxSizing: 'border-box',
  },
  label: {
    fontSize: 12,
    fontWeight: '400',
    color: '#fff',
    opacity: 0.5,
  },
  input: {
    height: INPUT_HEIGHT,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    flexDirection: 'row',
    alignItems: 'center',
    boxSizing: 'border-box',
  },
  buttonDate: {
    height: INPUT_HEIGHT,
    fontSize: 16,
    lineHeight: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 14,
    color: 'rgba(255, 255, 255, 1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    flexDirection: 'column',
    justifyContent: 'center',
    zIndex: 10,
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
    lineHeight: INPUT_HEIGHT,
  },
  pickerDate: {
    marginLeft: 10,
  },
  pickerItem: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
  },
  dateWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    overflow: 'hidden',
  },
  dateText: {
    color: '#fff',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    zIndex: 10,
    boxSizing: 'border-box',
  },
  genderOption: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 5,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  genderOptionSelected: {
    backgroundColor: 'rgba(0, 127, 255, 0.3)',
    borderColor: 'rgba(0, 127, 255, 0.9)',
  },
  genderText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  genderTextSelected: {
    color: '#fff',
  },
  buttonContainer: {
    gap: 12,
    zIndex: 10,
  },
  buttonWrapper: { flex: 1 },
  spacer: {
    flex: 1, // Занимает все доступное пространство между полями и кнопками
  },
});
