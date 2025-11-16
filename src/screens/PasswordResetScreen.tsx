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

type PasswordResetScreenNavigationProp = StackNavigationProp<any, 'PasswordReset'>;

const PasswordResetScreen: React.FC = () => {
  const navigation = useNavigation<PasswordResetScreenNavigationProp>();
  const { theme } = useTheme();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    general: '',
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    if (isSuccess) {
      Animated.spring(successAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    }
  }, [isSuccess, successAnim]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    // Reset errors
    setErrors({
      email: '',
      general: '',
    });

    let hasError = false;
    const newErrors = {
      email: '',
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

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    // Simulate API call
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Show success message
      setIsSuccess(true);
    } catch (error) {
      setErrors({
        ...newErrors,
        general: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  if (isSuccess) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Animated.View
          style={[
            styles.successContainer,
            {
              opacity: successAnim,
              transform: [
                {
                  scale: successAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Success Icon */}
          <View
            style={[
              styles.successIcon,
              { backgroundColor: theme.colors.successLight, borderColor: theme.colors.success },
            ]}
          >
            <Text style={[styles.successIconText, { color: theme.colors.success }]}>✓</Text>
          </View>

          {/* Success Message */}
          <Text
            style={[
              styles.successTitle,
              {
                color: theme.colors.text,
                fontFamily: theme.typography.fontFamilyDisplay,
                fontSize: theme.typography.fontSize2XL,
                fontWeight: theme.typography.fontWeightBold,
              },
            ]}
          >
            Check Your Email
          </Text>
          <Text
            style={[
              styles.successMessage,
              {
                color: theme.colors.textSecondary,
                fontFamily: theme.typography.fontFamilyBody,
                fontSize: theme.typography.fontSizeMD,
                lineHeight: theme.typography.lineHeightRelaxed,
              },
            ]}
          >
            We've sent password reset instructions to{' '}
            <Text style={[styles.emailHighlight, { color: theme.colors.text }]}>{email}</Text>
          </Text>

          {/* Back to Login Button */}
          <TouchableOpacity
            style={[
              styles.backToLoginButton,
              {
                backgroundColor: theme.colors.primary,
                shadowColor: theme.shadows.shadowMD.shadowColor,
                shadowOffset: theme.shadows.shadowMD.shadowOffset,
                shadowOpacity: theme.shadows.shadowMD.shadowOpacity,
                shadowRadius: theme.shadows.shadowMD.shadowRadius,
                elevation: theme.shadows.shadowMD.elevation,
              },
            ]}
            onPress={handleBackToLogin}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.backToLoginButtonText,
                {
                  color: theme.colors.white,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeMD,
                  fontWeight: theme.typography.fontWeightSemibold,
                },
              ]}
            >
              Back to Log In
            </Text>
          </TouchableOpacity>

          {/* Resend Link */}
          <Text
            style={[
              styles.resendText,
              {
                color: theme.colors.textSecondary,
                fontFamily: theme.typography.fontFamilyBody,
                fontSize: theme.typography.fontSizeSM,
              },
            ]}
          >
            Didn't receive the email?{' '}
            <Text
              style={[styles.resendLink, { color: theme.colors.primary }]}
              onPress={() => {
                setIsSuccess(false);
                setEmail('');
              }}
            >
              Try again
            </Text>
          </Text>
        </Animated.View>
      </View>
    );
  }

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
              Reset Password
            </Text>
            <Text
              style={[
                styles.subtitle,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeMD,
                  lineHeight: theme.typography.lineHeightRelaxed,
                },
              ]}
            >
              Enter your email address and we'll send you instructions to reset your password
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

            {/* Reset Button */}
            <TouchableOpacity
              style={[
                styles.resetButton,
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
              onPress={handleResetPassword}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <Text
                  style={[
                    styles.resetButtonText,
                    {
                      color: theme.colors.white,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeMD,
                      fontWeight: theme.typography.fontWeightSemibold,
                    },
                  ]}
                >
                  Send Reset Link
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
              Remember your password?{' '}
              <Text
                style={[styles.footerLink, { color: theme.colors.primary }]}
                onPress={handleBackToLogin}
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
    // styles from theme
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
  resetButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  resetButtonText: {
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
  successContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 120,
    alignItems: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successIconText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  successTitle: {
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  emailHighlight: {
    fontWeight: '600',
  },
  backToLoginButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  backToLoginButtonText: {
    // styles from theme
  },
  resendText: {
    textAlign: 'center',
  },
  resendLink: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default PasswordResetScreen;
