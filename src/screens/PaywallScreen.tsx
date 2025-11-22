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
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@/theme';
import { useScreenAnimation } from '@/hooks/useScreenAnimation';
import { useSubscription, SubscriptionPlan } from '@/context/SubscriptionContext';

const { width } = Dimensions.get('window');

type PaywallNavigationProp = StackNavigationProp<any, 'Paywall'>;
type PaywallRouteProp = RouteProp<
  { Paywall: { feature?: string; blocking?: boolean } },
  'Paywall'
>;

const PaywallScreen: React.FC = () => {
  const navigation = useNavigation<PaywallNavigationProp>();
  const route = useRoute<PaywallRouteProp>();
  const { theme } = useTheme();
  const { fadeAnim, slideAnim } = useScreenAnimation();
  const { upgradeToPremium, isLoading } = useSubscription();

  const feature = route.params?.feature || 'unlimited';
  const isBlocking = route.params?.blocking || false;

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('yearly');
  const [isProcessing, setIsProcessing] = useState(false);

  const headlines: Record<string, string> = {
    unlimited: 'Unlock Unlimited Habits',
    insights: 'Get AI-Powered Insights',
    sync: 'Sync Across All Devices',
    analytics: 'Advanced Analytics',
    export: 'Export Your Data',
  };

  const handlePurchase = async () => {
    setIsProcessing(true);
    const success = await upgradeToPremium(selectedPlan);
    setIsProcessing(false);

    if (success) {
      Alert.alert(
        'Welcome to Premium! 🎉',
        'You now have access to all premium features.',
        [{ text: 'Let\'s Go!', onPress: () => navigation.goBack() }]
      );
    } else {
      Alert.alert('Purchase Failed', 'Something went wrong. Please try again.');
    }
  };

  const handleDismiss = () => {
    if (isBlocking) {
      navigation.goBack();
    } else {
      navigation.goBack();
    }
  };

  const features = [
    { icon: '♾️', free: '5', premium: 'Unlimited', label: 'Habits' },
    { icon: '☁️', free: '✕', premium: '✓', label: 'Cloud Sync' },
    { icon: '✨', free: '✕', premium: '✓', label: 'AI Insights' },
    { icon: '📊', free: 'Basic', premium: 'Advanced', label: 'Analytics' },
    { icon: '📤', free: '✕', premium: '✓', label: 'Data Export' },
    { icon: '💬', free: '✕', premium: '✓', label: 'Priority Support' },
  ];

  const testimonials = [
    { name: 'Sarah M.', text: 'Best habit tracker I\'ve used! The AI insights helped me identify patterns I never noticed.', rating: 5 },
    { name: 'John D.', text: 'Worth every penny. The cloud sync means I never lose my streaks.', rating: 5 },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Close Button */}
      {!isBlocking && (
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleDismiss}
          activeOpacity={0.7}
        >
          <Text style={[styles.closeIcon, { color: theme.colors.textSecondary }]}>✕</Text>
        </TouchableOpacity>
      )}

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
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.heroEmoji}>👑</Text>
            <Text
              style={[
                styles.headline,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyDisplayBold,
                  fontSize: theme.typography.fontSize2XL,
                },
              ]}
            >
              {headlines[feature] || headlines.unlimited}
            </Text>
            <Text
              style={[
                styles.subheadline,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeMD,
                },
              ]}
            >
              Take your habit tracking to the next level
            </Text>
          </View>

          {/* Feature Comparison */}
          <View
            style={[
              styles.comparisonCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.comparisonHeader}>
              <View style={styles.comparisonHeaderCell} />
              <View style={styles.comparisonHeaderCell}>
                <Text
                  style={[
                    styles.comparisonHeaderText,
                    {
                      color: theme.colors.textSecondary,
                      fontFamily: theme.typography.fontFamilyBodySemibold,
                    },
                  ]}
                >
                  Free
                </Text>
              </View>
              <View style={[styles.comparisonHeaderCell, styles.premiumCell]}>
                <Text
                  style={[
                    styles.comparisonHeaderText,
                    {
                      color: theme.colors.primary,
                      fontFamily: theme.typography.fontFamilyBodyBold,
                    },
                  ]}
                >
                  Premium
                </Text>
              </View>
            </View>

            {features.map((feat, index) => (
              <View
                key={index}
                style={[
                  styles.comparisonRow,
                  { borderBottomColor: theme.colors.border },
                ]}
              >
                <View style={styles.featureCell}>
                  <Text style={styles.featureIcon}>{feat.icon}</Text>
                  <Text
                    style={[
                      styles.featureLabel,
                      {
                        color: theme.colors.text,
                        fontFamily: theme.typography.fontFamilyBodyMedium,
                      },
                    ]}
                  >
                    {feat.label}
                  </Text>
                </View>
                <View style={styles.valueCell}>
                  <Text
                    style={[
                      styles.freeValue,
                      {
                        color: feat.free === '✕' ? theme.colors.error : theme.colors.textSecondary,
                        fontFamily: theme.typography.fontFamilyBody,
                      },
                    ]}
                  >
                    {feat.free}
                  </Text>
                </View>
                <View style={[styles.valueCell, styles.premiumCell]}>
                  <Text
                    style={[
                      styles.premiumValue,
                      {
                        color: feat.premium === '✓' ? theme.colors.success : theme.colors.primary,
                        fontFamily: theme.typography.fontFamilyBodySemibold,
                      },
                    ]}
                  >
                    {feat.premium}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Social Proof */}
          <View style={styles.socialProof}>
            <Text
              style={[
                styles.socialProofTitle,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyDisplayBold,
                  fontSize: theme.typography.fontSizeMD,
                },
              ]}
            >
              Join 5,000+ Premium Users
            </Text>

            <View style={styles.rating}>
              <Text style={styles.stars}>⭐⭐⭐⭐⭐</Text>
              <Text
                style={[
                  styles.ratingText,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyBody,
                  },
                ]}
              >
                4.8 on App Store (2.5K reviews)
              </Text>
            </View>

            {testimonials.map((testimonial, index) => (
              <View
                key={index}
                style={[
                  styles.testimonialCard,
                  {
                    backgroundColor: theme.colors.backgroundSecondary,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.testimonialText,
                    {
                      color: theme.colors.text,
                      fontFamily: theme.typography.fontFamilyBody,
                    },
                  ]}
                >
                  "{testimonial.text}"
                </Text>
                <Text
                  style={[
                    styles.testimonialName,
                    {
                      color: theme.colors.textSecondary,
                      fontFamily: theme.typography.fontFamilyBodyMedium,
                    },
                  ]}
                >
                  — {testimonial.name}
                </Text>
              </View>
            ))}
          </View>

          {/* Pricing Cards */}
          <View style={styles.pricingSection}>
            <TouchableOpacity
              style={[
                styles.pricingCard,
                {
                  backgroundColor: selectedPlan === 'monthly'
                    ? theme.colors.primaryLight + '20'
                    : theme.colors.surface,
                  borderColor: selectedPlan === 'monthly'
                    ? theme.colors.primary
                    : theme.colors.border,
                  borderWidth: selectedPlan === 'monthly' ? 2 : 1,
                },
              ]}
              onPress={() => setSelectedPlan('monthly')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pricingName,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyBodySemibold,
                  },
                ]}
              >
                Monthly
              </Text>
              <Text
                style={[
                  styles.pricingPrice,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyDisplayBold,
                  },
                ]}
              >
                $4.99
              </Text>
              <Text
                style={[
                  styles.pricingPeriod,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyBody,
                  },
                ]}
              >
                per month
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.pricingCard,
                styles.recommendedCard,
                {
                  backgroundColor: selectedPlan === 'yearly'
                    ? theme.colors.primaryLight + '20'
                    : theme.colors.surface,
                  borderColor: selectedPlan === 'yearly'
                    ? theme.colors.primary
                    : theme.colors.border,
                  borderWidth: selectedPlan === 'yearly' ? 2 : 1,
                },
              ]}
              onPress={() => setSelectedPlan('yearly')}
              activeOpacity={0.7}
            >
              <View style={[styles.bestValueBadge, { backgroundColor: theme.colors.success }]}>
                <Text style={styles.bestValueText}>BEST VALUE • SAVE 50%</Text>
              </View>
              <Text
                style={[
                  styles.pricingName,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyBodySemibold,
                  },
                ]}
              >
                Yearly
              </Text>
              <Text
                style={[
                  styles.pricingPrice,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyDisplayBold,
                  },
                ]}
              >
                $29.99
              </Text>
              <Text
                style={[
                  styles.pricingPeriod,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyBody,
                  },
                ]}
              >
                per year ($2.50/mo)
              </Text>
            </TouchableOpacity>
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            style={[
              styles.ctaButton,
              {
                backgroundColor: theme.colors.primary,
                opacity: isProcessing ? 0.7 : 1,
              },
            ]}
            onPress={handlePurchase}
            activeOpacity={0.8}
            disabled={isProcessing || isLoading}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color={theme.colors.white} />
            ) : (
              <Text
                style={[
                  styles.ctaButtonText,
                  {
                    color: theme.colors.white,
                    fontFamily: theme.typography.fontFamilyBodyBold,
                    fontSize: theme.typography.fontSizeMD,
                  },
                ]}
              >
                Start Premium Now
              </Text>
            )}
          </TouchableOpacity>

          {/* Dismiss Button */}
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={handleDismiss}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.dismissButtonText,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBodyMedium,
                },
              ]}
            >
              {isBlocking ? 'Go Back' : 'Maybe Later'}
            </Text>
          </TouchableOpacity>

          {/* Trust Indicators */}
          <View style={styles.trustIndicators}>
            <Text
              style={[
                styles.trustText,
                {
                  color: theme.colors.textTertiary,
                  fontFamily: theme.typography.fontFamilyBody,
                },
              ]}
            >
              ✓ Cancel anytime  •  ✓ Secure payment  •  ✓ Instant access
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 100,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  heroEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  headline: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subheadline: {
    textAlign: 'center',
  },
  comparisonCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 24,
  },
  comparisonHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  comparisonHeaderCell: {
    flex: 1,
    alignItems: 'center',
  },
  comparisonHeaderText: {
    fontSize: 12,
  },
  premiumCell: {
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  comparisonRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  featureCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  featureLabel: {
    fontSize: 13,
  },
  valueCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  freeValue: {
    fontSize: 13,
  },
  premiumValue: {
    fontSize: 13,
  },
  socialProof: {
    marginBottom: 24,
  },
  socialProofTitle: {
    textAlign: 'center',
    marginBottom: 12,
  },
  rating: {
    alignItems: 'center',
    marginBottom: 16,
  },
  stars: {
    fontSize: 18,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
  },
  testimonialCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  testimonialText: {
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 8,
    lineHeight: 20,
  },
  testimonialName: {
    fontSize: 12,
  },
  pricingSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  pricingCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  recommendedCard: {
    paddingTop: 28,
  },
  bestValueBadge: {
    position: 'absolute',
    top: -10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  bestValueText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  pricingName: {
    fontSize: 14,
    marginBottom: 4,
  },
  pricingPrice: {
    fontSize: 24,
  },
  pricingPeriod: {
    fontSize: 11,
    marginTop: 4,
  },
  ctaButton: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  ctaButtonText: {},
  dismissButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  dismissButtonText: {
    fontSize: 14,
  },
  trustIndicators: {
    alignItems: 'center',
  },
  trustText: {
    fontSize: 11,
    textAlign: 'center',
  },
});

export default PaywallScreen;
