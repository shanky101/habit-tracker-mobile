import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { ThemeProvider } from './src/theme';
import { TemplateProvider } from './src/contexts/TemplateContext';
import { SubscriptionProvider } from './src/context/SubscriptionContext';
import { MascotProvider } from './src/context/MascotContext';
import { UserProvider } from './src/context/UserContext';
import OnboardingNavigator from './src/navigation/OnboardingNavigator';
import { initializeDatabase } from './src/data/database';

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  // Initialize database on mount
  useEffect(() => {
    initializeDatabase()
      .then(() => {
        console.log('[App] Database initialized successfully');
        setDbReady(true);
      })
      .catch((error) => {
        console.error('[App] Database initialization failed:', error);
        // Still set dbReady to true to allow app to load (will fail loudly if DB is needed)
        setDbReady(true);
      });
  }, []);

  if (!fontsLoaded || !dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <UserProvider>
            <SubscriptionProvider>
              <TemplateProvider>
                <MascotProvider>
                  <NavigationContainer>
                    <StatusBar style="auto" />
                    <OnboardingNavigator />
                  </NavigationContainer>
                </MascotProvider>
              </TemplateProvider>
            </SubscriptionProvider>
          </UserProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
