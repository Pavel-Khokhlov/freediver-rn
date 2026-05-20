import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';

interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  width?: number;
  height?: number;
  trackColor?: string;
  thumbColor?: string;
  onChange?: (value: number) => void;
}

const CustomSlider = ({
  min = 0,
  max = 100,
  step = 1,
  value = 0,
  width = 300,
  height = 30,
  trackColor = '#e0e0e0',
  thumbColor = '#6200ee',
  onChange,
}: SliderProps) => {
  const thumbSize = 20;
  const trackHeight = 4;
  const trackLength = width - thumbSize;

  const thumbPosition = useSharedValue(0);
  const startPosition = useSharedValue(0); // Добавляем для хранения начальной позиции

  // Сохраняем параметры для доступа в worklet
  const minRef = React.useRef(min);
  const maxRef = React.useRef(max);
  const stepRef = React.useRef(step);
  const trackLengthRef = React.useRef(trackLength);
  const onChangeRef = React.useRef(onChange);

  React.useEffect(() => {
    minRef.current = min;
    maxRef.current = max;
    stepRef.current = step;
    trackLengthRef.current = trackLength;
    onChangeRef.current = onChange;
  }, [min, max, step, trackLength, onChange]);

  // Инициализация позиции
  React.useEffect(() => {
    const initialPosition = ((value - min) / (max - min)) * trackLength;
    thumbPosition.value = Math.min(Math.max(initialPosition, 0), trackLength);
  }, [value, min, max, trackLength, thumbPosition]);

  // Worklet-функция для преобразования позиции в значение
  const positionToValue = (position: number) => {
    'worklet';
    const rawValue =
      (position / trackLengthRef.current) * (maxRef.current - minRef.current) +
      minRef.current;
    const steppedValue =
      Math.round(rawValue / stepRef.current) * stepRef.current;
    return Math.min(Math.max(steppedValue, minRef.current), maxRef.current);
  };

  // Обработка жеста
  const panGesture = Gesture.Pan()
    .onStart(() => {
      // Запоминаем позицию в момент начала касания
      startPosition.value = thumbPosition.value;
    })
    .onUpdate(event => {
      // Вычисляем новую позицию: стартовая позиция + смещение
      let newPosition = startPosition.value + event.translationX;
      newPosition = Math.min(Math.max(newPosition, 0), trackLengthRef.current);

      thumbPosition.value = newPosition;

      const newValue = positionToValue(newPosition);
      if (onChangeRef.current) {
        runOnJS(onChangeRef.current)(newValue);
      }
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbPosition.value }],
  }));

  const activeTrackStyle = useAnimatedStyle(() => ({
    width: thumbPosition.value + thumbSize / 2,
  }));

  return (
    <GestureHandlerRootView style={styles.wrapper}>
      <View style={styles.content}>
        <View style={[styles.container, { width, height }]}>
          <View
            style={[
              styles.track,
              {
                height: trackHeight,
                backgroundColor: trackColor,
                width: trackLength + thumbSize,
              },
            ]}
          >
            <Animated.View
              style={[
                styles.activeTrack,
                {
                  height: trackHeight,
                  backgroundColor: thumbColor,
                },
                activeTrackStyle,
              ]}
            />
          </View>
          <GestureDetector gesture={panGesture}>
            <Animated.View
              style={[
                styles.thumb,
                {
                  width: thumbSize,
                  height: thumbSize,
                  borderRadius: thumbSize / 2,
                  backgroundColor: thumbColor,
                },
                thumbStyle,
              ]}
            />
          </GestureDetector>
        </View>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    justifyContent: 'center',
  },
  track: {
    position: 'absolute',
    borderRadius: 2,
    overflow: 'hidden',
  },
  activeTrack: {
    position: 'absolute',
    left: 0,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default CustomSlider;
