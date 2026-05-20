import { useState, useCallback, useRef, useEffect } from 'react';
import { Device } from 'react-native-ble-plx';
import base64 from 'base-64';

// UUID для Jumper пульсоксиметра
export const JUMPER_UUIDS = {
  SERVICE: 'cdeacb80-5235-4c07-8846-93a37ee6b86d',
  CHARACTERISTICS: {
    NOTIFY: 'cdeacb81-5235-4c07-8846-93a37ee6b86d', // READ + NOTIFY
    WRITE: 'cdeacb82-5235-4c07-8846-93a37ee6b86d', // WRITE_NO_RESP
  },
};

// Типы данных
export interface JumperData {
  spo2: number;
  pulseRate: number;
  pi: number;
  hasFinger: boolean;
  isStable: boolean;
  timestamp: Date;
}

export interface JumperState {
  isConnected: boolean;
  isMeasuring: boolean;
  hasFinger: boolean;
  currentData: JumperData | null;
  lastValidData: JumperData | null;
  error: string | null;
}

// Парсинг данных
const parseJumperData = (
  base64Value: string,
): Omit<JumperData, 'timestamp'> | null => {
  if (!base64Value) return null;

  try {
    const decoded = base64.decode(base64Value);
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i);
    }

    // Обрабатываем только стабильные измерения (флаг 129)
    if (bytes.length >= 4 && bytes[0] === 129) {
      // Уверены, что элементы существуют благодаря проверке length >= 4
      const pulseRate = bytes[1] as number; // или Number(bytes[1])
      const spo2 = bytes[2] as number;
      const pi = (bytes[3] as number) / 10;

      // Проверка наличия пальца
      const hasFinger = !(
        spo2 === 255 ||
        spo2 === 0 ||
        spo2 === 127 ||
        pulseRate === 255 ||
        pulseRate === 0 ||
        pulseRate === 127 ||
        (spo2 === 128 && pulseRate === 128)
      );

      // Проверка стабильности измерения
      const isInRange = (
        value: number | undefined,
        min: number,
        max: number,
      ): boolean => {
        return value !== undefined && value >= min && value <= max;
      };

      const isValidRange =
        isInRange(spo2, 40, 100) &&
        isInRange(pulseRate, 30, 200) &&
        isInRange(pi, 0.1, 20);

      const isStable = hasFinger && isValidRange;

      return {
        spo2,
        pulseRate,
        pi,
        hasFinger,
        isStable,
      };
    }

    return null;
  } catch (error) {
    console.error('Ошибка парсинга данных Jumper:', error);
    return null;
  }
};

// Хук для работы с Jumper пульсоксиметром
export const useJumperOximeter = (
  onLog?: (message: string, type?: string) => void,
  onDisconnect?: () => void,
) => {
  const [state, setState] = useState<JumperState>({
    isConnected: false,
    isMeasuring: false,
    hasFinger: false,
    currentData: null,
    lastValidData: null,
    error: null,
  });

  const monitorRef = useRef<any>(null);
  const deviceRef = useRef<Device | null>(null);
  const noFingerCounterRef = useRef(0);

  const addLog = useCallback(
    (message: string, type: string = 'info') => {
      if (onLog) {
        onLog(`[Jumper] ${message}`, type);
      }
      console.log(`[Jumper] ${message}`);
    },
    [onLog],
  );

  // Сброс состояния
  const resetState = useCallback(() => {
    setState({
      isConnected: false,
      isMeasuring: false,
      hasFinger: false,
      currentData: null,
      lastValidData: null,
      error: null,
    });
    noFingerCounterRef.current = 0;
    deviceRef.current = null;
    if (onDisconnect) onDisconnect();
  }, [onDisconnect]);

  // Поиск сервиса Jumper
  const findJumperService = useCallback(
    async (device: Device) => {
      try {
        const services = await device.services();
        return services.find(s => s.uuid === JUMPER_UUIDS.SERVICE);
      } catch (error) {
        addLog(`Ошибка поиска сервиса: ${error}`, 'error');
        return null;
      }
    },
    [addLog],
  );

  // Поиск характеристик
  const findCharacteristics = useCallback(
    async (service: any) => {
      try {
        const characteristics = await service.characteristics();
        const notifyChar = characteristics.find(
          (c: { uuid: string }) =>
            c.uuid === JUMPER_UUIDS.CHARACTERISTICS.NOTIFY,
        );
        const writeChar = characteristics.find(
          (c: { uuid: string }) =>
            c.uuid === JUMPER_UUIDS.CHARACTERISTICS.WRITE,
        );
        return { notifyChar, writeChar };
      } catch (error) {
        addLog(`Ошибка поиска характеристик: ${error}`, 'error');
        return { notifyChar: null, writeChar: null };
      }
    },
    [addLog],
  );

  // Отправка команды на устройство
  const sendCommand = useCallback(
    async (device: Device, command: string): Promise<boolean> => {
      try {
        const service = await findJumperService(device);
        if (!service) return false;

        const { writeChar } = await findCharacteristics(service);
        if (!writeChar) return false;

        const encodedCommand = base64.encode(command);
        await writeChar.writeWithResponse(encodedCommand);
        addLog(`Команда отправлена: ${command}`, 'success');
        return true;
      } catch (error) {
        addLog(`Ошибка отправки команды: ${error}`, 'error');
        return false;
      }
    },
    [findJumperService, findCharacteristics, addLog],
  );

  // Активация измерений
  const startMeasurement = useCallback(
    async (device: Device) => {
      addLog('Активация измерений...');
      setState(prev => ({ ...prev, isMeasuring: true, error: null }));

      // Некоторые устройства требуют отправки команды для начала передачи
      // Пробуем разные команды
      const commands = ['START', '01', '0100', '1'];
      for (const cmd of commands) {
        const success = await sendCommand(device, cmd);
        if (success) break;
      }
    },
    [sendCommand, addLog],
  );

  // Остановка измерений
  const stopMeasurement = useCallback(
    async (device: Device) => {
      addLog('Остановка измерений...');
      setState(prev => ({ ...prev, isMeasuring: false }));

      const commands = ['STOP', '00', '0000', '0'];
      for (const cmd of commands) {
        await sendCommand(device, cmd);
      }
    },
    [sendCommand, addLog],
  );

  // Настройка мониторинга данных
  const setupMonitoring = useCallback(
    async (device: Device) => {
      try {
        const service = await findJumperService(device);
        if (!service) {
          throw new Error('Сервис Jumper не найден');
        }

        const { notifyChar } = await findCharacteristics(service);
        if (!notifyChar || !notifyChar.isNotifiable) {
          throw new Error('Характеристика уведомлений не найдена');
        }

        addLog('Настройка мониторинга данных...', 'info');

        // Отписываемся от старых уведомлений
        if (monitorRef.current) {
          await monitorRef.current.remove();
          monitorRef.current = null;
        }

        // Подписываемся на новые уведомления
        await notifyChar.monitor(
          (error: { message: any }, characteristic: { value: string }) => {
            if (error) {
              // Проверяем, есть ли еще ссылка на устройство
              if (!deviceRef.current) return;

              const errorMsg = error.message || '';
              if (
                errorMsg.includes('disconnected') ||
                errorMsg.includes('Device was disconnected')
              ) {
                resetState(); // Здесь deviceRef.current станет null
              }
              return;
            }

            if (characteristic?.value) {
              const parsedData = parseJumperData(characteristic.value);

              if (parsedData) {
                const newData: JumperData = {
                  ...parsedData,
                  timestamp: new Date(),
                };

                setState(prev => {
                  const newState = {
                    ...prev,
                    currentData: newData,
                    hasFinger: parsedData.hasFinger && parsedData.isStable,
                  };

                  // Сохраняем последние валидные данные
                  if (parsedData.hasFinger && parsedData.isStable) {
                    newState.lastValidData = newData;
                    noFingerCounterRef.current = 0;
                  }

                  return newState;
                });

                // Логируем данные
                if (parsedData.hasFinger && parsedData.isStable) {
                  addLog(
                    `🩸 SpO₂: ${parsedData.spo2}% | ❤️ Пульс: ${
                      parsedData.pulseRate
                    } BPM | 📊 PI: ${parsedData.pi.toFixed(1)}%`,
                    'data',
                  );
                } else if (parsedData.hasFinger && !parsedData.isStable) {
                  addLog(`⏳ Стабилизация данных...`, 'info');
                } else if (!parsedData.hasFinger) {
                  noFingerCounterRef.current++;
                  if (
                    noFingerCounterRef.current === 1 ||
                    noFingerCounterRef.current % 20 === 0
                  ) {
                    addLog(`🚫 Вставьте палец в пульсоксиметр`, 'warn');
                  }
                }
              }
            }
          },
        );

        monitorRef.current = notifyChar;
        setState(prev => ({ ...prev, isConnected: true, error: null }));
        addLog('✅ Мониторинг данных настроен', 'success');
        addLog(
          '💡 Вставьте палец в пульсоксиметр для начала измерения',
          'info',
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        addLog(`❌ Ошибка настройки мониторинга: ${errorMessage}`, 'error');
        setState(prev => ({
          ...prev,
          error: errorMessage,
          isConnected: false,
        }));
      }
    },
    [findJumperService, findCharacteristics, addLog, resetState],
  );

  // Остановка мониторинга
  const stopMonitoring = useCallback(async () => {
    addLog('Остановка мониторинга...');

    if (monitorRef.current) {
      try {
        await monitorRef.current.remove();
      } catch (error) {
        addLog(`Ошибка остановки мониторинга: ${error}`, 'error');
      }
      monitorRef.current = null;
    }

    resetState();
    addLog('✅ Мониторинг остановлен', 'success');
  }, [addLog, resetState]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (monitorRef.current) {
        monitorRef.current.remove();
        monitorRef.current = null;
      }
    };
  }, []);

  // Получение форматированных данных для отображения
  const getDisplayData = useCallback(() => {
    const data = state.currentData || state.lastValidData;

    if (!data) {
      return {
        spo2: '---',
        pulseRate: '---',
        pi: '---',
        status: state.hasFinger ? 'Измерение...' : 'Вставьте палец',
      };
    }

    return {
      spo2: data.spo2.toString(),
      pulseRate: data.pulseRate.toString(),
      pi: data.pi.toFixed(1),
      status: state.hasFinger ? '✅ Измерение' : '🟡 Ожидание',
    };
  }, [state.currentData, state.lastValidData, state.hasFinger]);

  return {
    // Состояние
    ...state,
    displayData: getDisplayData(),

    // Методы
    setupMonitoring,
    stopMonitoring,
    sendCommand,
    startMeasurement,
    stopMeasurement,

    // Утилиты
    isJumperDevice: (device: Device) =>
      device.id?.includes('Jumper') ||
      device.name?.includes('Jumper') ||
      device.name?.includes('Oximeter'),
  };
};
