import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import WheelPicker from "react-native-wheel-picker-plus";

// Тип для элемента данных
interface PickerItem {
  label: string;
  value: number;
}

// Тип для события изменения
interface PickerChangeEvent {
  item: PickerItem;
  index: number;
}

interface TimePickerProps {
  onTimeChange: ({
    minute,
    second,
  }: {
    minute: number;
    second: number;
  }) => void;
  // Добавляем опциональные пропсы для времени по умолчанию
  defaultMinute?: number;
  defaultSecond?: number;
}

const TimePicker = ({
  onTimeChange,
  defaultMinute = 10,
  defaultSecond = 10,
}: TimePickerProps) => {
  // Генерация массивов значений
  const minutes = Array.from({ length: 60 }, (_, i) => ({
    label: i.toString().padStart(2, "0"),
    value: i,
  }));

  const seconds = Array.from({ length: 60 }, (_, i) => ({
    label: i.toString().padStart(2, "0"),
    value: i,
  }));

  const [selectedMinute, setSelectedMinute] = useState(defaultMinute);
  const [selectedSecond, setSelectedSecond] = useState(defaultSecond);

  const handleMinuteChange = ({ item }: PickerChangeEvent) => {
    setSelectedMinute(item.value);
    if (onTimeChange)
      onTimeChange({ minute: item.value, second: selectedSecond });
  };

  const handleSecondChange = ({ item }: PickerChangeEvent) => {
    setSelectedSecond(item.value);
    if (onTimeChange)
      onTimeChange({ minute: selectedMinute, second: item.value });
  };

  return (
    <View style={styles.container}>
      <WheelPicker
        data={minutes}
        value={selectedMinute}
        onValueChanged={handleMinuteChange}
        itemHeight={40}
        visibleItemCount={5}
        renderItem={({ item }) => (
          <Text style={styles.pickerText}>{item.label}</Text>
        )}
      />
      <Text style={styles.separator}>:</Text>
      <WheelPicker
        data={seconds}
        value={selectedSecond}
        onValueChanged={handleSecondChange}
        itemHeight={40}
        visibleItemCount={5}
        renderItem={({ item }) => (
          <Text style={styles.pickerText}>{item.label}</Text>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  pickerText: {
    color: "white",
    fontSize: 20,
  },
  separator: {
    color: "white",
    fontSize: 24,
    marginHorizontal: 20,
    marginBottom: 20,
  },
});

export default TimePicker;
