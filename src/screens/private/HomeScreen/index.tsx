import React from 'react';
import { useTranslator } from '@/contexts/TranslatorContext';
import FullWidthBackgroundScrollView from '@/components/base/full-background-scroll-view';
import MyTimer from '@/components/common/date-time/my-timer';

const HomeScreen = () => {
  const { t } = useTranslator();
  return (
    <FullWidthBackgroundScrollView
      title={t('mainTitle.squareBreath')}
      backgroundImage={require('@/assets/backgrounds/login.jpg')}
      overlayOpacity={0.6} // Adjust overlay darkness
      hasCustomHeader={true}
    >
        <MyTimer />
    </FullWidthBackgroundScrollView>
  );
};

export default HomeScreen;
