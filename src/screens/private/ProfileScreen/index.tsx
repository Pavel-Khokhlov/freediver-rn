import React from 'react';

// Components
import FullWidthBackgroundScrollView from '@/components/base/full-background-scroll-view';
import ProfileForm from '@/components/common/ProfileForm';
import { useRoute } from '@react-navigation/native';

const ProfileScreen = () => {
  const route = useRoute();

  return (
    <FullWidthBackgroundScrollView
      backgroundImage={require('@/assets/backgrounds/login.jpg')}
      overlayOpacity={0.6} // Adjust overlay darkness
    >
      <ProfileForm location={route.name}/>
    </FullWidthBackgroundScrollView>
  );
};

export default ProfileScreen;
