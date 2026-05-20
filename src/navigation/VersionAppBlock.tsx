import React from 'react';
import {StyleSheet, View, ViewStyle} from 'react-native';
import packageJson from '../../package.json';
import { currentYear, STUDIO_NAME } from '@/constants/constants';
import { ThemedText } from '@/components/base/themed-text';

interface VersionAppBlockProps {
  style?: ViewStyle,
}

const VersionAppBlock = ({style}: VersionAppBlockProps) => {
  return (
    <View style={[styles.bottomBlock, style]}>
      <ThemedText type="small">
        {'@ ' + currentYear + STUDIO_NAME}
      </ThemedText>
      <ThemedText type="small">
        {'Version: ' + packageJson.version}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomBlock: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: "space-between",
    alignItems: 'center',
  },
});

export default VersionAppBlock;
