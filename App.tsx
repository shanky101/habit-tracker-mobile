import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from './src/theme';
import { HabitsProvider } from './src/contexts/HabitsContext';
import OnboardingNavigator from './src/navigation/OnboardingNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <HabitsProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <OnboardingNavigator />
          </NavigationContainer>
        </HabitsProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
