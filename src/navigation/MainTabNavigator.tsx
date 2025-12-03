import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/theme';
import {
  HomeScreen,
  AddHabitStep1Screen,
  AddHabitStep2Screen,
  AddHabitStep3Screen,
  EditHabitScreen,
  HabitDetailScreen,
  CalendarViewScreen,
  HabitTemplatesScreen,
  AnalyticsDashboardScreen,
  HabitDeepDiveScreen,
  AIInsightsScreen,
  ExportDataScreen,
  SettingsScreen,
  ThemePickerScreen,
  ProfileScreen,
  NotificationsSettingsScreen,
  AccountSettingsScreen,
  SubscriptionScreen,
  PaywallScreen,
  AboutScreen,
  DataPrivacyScreen,
  ChangePasswordScreen,
} from '@/screens';
import TemplatesScreen from '@/screens/TemplatesScreen';
import TemplateDetailScreen from '@/screens/TemplateDetailScreen';
import CreateTemplateScreen from '@/screens/CreateTemplateScreen';

export type HomeStackParamList = {
  HomeMain: { newHabit?: any } | undefined;
  AddHabitStep1: undefined;
  AddHabitStep2: { habitName: string };
  AddHabitStep3: { habitName: string; category: string; color: string };
  EditHabit: { habitId: string; habitData: any };
  HabitDetail: { habitId: string; habitData: any };
  CalendarView: undefined;
  HabitTemplates: undefined;
};

export type AnalyticsStackParamList = {
  AnalyticsMain: undefined;
  HabitDeepDive: { habitId: string; habitData: any };
  AIInsights: undefined;
  ExportData: undefined;
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
  ThemePicker: undefined;
  Subscription: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  Settings: undefined;
  ThemePicker: undefined;
  NotificationsSettings: undefined;
  AccountSettings: undefined;
  ExportData: undefined;
  About: undefined;
  Subscription: undefined;
  Paywall: undefined;
  DataPrivacy: undefined;
  ChangePassword: undefined;
};

export type TemplatesStackParamList = {
  TemplatesMain: undefined;
  TemplateDetail: { templateId: string };
  CreateTemplate: { mode: 'create' | 'edit' | 'copy'; templateId?: string };
};

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator<HomeStackParamList>();
const TemplatesStack = createStackNavigator<TemplatesStackParamList>();
const AnalyticsStack = createStackNavigator<AnalyticsStackParamList>();
const SettingsStack = createStackNavigator<SettingsStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();

// Tab Icon Component
const TabIcon: React.FC<{ icon: string; focused: boolean; color: string }> = ({
  icon,
  focused,
  color,
}) => (
  <View style={styles.tabIconContainer}>
    <Text style={[styles.tabIcon, { opacity: focused ? 1 : 0.6 }]}>{icon}</Text>
  </View>
);

// Home Stack Navigator
const HomeStackNavigator: React.FC = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
      }}
    >
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="AddHabitStep1" component={AddHabitStep1Screen} />
      <HomeStack.Screen name="AddHabitStep2" component={AddHabitStep2Screen} />
      <HomeStack.Screen name="AddHabitStep3" component={AddHabitStep3Screen} />
      <HomeStack.Screen name="EditHabit" component={EditHabitScreen} />
      <HomeStack.Screen name="HabitDetail" component={HabitDetailScreen} />
      <HomeStack.Screen name="CalendarView" component={CalendarViewScreen} />
      <HomeStack.Screen name="HabitTemplates" component={HabitTemplatesScreen} />
    </HomeStack.Navigator>
  );
};

// Analytics Stack Navigator
const AnalyticsStackNavigator: React.FC = () => {
  return (
    <AnalyticsStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
      }}
    >
      <AnalyticsStack.Screen name="AnalyticsMain" component={AnalyticsDashboardScreen} />
      <AnalyticsStack.Screen name="HabitDeepDive" component={HabitDeepDiveScreen} />
      <AnalyticsStack.Screen name="AIInsights" component={AIInsightsScreen} />
      <AnalyticsStack.Screen name="ExportData" component={ExportDataScreen} />
    </AnalyticsStack.Navigator>
  );
};

// Settings Stack Navigator
const SettingsStackNavigator: React.FC = () => {
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
      }}
    >
      <SettingsStack.Screen name="SettingsMain" component={SettingsScreen} />
      <SettingsStack.Screen name="ThemePicker" component={ThemePickerScreen} />
    </SettingsStack.Navigator>
  );
};

// Templates Stack Navigator
const TemplatesStackNavigator: React.FC = () => {
  return (
    <TemplatesStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
      }}
    >
      <TemplatesStack.Screen name="TemplatesMain" component={TemplatesScreen} />
      <TemplatesStack.Screen name="TemplateDetail" component={TemplateDetailScreen} />
      <TemplatesStack.Screen name="CreateTemplate" component={CreateTemplateScreen} />
    </TemplatesStack.Navigator>
  );
};

// Profile Stack Navigator
const ProfileStackNavigator: React.FC = () => {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
      }}
    >
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
      <ProfileStack.Screen name="ThemePicker" component={ThemePickerScreen} />
      <ProfileStack.Screen name="NotificationsSettings" component={NotificationsSettingsScreen} />
      <ProfileStack.Screen name="AccountSettings" component={AccountSettingsScreen} />
      <ProfileStack.Screen name="ExportData" component={ExportDataScreen} />
      <ProfileStack.Screen name="About" component={AboutScreen} />
      <ProfileStack.Screen name="Subscription" component={SubscriptionScreen} />
      <ProfileStack.Screen name="Paywall" component={PaywallScreen} />
      <ProfileStack.Screen name="DataPrivacy" component={DataPrivacyScreen} />
      <ProfileStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </ProfileStack.Navigator>
  );
};

// Create Button Component (center tab)
const CreateButton: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.createButton,
        {
          backgroundColor: theme.colors.primary,
          shadowColor: theme.colors.primary,
        }
      ]}
      onPress={() => navigation.navigate('Home', { screen: 'AddHabitStep1' })}
      activeOpacity={0.8}
    >
      <Text style={styles.createButtonIcon}>+</Text>
    </TouchableOpacity>
  );
};

// Main Tab Navigator
const MainTabNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: {
          fontFamily: theme.typography.fontFamilyBody,
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="🏠" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Templates"
        component={TemplatesStackNavigator}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="📋" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Create"
        component={HomeStackNavigator}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('Home', { screen: 'AddHabitStep1' });
          },
        })}
        options={{
          tabBarIcon: () => <CreateButton />,
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen
        name="Stats"
        component={AnalyticsStackNavigator}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="📊" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="👤" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 24,
  },
  createButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createButtonIcon: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '300',
    marginTop: -2,
  },
});

export default MainTabNavigator;
