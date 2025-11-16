import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {
  SplashScreen,
  OnboardingWelcomeScreen,
  OnboardingTrackScreen,
  OnboardingStreaksScreen,
  PermissionNotificationScreen,
} from '@/screens';

export type OnboardingStackParamList = {
  Splash: undefined;
  OnboardingWelcome: undefined;
  OnboardingTrack: undefined;
  OnboardingStreaks: undefined;
  PermissionNotification: undefined;
};

const Stack = createStackNavigator<OnboardingStackParamList>();

const OnboardingNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="OnboardingWelcome" component={OnboardingWelcomeScreen} />
      <Stack.Screen name="OnboardingTrack" component={OnboardingTrackScreen} />
      <Stack.Screen name="OnboardingStreaks" component={OnboardingStreaksScreen} />
      <Stack.Screen name="PermissionNotification" component={PermissionNotificationScreen} />
    </Stack.Navigator>
  );
};

export default OnboardingNavigator;
