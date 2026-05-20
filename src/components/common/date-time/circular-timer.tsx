import { ThemedText } from '@/components/base/themed-text';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import PlayIcon from '@/assets/icons/play.svg';
import PauseIcon from '@/assets/icons/pause.svg';
import ButtonAnimated from '@/components/base/button-animated';
import { SquareBreathingProps, TimerStatus } from './my-timer';
import { useTranslator } from '@/contexts/TranslatorContext';

export interface CircularTimerProps {
  durationObj: SquareBreathingProps;
  colorActive: string;
  colorInActive?: string;
  timerState?: TimerStatus;
  onStateChange?: (state: TimerStatus) => void;
  onReset: () => void;
  onStop: () => void;
  onComplete: () => void;
}

const CircularTimer = ({
  durationObj,
  colorActive,
  colorInActive = '#e0e0e0',
  timerState = 'stopped',
  onStateChange,
  onReset,
  onStop,
  onComplete,
}: CircularTimerProps) => {
  const { t } = useTranslator();
  const { width } = useWindowDimensions();
  const [timeLeft, setTimeLeft] = useState(durationObj.time);
  const [internalIsActive, setInternalIsActive] = useState(false);
  const [internalIsPaused, setInternalIsPaused] = useState(false);

  // Используем внешнее состояние если оно передано, иначе внутреннее
  const isControlled = timerState !== undefined;

  const isPlaying = isControlled
    ? timerState === 'playing'
    : internalIsActive && !internalIsPaused;

  /* const isPaused = isControlled
    ? timerState === 'paused'
    : internalIsActive && internalIsPaused; */

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);
  const timeLeftRef = useRef(timeLeft);

  const size = (width - 90) / 2;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const StyleCentralButton = {
    width: (radius - strokeWidth * 1.5) * 2,
    height: (radius - strokeWidth * 1.5) * 2,
    borderRadius: '50%',
  };

  // Обновляем refs
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  // Очистка таймера
  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Завершение таймера
  const completeTimer = useCallback(() => {
    clearTimer();

    if (isControlled) {
      onStateChange?.('stopped');
    } else {
      setInternalIsActive(false);
      setInternalIsPaused(false);
    }

    onCompleteRef.current?.();
  }, [isControlled, onStateChange]);

  // Обновляем ref при изменении onComplete
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Основная логика таймера
  useEffect(() => {
    if (!isPlaying) {
      clearTimer();
      return;
    }

    if (timeLeftRef.current <= 0) {
      completeTimer();
      return;
    }

    clearTimer();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev: number) => {
        const newValue = prev - 1;

        if (newValue <= 0) {
          setTimeout(() => completeTimer(), 0);
          return 0;
        }

        return newValue;
      });
    }, 1000);

    return () => {
      clearTimer();
    };
  }, [isPlaying, completeTimer]);

  // Функция для старта/паузы
  const handleStartStopClick = () => {
    if (timeLeft <= 0) {
      handleReset();
      return;
    }

    if (isControlled) {
      // Используем внешнее управление
      if (timerState === 'playing') {
        onStateChange?.('paused');
      } else {
        onStateChange?.('playing');
      }
    } else {
      // Внутреннее управление
      if (!internalIsActive) {
        setInternalIsActive(true);
        setInternalIsPaused(false);
      } else if (!internalIsPaused) {
        setInternalIsPaused(true);
        onStop?.(); // Вызываем onStop при паузе
      } else {
        setInternalIsPaused(false);
      }
    }
  };

  // Функция для сброса таймера
  const handleReset = () => {
    clearTimer();

    if (isControlled) {
      onStateChange?.('stopped');
    } else {
      setInternalIsActive(false);
      setInternalIsPaused(false);
    }

    setTimeLeft(durationObj.time);
    onReset?.();
  };

  // Функция для остановки (отдельная кнопка)
  const handleStop = () => {
    clearTimer();

    if (isControlled) {
      onStateChange?.('stopped');
    } else {
      setInternalIsActive(false);
      setInternalIsPaused(false);
    }

    setTimeLeft(durationObj.time);
    onStop?.();
  };

  // Получаем иконку на основе состояния
  const renderIcon = () => {
    if (isPlaying) {
      return <PauseIcon width={25} height={25} />;
    }
    // Для paused или stopped показываем Play
    return <PlayIcon width={30} height={30} />;
  };

  const progress = (durationObj.time - timeLeft) / durationObj.time;
  const strokeDashoffset = circumference * (1 - progress);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <View style={styles.timerWrapper}>
      <View style={styles.leftWrapper}>
        <ThemedText type="defaultSemiBold" darkColor="rgba(255, 255, 255, 0.4)">
          {t(`hale.${durationObj.part}`)}
        </ThemedText>
        <ThemedText
          type="subtitle"
          style={styles.timerText}
          darkColor={colorInActive}
        >
          {formatTime(timeLeft)}
        </ThemedText>
        <View style={styles.activeArea}>
          <ButtonAnimated
            title={t('button.stop')}
            size="small"
            onPress={handleStop}
            disabled={timerState !== 'paused'}
          />
          <ButtonAnimated
            title={t('button.reset')}
            size="small"
            onPress={handleReset}
            disabled={
              timerState === 'stopped' ||
              timerState === 'initial' ||
              timerState === 'playing'
            }
          />
        </View>
      </View>
      <View style={styles.rightWrapper}>
        <Svg width={size} height={size}>
          {/* Фоновый круг (неактивный) */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colorInActive}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Активный круг с прогрессом */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colorActive}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90, ${size / 2}, ${size / 2})`}
          />
        </Svg>
        <TouchableOpacity
          onPress={handleStartStopClick}
          style={[styles.centralButton, StyleCentralButton]}
        >
          {renderIcon()}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  timerWrapper: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 30,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'stretch',
    padding: 5,
    marginBottom: 10,
  },
  leftWrapper: {
    flex: 1,
    padding: 10,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  rightWrapper: {
    position: 'relative',
    flexDirection: 'column',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: 'rgb(25,77,109)',
    borderRadius: 25,
    padding: 10,
  },
  timerText: {
    fontSize: 40,
    lineHeight: 50,
  },
  activeArea: {
    flexDirection: 'row',
    columnGap: 10,
  },
  centralButton: {
    position: 'absolute',
    alignSelf: 'center',
    padding: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(3, 3, 3, 1)',
    borderColor: 'rgba(0, 127, 255, 0.6)',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CircularTimer;
