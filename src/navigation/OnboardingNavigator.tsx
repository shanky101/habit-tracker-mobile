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
  AddHabitStep1Screen,
  AddHabitStep2Screen,
  AddHabitStep3Screen,
  EditHabitScreen,
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
  Home: { newHabit?: any } | undefined;
  AddHabitStep1: undefined;
  AddHabitStep2: { habitName: string };
  AddHabitStep3: { habitName: string; category: string; color: string };
  EditHabit: { habitId: string; habitData: any };
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
      <Stack.Screen name="AddHabitStep1" component={AddHabitStep1Screen} />
      <Stack.Screen name="AddHabitStep2" component={AddHabitStep2Screen} />
      <Stack.Screen name="AddHabitStep3" component={AddHabitStep3Screen} />
      <Stack.Screen name="EditHabit" component={EditHabitScreen} />
    </Stack.Navigator>
  );
};

export default OnboardingNavigator;
