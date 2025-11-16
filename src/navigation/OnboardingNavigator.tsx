import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {
  SplashScreen,
  OnboardingWelcomeScreen,
  OnboardingTrackScreen,
  OnboardingStreaksScreen,
  PermissionNotificationScreen,
  WelcomeScreen,
  SignUpScreen,
  LoginScreen,
  PasswordResetScreen,
  HomeScreen,
} from '@/screens';

export type OnboardingStackParamList = {
  Splash: undefined;
  OnboardingWelcome: undefined;
  OnboardingTrack: undefined;
  OnboardingStreaks: undefined;
  PermissionNotification: undefined;
  Welcome: undefined;
  SignUp: undefined;
  Login: undefined;
  PasswordReset: undefined;
  Home: undefined;
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
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="PasswordReset" component={PasswordResetScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
};

export default OnboardingNavigator;
