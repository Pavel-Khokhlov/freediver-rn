import React from 'react';
import { StyleSheet, View } from 'react-native';

export type DelimiterProps = {
  color: 'grey' | 'brand' | 'white';
  marginV?: number;
};

// by default marginVertical = 0, color = white
const Delimiter = ({ color, marginV = 10 }: DelimiterProps) => {
  const StylesGradient = {
    marginVertical: marginV,
    experimental_backgroundImage: `linear-gradient(90deg, rgba(255, 255, 255, 0), ${color}, rgba(255, 255, 255, 0))`,
  };
  return <View style={[styles.linearGradient, StylesGradient]} />;
};

export default Delimiter;

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
    height: 1,
    opacity: 0.5,
  },
});
