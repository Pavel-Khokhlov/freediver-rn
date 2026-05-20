// components/Button/ButtonAnimated.tsx
import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Animated,
  ViewStyle,
  TextStyle,
  StyleSheet,
  View,
} from 'react-native';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'submit' | 'secondary' | 'outline' | 'ghost' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  haptic?: boolean;
}

const ButtonAnimated: React.FC<ButtonProps> = ({
  title,
  onPress,
  size = 'medium',
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  haptic = true,
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handlePress = () => {
    if (haptic) {
      // You can add haptic feedback here
      // For expo: import * as Haptics from 'expo-haptics';
      // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const getSizeStyles = (): ViewStyle => {
    const sizes = {
      small: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
      },
      medium: {
        minHeight: 40,
        borderRadius: 10,
      },
      large: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        minHeight: 46,
        borderRadius: 12,
      },
    };
    return sizes[size];
  };

  const getVariantStyles = (): ViewStyle => {
    const variants = {
      primary: {
        experimental_backgroundImage: `linear-gradient(90deg, rgba(31, 37, 116, 0.6), rgba(44, 98, 174, 0.6))`,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 1,
      },
      submit: {
        experimental_backgroundImage:
          'linear-gradient(90deg, rgba(0, 128, 191, 0.4), rgba(50, 205, 50, 0.4))',
        borderColor: 'rgba(255, 255, 255, 0.4)',
        borderWidth: 1,
      },
      secondary: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.5)',
        borderWidth: 1,
      },
      outline: {
        experimental_backgroundImage: `linear-gradient(90deg, rgba(15, 15, 15, 0.5), rgba(51, 51, 51, 0.5), rgba(20, 20, 20, 0.5))`,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
      },
      ghost: { backgroundColor: 'transparent', borderWidth: 1 },
      danger: {
        experimental_backgroundImage: `linear-gradient(90deg, rgba(153, 0, 34, 0.5), rgba(0, 0, 0, 0.4), rgba(179, 0, 36, 0.4))`,
        // backgroundColor: 'rgba(220, 20, 60, 0.2)',
        borderColor: 'rgba(255, 255, 255, 0.5)',
        borderWidth: 1,
      },
    };
    return variants[variant];
  };

  const getTextColor = (): string => {
    const colors = {
      primary: '#ffffff',
      submit: '#ffffff',
      secondary: '#ffffff',
      outline: '#ffffff',
      ghost: '#6366f1',
      danger: '#ffffff',
    };
    return colors[variant];
  };

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleValue }] },
        fullWidth ? { width: '100%' } : { flex: 1 },
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}
        style={[
          styles.button,
          getSizeStyles(),
          getVariantStyles(),
          fullWidth && styles.fullWidth,
          disabled && styles.disabled,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={getTextColor()} size="small" />
        ) : (
          <View style={styles.contentContainer}>
            {icon && iconPosition === 'left' && (
              <View style={styles.iconLeft}>{icon}</View>
            )}
            <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
              {title}
            </Text>
            {icon && iconPosition === 'right' && (
              <View style={styles.iconRight}>{icon}</View>
            )}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.4,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ButtonAnimated;
