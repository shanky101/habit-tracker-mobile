import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@app-core/theme';
import { useScreenAnimation } from '@/hooks/useScreenAnimation';

type ChangePasswordNavigationProp = StackNavigationProp<any, 'ChangePassword'>;

const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation<ChangePasswordNavigationProp>();
  const { theme } = useTheme();
  const { fadeAnim, slideAnim } = useScreenAnimation();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const validatePassword = (password: string): string[] => {
    const issues: string[] = [];
    if (password.length < 8) issues.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) issues.push('One uppercase letter');
    if (!/[a-z]/.test(password)) issues.push('One lowercase letter');
    if (!/[0-9]/.test(password)) issues.push('One number');
    return issues;
  };

  const getPasswordStrength = (password: string): { level: string; color: string } => {
    const issues = validatePassword(password);
    if (issues.length === 0) return { level: 'Strong', color: theme.colors.success };
    if (issues.length <= 2) return { level: 'Medium', color: theme.colors.warning };
    return { level: 'Weak', color: theme.colors.error };
  };

  const handleChangePassword = async () => {
    const newErrors: typeof errors = {};

    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else {
      const passwordIssues = validatePassword(newPassword);
      if (passwordIssues.length > 0) {
        newErrors.newPassword = 'Password does not meet requirements';
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (currentPassword === newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Password Changed',
        'Your password has been successfully updated.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 1500);
  };

  const passwordRequirements = [
    { text: 'At least 8 characters', met: newPassword.length >= 8 },
    { text: 'One uppercase letter', met: /[A-Z]/.test(newPassword) },
    { text: 'One lowercase letter', met: /[a-z]/.test(newPassword) },
    { text: 'One number', met: /[0-9]/.test(newPassword) },
  ];

  const renderPasswordInput = (
    label: string,
    value: string,
    setValue: (value: string) => void,
    showPassword: boolean,
    setShowPassword: (show: boolean) => void,
    placeholder: string,
    error?: string,
    showStrength?: boolean
  ) => {
    const strength = showStrength && value ? getPasswordStrength(value) : null;

    return (
      <View style={styles.inputContainer}>
        <Text
          style={[
            styles.inputLabel,
            {
              color: theme.colors.text,
              fontFamily: theme.typography.fontFamilyBodyMedium,
              fontSize: theme.typography.fontSizeSM,
            },
          ]}
        >
          {label}
        </Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.backgroundSecondary,
                borderColor: error ? theme.colors.error : theme.colors.border,
                color: theme.colors.text,
                fontFamily: theme.typography.fontFamilyBody,
                fontSize: theme.typography.fontSizeMD,
              },
            ]}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.textSecondary}
            value={value}
            onChangeText={(text) => {
              setValue(text);
              if (error) {
                setErrors((prev) => ({ ...prev, [label.toLowerCase().replace(' ', '')]: undefined }));
              }
            }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
          >
            <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>
        </View>
        {error && (
          <Text
            style={[
              styles.errorText,
              {
                color: theme.colors.error,
                fontFamily: theme.typography.fontFamilyBody,
                fontSize: theme.typography.fontSizeXS,
              },
            ]}
          >
            {error}
          </Text>
        )}
        {strength && (
          <View style={styles.strengthContainer}>
            <View
              style={[
                styles.strengthBar,
                { backgroundColor: theme.colors.border },
              ]}
            >
              <View
                style={[
                  styles.strengthFill,
                  {
                    backgroundColor: strength.color,
                    width:
                      strength.level === 'Strong'
                        ? '100%'
                        : strength.level === 'Medium'
                        ? '66%'
                        : '33%',
                  },
                ]}
              />
            </View>
            <Text
              style={[
                styles.strengthText,
                {
                  color: strength.color,
                  fontFamily: theme.typography.fontFamilyBodyMedium,
                  fontSize: theme.typography.fontSizeXS,
                },
              ]}
            >
              {strength.level}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            borderBottomColor: theme.colors.border,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text
          style={[
            styles.headerTitle,
            {
              color: theme.colors.text,
              fontFamily: theme.typography.fontFamilyDisplayBold,
              fontSize: theme.typography.fontSizeXL,
            },
          ]}
        >
          Change Password
        </Text>
        <View style={styles.placeholder} />
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {/* Security Icon */}
            <View style={styles.iconContainer}>
              <View
                style={[
                  styles.iconBackground,
                  { backgroundColor: theme.colors.primary + '20' },
                ]}
              >
                <Text style={styles.securityIcon}>🔐</Text>
              </View>
              <Text
                style={[
                  styles.iconSubtitle,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeSM,
                  },
                ]}
              >
                Keep your account secure with a strong password
              </Text>
            </View>

            {/* Current Password */}
            {renderPasswordInput(
              'Current Password',
              currentPassword,
              setCurrentPassword,
              showCurrentPassword,
              setShowCurrentPassword,
              'Enter your current password',
              errors.currentPassword
            )}

            {/* New Password */}
            {renderPasswordInput(
              'New Password',
              newPassword,
              setNewPassword,
              showNewPassword,
              setShowNewPassword,
              'Enter a new password',
              errors.newPassword,
              true
            )}

            {/* Password Requirements */}
            {newPassword.length > 0 && (
              <View style={styles.requirementsContainer}>
                <Text
                  style={[
                    styles.requirementsTitle,
                    {
                      color: theme.colors.textSecondary,
                      fontFamily: theme.typography.fontFamilyBodyMedium,
                      fontSize: theme.typography.fontSizeXS,
                    },
                  ]}
                >
                  PASSWORD REQUIREMENTS
                </Text>
                {passwordRequirements.map((req, index) => (
                  <View key={index} style={styles.requirementRow}>
                    <Text style={styles.requirementIcon}>
                      {req.met ? '✓' : '○'}
                    </Text>
                    <Text
                      style={[
                        styles.requirementText,
                        {
                          color: req.met ? theme.colors.success : theme.colors.textSecondary,
                          fontFamily: theme.typography.fontFamilyBody,
                          fontSize: theme.typography.fontSizeXS,
                        },
                      ]}
                    >
                      {req.text}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Confirm Password */}
            {renderPasswordInput(
              'Confirm New Password',
              confirmPassword,
              setConfirmPassword,
              showConfirmPassword,
              setShowConfirmPassword,
              'Re-enter your new password',
              errors.confirmPassword
            )}

            {/* Match Indicator */}
            {confirmPassword.length > 0 && newPassword.length > 0 && (
              <View style={styles.matchContainer}>
                <Text style={styles.matchIcon}>
                  {newPassword === confirmPassword ? '✓' : '✕'}
                </Text>
                <Text
                  style={[
                    styles.matchText,
                    {
                      color:
                        newPassword === confirmPassword
                          ? theme.colors.success
                          : theme.colors.error,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeXS,
                    },
                  ]}
                >
                  {newPassword === confirmPassword
                    ? 'Passwords match'
                    : 'Passwords do not match'}
                </Text>
              </View>
            )}

            {/* Change Password Button */}
            <TouchableOpacity
              style={[
                styles.changeButton,
                {
                  backgroundColor: theme.colors.primary,
                  opacity: isLoading ? 0.7 : 1,
                },
              ]}
              onPress={handleChangePassword}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.changeButtonText,
                  {
                    color: theme.colors.white,
                    fontFamily: theme.typography.fontFamilyBodySemibold,
                    fontSize: theme.typography.fontSizeMD,
                  },
                ]}
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </Text>
            </TouchableOpacity>

            {/* Forgot Password Link */}
            <TouchableOpacity
              style={styles.forgotButton}
              onPress={() => navigation.navigate('PasswordReset')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.forgotText,
                  {
                    color: theme.colors.primary,
                    fontFamily: theme.typography.fontFamilyBodyMedium,
                    fontSize: theme.typography.fontSizeSM,
                  },
                ]}
              >
                Forgot your current password?
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 100,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  securityIcon: {
    fontSize: 36,
  },
  iconSubtitle: {
    textAlign: 'center',
    maxWidth: 280,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    marginBottom: 8,
  },
  passwordContainer: {
    position: 'relative',
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  eyeIcon: {
    fontSize: 18,
  },
  errorText: {
    marginTop: 6,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {},
  requirementsContainer: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  requirementsTitle: {
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requirementIcon: {
    fontSize: 12,
    marginRight: 8,
  },
  requirementText: {},
  matchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  matchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  matchText: {},
  changeButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  changeButtonText: {},
  forgotButton: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 8,
  },
  forgotText: {},
});

export default ChangePasswordScreen;
