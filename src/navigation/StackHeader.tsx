import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { StackHeaderProps, StackNavigationProp } from '@react-navigation/stack';
import { FiChevronLeft } from 'rn-icons/fi';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/base/themed-text';
import { useStore } from '@/store';
import Delimiter from '@/components/base/delimiter';

export interface StackHeaderBack {
  headerBackVisible?: boolean;
  canGoBack?: boolean;
}

type StackHeaderNavigationProps = {
  CreateList: undefined;
};

const StackHeader = ({
  options,
  headerBackVisible = true,
  canGoBack = true,
}: StackHeaderProps & StackHeaderBack) => {
  const insets = useSafeAreaInsets();
  const { globalUIStore } = useStore();
  const { title } = options;
  const navigation =
    useNavigation<StackNavigationProp<StackHeaderNavigationProps>>();

  // Локальное состояние для отслеживания первого измерения
  const [isHeightMeasured, setIsHeightMeasured] = useState<boolean>(false);

  const handleLayout = (event: {
    nativeEvent: { layout: { height: any } };
  }) => {
    const { height } = event.nativeEvent.layout;

    // Сохраняем высоту в сторе, если она изменилась
    if (globalUIStore.stackHeaderHeight !== height) {
      globalUIStore.setStackHeaderHeight(height);
      if (!isHeightMeasured) setIsHeightMeasured(true);
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

  const HeaderStyle = {
    marginTop: insets.top,
    paddingHorizontal: 20,
  };
  
  return (
    <View style={[HeaderStyle]} onLayout={handleLayout}>
      <View style={[styles.wrapper]}>
        <TouchableOpacity
          disabled={!canGoBack}
          style={styles.titleWrapper}
          onPress={goBack}
        >
          {headerBackVisible && (
            <FiChevronLeft
              size={30}
              color={'white'}
              style={styles.iconChevron}
            />
          )}
          <ThemedText type="subtitle">{title}</ThemedText>
        </TouchableOpacity>
      </View>
      <Delimiter marginV={5} color="white" />
    </View>
  );
};

// навигация не умеет работать с observer, только с чисто функциональными компонентами
export const createStackHeaderFunc = (props: StackHeaderBack) => {
  const comp = (p: StackHeaderProps & StackHeaderBack) => {
    const mergedProps = { ...p, ...props };
    return <StackHeader {...mergedProps} />;
  };
  comp.displayName = 'StackHeader';
  return comp;
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    marginLeft: 'auto',
  },
  iconChevron: {
    marginRight: 10,
  },
  icon: {
    padding: 15,
  },
});
