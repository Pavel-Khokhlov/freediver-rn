import { ThemedText } from '@/components/base/themed-text';
import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { View, StyleSheet, useWindowDimensions, Text } from 'react-native';
import CircularTimer from './circular-timer';
import { useFocusEffect } from '@react-navigation/native';
// import CustomSlider from '../CustomSlider';
import { useTranslator } from '@/contexts/TranslatorContext';
import Delimiter from '@/components/base/delimiter';
import { formatTime } from '@/helpers/time';
import ButtonAnimated from '@/components/base/button-animated';
import { Slider } from '@miblanchard/react-native-slider';

export type TimerStatus = 'playing' | 'paused' | 'stopped' | 'initial';

export interface SquareBreathingProps {
  id: number;
  part: string;
  time: number;
}

const INIT_PREPARE_TIME = 30;
const INIT_INHALE_TIME = 5;
const INIT_COUNT_LOOP = 20;

const MyTimer = () => {
  const { t } = useTranslator();
  const { width } = useWindowDimensions();
  const [timerState, setTimerState] = useState<TimerStatus>('stopped');

  const [resetKey, setResetKey] = useState(0); // Ключ для принудительного сброса

  const prepareValueRef = useRef<SquareBreathingProps>({
    id: 1009,
    part: 'prepare',
    time: 30,
  });

  const [value, setValue] = useState<number>(5);
  const countLoopRef = useRef<number>(INIT_COUNT_LOOP);

  const [currentBreath, setCurrentBreath] = useState<SquareBreathingProps>(
    prepareValueRef.current,
  );

  const [squareBreathingArr, setSquareBreathingArr] = useState<
    SquareBreathingProps[]
  >([
    { id: 10001, part: 'inhale', time: INIT_INHALE_TIME },
    { id: 10002, part: 'holding', time: INIT_INHALE_TIME },
    { id: 10003, part: 'exhale', time: INIT_INHALE_TIME },
    { id: 10004, part: 'holding', time: INIT_INHALE_TIME },
  ]);

  const [currentIndex, setCurrentIndex] = useState(-1);
  const isAutoPlayingRef = useRef(false);

  // Эффект для автоматического запуска следующего этапа
  useEffect(() => {
    if (timerState === 'playing' && isAutoPlayingRef.current) {
      // Следующий этап уже запущен автоматически
      isAutoPlayingRef.current = false;
    }
  }, [timerState]);

  const moveToNextBreath = useCallback(() => {
    if (currentIndex === -1) {
      const firstBreath = squareBreathingArr[0];
      if (firstBreath) {
        setCurrentIndex(0);
        setCurrentBreath(firstBreath);
        return true;
      }
      return false;
    } else if (currentIndex < squareBreathingArr.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextBreath = squareBreathingArr[nextIndex];
      if (nextBreath) {
        setCurrentIndex(nextIndex);
        setCurrentBreath(nextBreath);
        return true;
      }
    } else {
      // Завершили один полный цикл (4 дыхания)
      const remainingLoops = countLoopRef.current - 1;

      if (remainingLoops > 0 && squareBreathingArr[0]) {
        // Есть еще циклы - повторяем
        countLoopRef.current = remainingLoops;
        setCurrentIndex(0); // Начинаем сначала
        setCurrentBreath(squareBreathingArr[0]);
        return true;
      } else {
        // Все циклы завершены
        setCurrentIndex(-1);
        setCurrentBreath(prepareValueRef.current);
        setTimerState('stopped');
        return false;
      }
    }
    return true;
  }, [currentIndex, squareBreathingArr]);

  const handleComplete = useCallback(() => {
    const hasNext = moveToNextBreath();
    if (hasNext) {
      // Автоматически запускаем следующий этап
      isAutoPlayingRef.current = true;
      setTimerState('playing');
    }
  }, [moveToNextBreath]);

  const handleReset = useCallback(() => {
    setTimerState('initial');
    setCurrentIndex(-1);
    setCurrentBreath(prepareValueRef.current);
    setResetKey(prev => prev + 1);
  }, []);

  const handleStop = useCallback(() => {
    setTimerState('stopped');
  }, []);

  const handleStateChange = (newState: TimerStatus) => {
    setTimerState(newState);
  };

  const [sliderPrepareTime, setSliderPrepareTime] =
    useState<number>(INIT_PREPARE_TIME);
  const [sliderInhaleTime, setSliderInhaleTime] =
    useState<number>(INIT_INHALE_TIME);
  const [sliderCountLoop, setSliderCountLoop] =
    useState<number>(INIT_COUNT_LOOP);
  const [totalTime, setTotalTime] = useState<number>(430);

  const isTrainingChanged = useMemo(() => {
    return !(
      sliderPrepareTime === prepareValueRef.current.time &&
      sliderInhaleTime === squareBreathingArr[0]?.time &&
      sliderCountLoop === countLoopRef.current
    );
  }, [
    sliderPrepareTime,
    sliderInhaleTime,
    sliderCountLoop,
    squareBreathingArr,
  ]);

  const handleCancel = () => {
    setSliderPrepareTime(INIT_PREPARE_TIME);
    prepareValueRef.current.time = INIT_PREPARE_TIME;
    setSliderInhaleTime(INIT_INHALE_TIME);
    regenerateBreathingArray(INIT_INHALE_TIME);
    setSliderCountLoop(INIT_COUNT_LOOP);
    countLoopRef.current = INIT_COUNT_LOOP;
  };

  const regenerateBreathingArray = (value: number) => {
    setSquareBreathingArr(prevArr =>
      prevArr.map(item => ({
        ...item,
        time: value,
      })),
    );
  };

  const handleApply = () => {
    prepareValueRef.current.time = sliderPrepareTime;
    countLoopRef.current = sliderCountLoop;
    setCurrentBreath({ ...currentBreath, time: sliderPrepareTime });
    regenerateBreathingArray(sliderInhaleTime);
  };

  useFocusEffect(
    useCallback(() => {
      setCurrentIndex(-1);
      setCurrentBreath(prepareValueRef.current);
      setTimerState('stopped');
      setResetKey(prev => prev + 1);
      const trainingTime =
        sliderPrepareTime + sliderInhaleTime * 4 * sliderCountLoop;
      setTotalTime(trainingTime);
    }, [sliderCountLoop, sliderInhaleTime, sliderPrepareTime]),
  );

  return (
    <View style={styles.wrapper}>
      <View style={styles.wrapperBreathing}>
        {squareBreathingArr.map((item: SquareBreathingProps) => {
          const isCurrent = currentBreath.id === item.id;
          const BreathItemStyle = {
            backgroundColor: isCurrent
              ? 'rgba(18, 55, 77, 1)'
              : 'rgba(0, 127, 255, 0)',
            borderColor: isCurrent
              ? 'rgba(10, 220, 248, 0.4)'
              : 'rgba(255, 255, 255, 0.2)',
          };
          return (
            <View key={item.id} style={[styles.breathItem, BreathItemStyle]}>
              <ThemedText type="small" style={styles.breathType}>
                {t(`hale.${item.part}`)}
              </ThemedText>
              <ThemedText style={styles.breathTime}>
                {item.time + ' sec'}
              </ThemedText>
            </View>
          );
        })}
      </View>

      {currentBreath && (
        <CircularTimer
          key={`${currentBreath.id}_${currentBreath.time}_${resetKey}`}
          durationObj={currentBreath}
          colorActive={'rgba(18, 55, 77, 1)'}
          colorInActive={'rgba(10, 220, 248, 1)'}
          timerState={timerState}
          onStateChange={handleStateChange}
          onReset={handleReset}
          onStop={handleStop}
          onComplete={handleComplete}
        />
      )}
      <ThemedText type="default" style={styles.breathDetails}>
        {'Детали тренировки'}
      </ThemedText>
      <Delimiter color="white" />
      <View style={styles.trainingTitle}>
        <ThemedText type="small" style={styles.breathType}>
          {'Время подготовки:'}
        </ThemedText>
        <ThemedText type="small" style={styles.breathValue}>
          {sliderPrepareTime + ' ' + t(`time.second`)}
        </ThemedText>
      </View>
      {/* <CustomSlider
        min={0}
        max={30}
        step={1}
        value={sliderPrepareTime}
        onChange={setSliderPrepareTime}
        width={width - 40}
        trackColor="rgba(255, 255, 255, 0.2)"
        thumbColor="rgba(65,105,225, 1)"
      /> */}
      <Slider
        value={sliderPrepareTime}
        onValueChange={newValue => {
          setSliderPrepareTime(newValue?.[0] ?? value);
        }}
        minimumValue={5}
        maximumValue={30}
        step={1}
        minimumTrackTintColor="rgba(65,105,225, 1)"
        maximumTrackTintColor="rgba(255, 255, 255, 0.2)"
        thumbTintColor="rgba(65,105,225, 1)"
      />
      <View style={styles.trainingTitle}>
        <ThemedText type="small" style={styles.breathType}>
          {'Время вдоха:'}
        </ThemedText>
        <ThemedText type="small" style={styles.breathValue}>
          {sliderInhaleTime + ' ' + t(`time.second`)}
        </ThemedText>
      </View>
      {/* <CustomSlider
        min={0}
        max={20}
        step={1}
        value={sliderInhaleTime}
        onChange={setSliderInhaleTime}
        width={width - 40}
        trackColor="rgba(255, 255, 255, 0.2)"
        thumbColor="rgba(65,105,225, 1)"
      /> */}
      <Slider
        value={sliderInhaleTime}
        onValueChange={newValue => {
          setSliderInhaleTime(newValue?.[0] ?? value);
        }}
        minimumValue={1}
        maximumValue={30}
        step={1}
        minimumTrackTintColor="rgba(65,105,225, 1)"
        maximumTrackTintColor="rgba(255, 255, 255, 0.2)"
        thumbTintColor="rgba(65,105,225, 1)"
      />
      <View style={styles.trainingTitle}>
        <ThemedText type="small" style={styles.breathType}>
          {'Количество циклов:'}
        </ThemedText>
        <ThemedText type="small" style={styles.breathValue}>
          {sliderCountLoop}
        </ThemedText>
      </View>
      {/* <CustomSlider
        min={0}
        max={100}
        step={1}
        value={sliderCountLoop}
        onChange={setSliderCountLoop}
        width={width - 40}
        trackColor="rgba(255, 255, 255, 0.2)"
        thumbColor="rgba(65,105,225, 1)"
      /> */}
      <Slider
        value={sliderCountLoop}
        onValueChange={newValue => {
          setSliderCountLoop(newValue?.[0] ?? value);
        }}
        minimumValue={1}
        maximumValue={100}
        step={1}
        minimumTrackTintColor="rgba(65,105,225, 1)"
        maximumTrackTintColor="rgba(255, 255, 255, 0.2)"
        thumbTintColor="rgba(65,105,225, 1)"
      />
      <View style={styles.trainingTitle}>
        <ThemedText type="small" style={styles.breathType}>
          {'Общее время'}
        </ThemedText>
        <ThemedText type="small" style={styles.breathValue}>
          {formatTime(totalTime, t)}
        </ThemedText>
      </View>
      <Delimiter marginV={15} color="white" />
      <View style={styles.trainingTitle}>
        <ButtonAnimated
          title={t('button.reset')}
          size="medium"
          variant="outline"
          onPress={handleCancel}
          disabled={!isTrainingChanged}
        />
        <ButtonAnimated
          title={t('button.apply')}
          size="medium"
          variant="submit"
          onPress={handleApply}
          disabled={!isTrainingChanged}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  wrapperBreathing: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  breathItem: {
    width: '23%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 3,
  },
  breathTime: {
    color: 'rgb(10, 220, 248)',
    fontWeight: 600,
    fontSize: 12,
    lineHeight: 12,
  },
  breathDetails: {
    width: '100%',
    textAlign: 'center',
  },
  trainingTitle: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
  },
  breathType: {
    color: 'white',
  },
  breathValue: {
    color: 'white',
    fontWeight: 600,
  },
  timer: {
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  timerText: {
    position: 'absolute',
    alignSelf: 'center',
    fontSize: 40,
    lineHeight: 50,
  },
  buttonIcon: {
    padding: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 127, 255, 0.2)',
    borderColor: 'rgba(0, 127, 255, 0.6)',
    borderWidth: 0.5,
  },
});

export default MyTimer;
