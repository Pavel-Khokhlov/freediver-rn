import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';
import { ThemedText } from '@components/base/themed-text';
// import { HEADER_LAYOUT, LAYOUT } from '@/styles/layout';
import { useStore } from '@/store';
// import { replaceWithStars } from 'app/helpers/numbers';
// import { StackNavigationProp } from '@react-navigation/stack';
// import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/base/themed-view';

import { FiEdit } from 'rn-icons/fi';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Delimiter from '@/components/base/delimiter';

type AppHeaderNavigationProps = {
  Profile: undefined;
};

const AppHeader = () => {
  const insets = useSafeAreaInsets();
  const { authStore, globalUIStore } = useStore();
  const navigation =
    useNavigation<StackNavigationProp<AppHeaderNavigationProps>>();
  // const nameMask = authStore!.user && authStore.user.username.slice(0, 2);

  // Локальное состояние для отслеживания первого измерения
  const [isHeightMeasured, setIsHeightMeasured] = useState<boolean>(false);

  const handleLayout = (event: {
    nativeEvent: { layout: { height: any } };
  }) => {
    const { height } = event.nativeEvent.layout;

    // Сохраняем высоту в сторе, если она изменилась
    if (globalUIStore.appHeaderHeight !== height) {
      globalUIStore.setAppHeaderHeight(height);
      if (!isHeightMeasured) setIsHeightMeasured(true);
    }
  };

  const handleProfileClick = () => {
    navigation.navigate('Profile'); 
  };

  const HeaderStyle = {
    marginTop: insets.top + 10,
    paddingHorizontal: 20,
  };

  /* const LogoStyle = {
    width: globalUIStore.getPercentWidth(18),
    height: globalUIStore.getPercentWidth(18),
    borderRadius: 50,
    marginRight: globalUIStore.getPercentHeight(2),
  }; */

  return (
    <View style={[HeaderStyle]} onLayout={handleLayout}>
      <TouchableOpacity
        style={[styles.wrapper]}
        activeOpacity={0.8}
        onPress={handleProfileClick}
      >
        {authStore.user ? (
          <View
            style={[
              styles.userLogo,
              {
                experimental_backgroundImage:
                  'linear-gradient(45deg, blue ,red)',
              },
            ]}
          >
            <ThemedText type="title">{'Fr'}</ThemedText>
          </View>
        ) : (
          <>
            {/* <Image source={{ uri: authStore.user?.avatar }} style={LogoStyle} /> */}
          </>
        )}
        <ThemedView style={[styles.userBlock]}>
          <ThemedText numberOfLines={1} type="subtitle">
            {authStore!.user && authStore.user.name}
          </ThemedText>
          <ThemedText type="default">
            {(authStore!.user && authStore.user.timePB) || '00:00 / PB'}
          </ThemedText>
        </ThemedView>
        <FiEdit color={'white'} size={25} />
      </TouchableOpacity>
      <Delimiter marginV={5} color="white" />
    </View>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
  },
  userBlock: {
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  userLogo: {
    width: 70,
    height: 70,
    borderRadius: '50%',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
