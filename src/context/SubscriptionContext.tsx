import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUBSCRIPTION_KEY = '@habit_tracker_subscription';

export type SubscriptionPlan = 'free' | 'monthly' | 'yearly' | 'lifetime';

export interface SubscriptionState {
  isPremium: boolean;
  plan: SubscriptionPlan;
  expiresAt: string | null;
  startedAt: string | null;
}

interface SubscriptionContextType {
  subscription: SubscriptionState;
  isLoading: boolean;
  upgradeToPremium: (plan: SubscriptionPlan) => Promise<boolean>;
  cancelSubscription: () => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  checkSubscriptionStatus: () => Promise<void>;
}

const defaultSubscription: SubscriptionState = {
  isPremium: false,
  plan: 'free',
  expiresAt: null,
  startedAt: null,
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [subscription, setSubscription] = useState<SubscriptionState>(defaultSubscription);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const stored = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SubscriptionState;
        // Check if subscription has expired
        if (parsed.expiresAt && new Date(parsed.expiresAt) < new Date()) {
          // Subscription expired
          await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(defaultSubscription));
          setSubscription(defaultSubscription);
        } else {
          setSubscription(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const upgradeToPremium = async (plan: SubscriptionPlan): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate IAP process - in production, use RevenueCat or similar
      await new Promise(resolve => setTimeout(resolve, 1500));

      const now = new Date();
      let expiresAt: string | null = null;

      if (plan === 'monthly') {
        const expiry = new Date(now);
        expiry.setMonth(expiry.getMonth() + 1);
        expiresAt = expiry.toISOString();
      } else if (plan === 'yearly') {
        const expiry = new Date(now);
        expiry.setFullYear(expiry.getFullYear() + 1);
        expiresAt = expiry.toISOString();
      }
      // Lifetime has no expiry

      const newSubscription: SubscriptionState = {
        isPremium: true,
        plan,
        expiresAt,
        startedAt: now.toISOString(),
      };

      await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(newSubscription));
      setSubscription(newSubscription);
      return true;
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSubscription = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate cancellation - in production, this would link to App Store/Play Store
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Keep premium until expiry date
      const updatedSubscription: SubscriptionState = {
        ...subscription,
        // In real app, would set a cancelled flag
      };

      await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(updatedSubscription));
      return true;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const restorePurchases = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate restore - in production, verify with App Store/Play Store
      await new Promise(resolve => setTimeout(resolve, 1500));

      // For demo, check if we had a previous subscription
      const stored = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SubscriptionState;
        if (parsed.isPremium) {
          setSubscription(parsed);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error restoring purchases:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const checkSubscriptionStatus = async (): Promise<void> => {
    await loadSubscription();
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        isLoading,
        upgradeToPremium,
        cancelSubscription,
        restorePurchases,
        checkSubscriptionStatus,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

// Helper to format subscription plan name
export const formatPlanName = (plan: SubscriptionPlan): string => {
  switch (plan) {
    case 'monthly':
      return 'Premium Monthly';
    case 'yearly':
      return 'Premium Yearly';
    case 'lifetime':
      return 'Premium Lifetime';
    default:
      return 'Free Plan';
  }
};

// Helper to get plan price
export const getPlanPrice = (plan: SubscriptionPlan): string => {
  switch (plan) {
    case 'monthly':
      return '$4.99/month';
    case 'yearly':
      return '$29.99/year';
    case 'lifetime':
      return '$49.99 one-time';
    default:
      return 'Free';
  }
};
