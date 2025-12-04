import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@/theme';
import { useScreenAnimation } from '@/hooks/useScreenAnimation';
import { useSubscription, formatPlanName, getPlanPrice, SubscriptionPlan } from '@/context/SubscriptionContext';
import {
  ArrowLeft,
  Check,
  Crown,
  RefreshCw,
  Infinity,
  Cloud,
  Sparkles,
  BarChart3,
  Upload,
  Palette,
  MessageCircle,
} from 'lucide-react-native';

type SubscriptionNavigationProp = StackNavigationProp<any, 'Subscription'>;

const SubscriptionScreen: React.FC = () => {
  const navigation = useNavigation<SubscriptionNavigationProp>();
  const { theme } = useTheme();
  const { fadeAnim, slideAnim } = useScreenAnimation();
  const { subscription, isLoading, upgradeToPremium, cancelSubscription, restorePurchases } = useSubscription();

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('yearly');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = async () => {
    setIsProcessing(true);
    const success = await upgradeToPremium(selectedPlan);
    setIsProcessing(false);

    if (success) {
      Alert.alert(
        'Welcome to Premium!',
        'You now have access to all premium features.',
        [{ text: 'Awesome!', onPress: () => navigation.goBack() }]
      );
    } else {
      Alert.alert('Error', 'Failed to process purchase. Please try again.');
    }
  };

  const handleRestore = async () => {
    setIsProcessing(true);
    const success = await restorePurchases();
    setIsProcessing(false);

    if (success) {
      Alert.alert('Success', 'Your purchases have been restored.');
    } else {
      Alert.alert('No Purchases Found', 'We couldn\'t find any previous purchases to restore.');
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel? You\'ll keep premium access until your current billing period ends.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: async () => {
            const success = await cancelSubscription();
            if (success) {
              // Open platform subscription management
              if (Platform.OS === 'ios') {
                Linking.openURL('https://apps.apple.com/account/subscriptions');
              } else {
                Linking.openURL('https://play.google.com/store/account/subscriptions');
              }
            }
          },
        },
      ]
    );
  };

  const handleManageSubscription = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('https://apps.apple.com/account/subscriptions');
    } else {
      Linking.openURL('https://play.google.com/store/account/subscriptions');
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderPlanCard = (plan: SubscriptionPlan, price: string, period: string, savings?: string) => {
    const isSelected = selectedPlan === plan;
    const isCurrentPlan = subscription.plan === plan && subscription.isPremium;

    return (
      <TouchableOpacity
        style={[
          styles.planCard,
          {
            backgroundColor: isSelected ? theme.colors.primaryLight + '20' : theme.colors.surface,
            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
        onPress={() => setSelectedPlan(plan)}
        activeOpacity={0.7}
        disabled={subscription.isPremium}
      >
        {savings && (
          <View style={[styles.savingsBadge, { backgroundColor: theme.colors.success }]}>
            <Text style={styles.savingsText}>{savings}</Text>
          </View>
        )}

        {isCurrentPlan && (
          <View style={[styles.currentBadge, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.currentText}>CURRENT</Text>
          </View>
        )}

        <View style={styles.planHeader}>
          <Text
            style={[
              styles.planName,
              {
                color: theme.colors.text,
                fontFamily: theme.typography.fontFamilyDisplayBold,
                fontSize: theme.typography.fontSizeLG,
              },
            ]}
          >
            {plan.charAt(0).toUpperCase() + plan.slice(1)}
          </Text>
          {isSelected && !subscription.isPremium && (
            <View style={[styles.checkmark, { backgroundColor: theme.colors.primary }]}>
              <Check size={14} color="#fff" strokeWidth={3} />
            </View>
          )}
        </View>

        <Text
          style={[
            styles.planPrice,
            {
              color: theme.colors.text,
              fontFamily: theme.typography.fontFamilyDisplayBold,
              fontSize: theme.typography.fontSize2XL,
            },
          ]}
        >
          {price}
        </Text>

        <Text
          style={[
            styles.planPeriod,
            {
              color: theme.colors.textSecondary,
              fontFamily: theme.typography.fontFamilyBody,
              fontSize: theme.typography.fontSizeXS,
            },
          ]}
        >
          {period}
        </Text>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading subscription...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
          <View style={styles.backIconContainer}>
            <ArrowLeft size={24} color={theme.colors.text} strokeWidth={2} />
          </View>
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
          Subscription
        </Text>
        <View style={styles.placeholder} />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Current Plan Status */}
          {subscription.isPremium ? (
            <View
              style={[
                styles.statusCard,
                {
                  backgroundColor: theme.colors.primaryLight + '20',
                  borderColor: theme.colors.primary,
                },
              ]}
            >
              <View style={styles.statusHeader}>
                <View style={styles.statusIconContainer}>
                  <Crown size={40} color={theme.colors.primary} strokeWidth={2} fill={theme.colors.primary} />
                </View>
                <View style={styles.statusInfo}>
                  <Text
                    style={[
                      styles.statusTitle,
                      {
                        color: theme.colors.primary,
                        fontFamily: theme.typography.fontFamilyDisplayBold,
                        fontSize: theme.typography.fontSizeLG,
                      },
                    ]}
                  >
                    {formatPlanName(subscription.plan)}
                  </Text>
                  <Text
                    style={[
                      styles.statusSubtitle,
                      {
                        color: theme.colors.textSecondary,
                        fontFamily: theme.typography.fontFamilyBody,
                        fontSize: theme.typography.fontSizeSM,
                      },
                    ]}
                  >
                    {subscription.plan === 'lifetime'
                      ? 'Lifetime access'
                      : `Renews on ${formatDate(subscription.expiresAt)}`}
                  </Text>
                </View>
              </View>

              <View style={styles.statusDetails}>
                <View style={styles.statusRow}>
                  <Text style={[styles.statusLabel, { color: theme.colors.textSecondary }]}>
                    Plan
                  </Text>
                  <Text style={[styles.statusValue, { color: theme.colors.text }]}>
                    {formatPlanName(subscription.plan)}
                  </Text>
                </View>
                <View style={styles.statusRow}>
                  <Text style={[styles.statusLabel, { color: theme.colors.textSecondary }]}>
                    Price
                  </Text>
                  <Text style={[styles.statusValue, { color: theme.colors.text }]}>
                    {getPlanPrice(subscription.plan)}
                  </Text>
                </View>
                <View style={styles.statusRow}>
                  <Text style={[styles.statusLabel, { color: theme.colors.textSecondary }]}>
                    Started
                  </Text>
                  <Text style={[styles.statusValue, { color: theme.colors.text }]}>
                    {formatDate(subscription.startedAt)}
                  </Text>
                </View>
                {subscription.plan !== 'lifetime' && (
                  <View style={styles.statusRow}>
                    <Text style={[styles.statusLabel, { color: theme.colors.textSecondary }]}>
                      Next billing
                    </Text>
                    <Text style={[styles.statusValue, { color: theme.colors.text }]}>
                      {formatDate(subscription.expiresAt)}
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={[styles.manageButton, { borderColor: theme.colors.primary }]}
                onPress={handleManageSubscription}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.manageButtonText,
                    {
                      color: theme.colors.primary,
                      fontFamily: theme.typography.fontFamilyBodySemibold,
                    },
                  ]}
                >
                  Manage via {Platform.OS === 'ios' ? 'App Store' : 'Google Play'}
                </Text>
              </TouchableOpacity>

              {subscription.plan !== 'lifetime' && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.cancelButtonText,
                      {
                        color: theme.colors.error,
                        fontFamily: theme.typography.fontFamilyBodyMedium,
                      },
                    ]}
                  >
                    Cancel Subscription
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              {/* Free Plan Banner */}
              <View
                style={[
                  styles.freeBanner,
                  {
                    backgroundColor: theme.colors.backgroundSecondary,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.freeBannerTitle,
                    {
                      color: theme.colors.text,
                      fontFamily: theme.typography.fontFamilyDisplayBold,
                      fontSize: theme.typography.fontSizeLG,
                    },
                  ]}
                >
                  You're on the Free Plan
                </Text>
                <Text
                  style={[
                    styles.freeBannerSubtitle,
                    {
                      color: theme.colors.textSecondary,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeSM,
                    },
                  ]}
                >
                  Upgrade to unlock all features
                </Text>
              </View>

              {/* Pricing Cards */}
              <View style={styles.plansContainer}>
                {renderPlanCard('monthly', '$4.99', 'Billed monthly')}
                {renderPlanCard('yearly', '$29.99', 'Billed annually', 'SAVE 50%')}
                {renderPlanCard('lifetime', '$49.99', 'One-time payment')}
              </View>

              {/* Features List */}
              <View
                style={[
                  styles.featuresCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.featuresTitle,
                    {
                      color: theme.colors.text,
                      fontFamily: theme.typography.fontFamilyDisplayBold,
                      fontSize: theme.typography.fontSizeMD,
                    },
                  ]}
                >
                  Premium Features
                </Text>

                {[
                  { IconComponent: Infinity, text: 'Unlimited habits' },
                  { IconComponent: Cloud, text: 'Cloud sync across devices' },
                  { IconComponent: Sparkles, text: 'AI-powered insights' },
                  { IconComponent: BarChart3, text: 'Advanced analytics' },
                  { IconComponent: Upload, text: 'Export to PDF' },
                  { IconComponent: Palette, text: 'Premium themes' },
                  { IconComponent: MessageCircle, text: 'Priority support' },
                ].map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <View style={styles.featureIconContainer}>
                      <feature.IconComponent size={18} color={theme.colors.primary} strokeWidth={2} />
                    </View>
                    <Text
                      style={[
                        styles.featureText,
                        {
                          color: theme.colors.text,
                          fontFamily: theme.typography.fontFamilyBody,
                          fontSize: theme.typography.fontSizeSM,
                        },
                      ]}
                    >
                      {feature.text}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Upgrade Button */}
              <TouchableOpacity
                style={[
                  styles.upgradeButton,
                  {
                    backgroundColor: theme.colors.primary,
                    opacity: isProcessing ? 0.7 : 1,
                  },
                ]}
                onPress={handleUpgrade}
                activeOpacity={0.8}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color={theme.colors.white} />
                ) : (
                  <Text
                    style={[
                      styles.upgradeButtonText,
                      {
                        color: theme.colors.white,
                        fontFamily: theme.typography.fontFamilyBodySemibold,
                        fontSize: theme.typography.fontSizeMD,
                      },
                    ]}
                  >
                    Upgrade Now
                  </Text>
                )}
              </TouchableOpacity>

              {/* Restore Purchases */}
              <TouchableOpacity
                style={styles.restoreButton}
                onPress={handleRestore}
                activeOpacity={0.7}
                disabled={isProcessing}
              >
                <Text
                  style={[
                    styles.restoreButtonText,
                    {
                      color: theme.colors.primary,
                      fontFamily: theme.typography.fontFamilyBodyMedium,
                      fontSize: theme.typography.fontSizeSM,
                    },
                  ]}
                >
                  Restore Purchases
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* FAQ Section */}
          <View style={styles.faqSection}>
            <Text
              style={[
                styles.faqTitle,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyDisplayBold,
                  fontSize: theme.typography.fontSizeMD,
                },
              ]}
            >
              Frequently Asked Questions
            </Text>

            {[
              { q: 'Can I cancel anytime?', a: 'Yes! You can cancel anytime. You\'ll keep premium access until your current billing period ends.' },
              { q: 'What happens when I cancel?', a: 'Your premium features will remain active until the end of your billing period. After that, you\'ll return to the free plan.' },
              { q: 'How do I get a refund?', a: 'Refunds are handled by Apple/Google. Contact their support within 14 days of purchase.' },
            ].map((faq, index) => (
              <View
                key={index}
                style={[
                  styles.faqItem,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.faqQuestion,
                    {
                      color: theme.colors.text,
                      fontFamily: theme.typography.fontFamilyBodySemibold,
                      fontSize: theme.typography.fontSizeSM,
                    },
                  ]}
                >
                  {faq.q}
                </Text>
                <Text
                  style={[
                    styles.faqAnswer,
                    {
                      color: theme.colors.textSecondary,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeXS,
                    },
                  ]}
                >
                  {faq.a}
                </Text>
              </View>
            ))}
          </View>

          <Text
            style={[
              styles.legalText,
              {
                color: theme.colors.textTertiary,
                fontFamily: theme.typography.fontFamilyBody,
                fontSize: 10,
              },
            ]}
          >
            Payment will be charged to your {Platform.OS === 'ios' ? 'Apple ID' : 'Google Play'} account.
            Subscription automatically renews unless cancelled at least 24 hours before the end of the current period.
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
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
  backIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100,
  },
  statusCard: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 20,
    marginBottom: 24,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusIconContainer: {
    marginRight: 14,
  },
  statusInfo: {},
  statusTitle: {},
  statusSubtitle: {
    marginTop: 4,
  },
  statusDetails: {
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  statusLabel: {
    fontSize: 14,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  manageButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  manageButtonText: {
    fontSize: 14,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelButtonText: {
    fontSize: 14,
  },
  freeBanner: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  freeBannerTitle: {},
  freeBannerSubtitle: {
    marginTop: 4,
  },
  plansContainer: {
    gap: 12,
    marginBottom: 24,
  },
  planCard: {
    borderRadius: 16,
    padding: 20,
    position: 'relative',
  },
  savingsBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  savingsText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  currentBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  currentText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {},
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planPrice: {},
  planPeriod: {
    marginTop: 4,
  },
  featuresCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 24,
  },
  featuresTitle: {
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIconContainer: {
    marginRight: 12,
  },
  featureText: {},
  upgradeButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  upgradeButtonText: {},
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 24,
  },
  restoreButtonText: {},
  faqSection: {
    marginBottom: 24,
  },
  faqTitle: {
    marginBottom: 16,
  },
  faqItem: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  faqQuestion: {
    marginBottom: 8,
  },
  faqAnswer: {
    lineHeight: 18,
  },
  legalText: {
    textAlign: 'center',
    lineHeight: 14,
  },
});

export default SubscriptionScreen;
