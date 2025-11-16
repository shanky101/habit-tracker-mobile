import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@/theme';

type SignUpScreenNavigationProp = StackNavigationProp<any, 'SignUp'>;

const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const { theme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    general: '',
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    return password.length >= 8;
  };

  const handleSignUp = async () => {
    // Reset errors
    setErrors({
      email: '',
      password: '',
      confirmPassword: '',
      general: '',
    });

    let hasError = false;
    const newErrors = {
      email: '',
      password: '',
      confirmPassword: '',
      general: '',
    };

    // Validate email
    if (!email) {
      newErrors.email = 'Email is required';
      hasError = true;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
      hasError = true;
    }

    // Validate password
    if (!password) {
      newErrors.password = 'Password is required';
      hasError = true;
    } else if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 8 characters';
      hasError = true;
    }

    // Validate confirm password
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      hasError = true;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    // Simulate API call
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Navigate to Home screen after successful sign up
      navigation.navigate('Home');
    } catch (error) {
      setErrors({
        ...newErrors,
        general: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>
                ← Back
              </Text>
            </TouchableOpacity>
            <Text
              style={[
                styles.title,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyDisplay,
                  fontSize: theme.typography.fontSize2XL,
                  fontWeight: theme.typography.fontWeightBold,
                },
              ]}
            >
              Create Account
            </Text>
            <Text
              style={[
                styles.subtitle,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeMD,
                },
              ]}
            >
              Join thousands building better habits
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text
                style={[
                  styles.label,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeSM,
                    fontWeight: theme.typography.fontWeightMedium,
                  },
                ]}
              >
                Email Address
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.backgroundSecondary,
                    borderColor: errors.email ? theme.colors.error : theme.colors.border,
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeMD,
                  },
                ]}
                placeholder="you@example.com"
                placeholderTextColor={theme.colors.textSecondary}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) {
                    setErrors({ ...errors, email: '' });
                  }
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              {errors.email ? (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.email}
                </Text>
              ) : null}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text
                style={[
                  styles.label,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeSM,
                    fontWeight: theme.typography.fontWeightMedium,
                  },
                ]}
              >
                Password
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.backgroundSecondary,
                    borderColor: errors.password ? theme.colors.error : theme.colors.border,
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeMD,
                  },
                ]}
                placeholder="At least 8 characters"
                placeholderTextColor={theme.colors.textSecondary}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) {
                    setErrors({ ...errors, password: '' });
                  }
                }}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              {errors.password ? (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.password}
                </Text>
              ) : null}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text
                style={[
                  styles.label,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeSM,
                    fontWeight: theme.typography.fontWeightMedium,
                  },
                ]}
              >
                Confirm Password
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.backgroundSecondary,
                    borderColor: errors.confirmPassword
                      ? theme.colors.error
                      : theme.colors.border,
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeMD,
                  },
                ]}
                placeholder="Re-enter your password"
                placeholderTextColor={theme.colors.textSecondary}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword) {
                    setErrors({ ...errors, confirmPassword: '' });
                  }
                }}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              {errors.confirmPassword ? (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.confirmPassword}
                </Text>
              ) : null}
            </View>

            {/* General Error */}
            {errors.general ? (
              <View
                style={[
                  styles.generalErrorContainer,
                  { backgroundColor: theme.colors.errorLight, borderColor: theme.colors.error },
                ]}
              >
                <Text style={[styles.generalErrorText, { color: theme.colors.error }]}>
                  {errors.general}
                </Text>
              </View>
            ) : null}

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[
                styles.signUpButton,
                {
                  backgroundColor: theme.colors.primary,
                  shadowColor: theme.shadows.shadowMD.shadowColor,
                  shadowOffset: theme.shadows.shadowMD.shadowOffset,
                  shadowOpacity: theme.shadows.shadowMD.shadowOpacity,
                  shadowRadius: theme.shadows.shadowMD.shadowRadius,
                  elevation: theme.shadows.shadowMD.elevation,
                },
                isLoading && { opacity: 0.7 },
              ]}
              onPress={handleSignUp}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <Text
                  style={[
                    styles.signUpButtonText,
                    {
                      color: theme.colors.white,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeMD,
                      fontWeight: theme.typography.fontWeightSemibold,
                    },
                  ]}
                >
                  Create Account
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text
              style={[
                styles.footerText,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeSM,
                },
              ]}
            >
              Already have an account?{' '}
              <Text
                style={[styles.footerLink, { color: theme.colors.primary }]}
                onPress={handleLogin}
              >
                Log In
              </Text>
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    lineHeight: 24,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  errorText: {
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  generalErrorContainer: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
  },
  generalErrorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  signUpButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  signUpButtonText: {
    // styles from theme
  },
  footer: {
    alignItems: 'center',
    paddingTop: 24,
  },
  footerText: {
    textAlign: 'center',
  },
  footerLink: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default SignUpScreen;
