import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@/theme';
import { OnboardingStackParamList } from '@/navigation/OnboardingNavigator';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Footprints, Apple, Chrome } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

type OnboardingWelcomeScreenNavigationProp = StackNavigationProp<
  OnboardingStackParamList,
  'OnboardingWelcome'
>;

const OnboardingWelcomeScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingWelcomeScreenNavigationProp>();
  const { theme } = useTheme();

  const handleContinue = () => navigation.navigate('OnboardingTrack');

  return (
    <View style={styles.container}>
      {/* Massive Header Typography */}
      <SafeAreaView style={styles.headerContainer}>
        <Text style={[styles.massiveText, { color: theme.colors.white }]}>
          every
        </Text>
        <Text style={[styles.massiveText, { color: theme.colors.secondary }]}>
          step
        </Text>
        <Text style={[styles.massiveText, { color: theme.colors.white }]}>
          counts
        </Text>
      </SafeAreaView>

      {/* 3D Runner Illustration Placeholder */}
      <View style={styles.illustrationContainer}>
        {/* Placeholder for 3D Runner - Using a large icon for now */}
        <Footprints size={200} color={theme.colors.white} opacity={0.2} />
      </View>

      {/* Glassmorphic Bottom Sheet */}
      <BlurView
        intensity={30}
        tint="light"
        style={styles.glassSheet}
      >
        <View style={styles.sheetContent}>
          <Text style={[styles.sheetTitle, { color: theme.colors.black }]}>
            Start your journey today
          </Text>

          <TouchableOpacity
            style={[styles.socialButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleContinue}
          >
            <Text style={[styles.socialButtonText, { color: theme.colors.white }]}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    // Background is handled by BackgroundWrapper in App.tsx
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  massiveText: {
    fontSize: 80,
    fontFamily: 'Outfit_700Bold',
    lineHeight: 80,
    letterSpacing: -2,
    textTransform: 'lowercase',
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -50, // Pull up slightly into the text space
  },
  glassSheet: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  sheetContent: {
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // Fallback / Overlay color
  },
  sheetTitle: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  textButton: {
    padding: 10,
  },
  textButtonLabel: {
    fontSize: 17,
    color: '#007AFF', // System blue
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginBottom: 24,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 30, // Pill shape
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  socialIcon: {
    marginRight: 12,
  },
  socialButtonText: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#000',
  },
});

export default OnboardingWelcomeScreen;
