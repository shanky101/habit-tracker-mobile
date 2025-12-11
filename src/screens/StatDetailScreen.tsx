import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '@app-core/theme';
import { LinearGradient } from 'expo-linear-gradient';
import {
    ArrowLeft,
    Info,
    Lightbulb,
    TrendingUp,
    Award,
    Zap,
    Target,
    Calendar,
    Clock,
    PieChart,
    CheckCircle2,
} from 'lucide-react-native';
import { BlurView } from 'expo-blur';

// Import charts/components to reuse
import { ConsistencyHeatmap, CategoryDistributionChart, TimeOfDayChart } from '@app-core/ui';

const { width } = Dimensions.get('window');

type ParamList = {
    StatDetail: {
        statType: 'consistency' | 'streak' | 'heatmap' | 'balance' | 'chronotype' | 'perfectDays' | 'level';
        data?: any;
        metrics?: any; // Pass the full metrics object if needed
    };
};

const STAT_CONFIG = {
    consistency: {
        title: 'Consistency Score',
        subtitle: 'Your Reliability Index',
        icon: TrendingUp,
        gradient: ['#10B981', '#059669'], // Emerald
        description: 'Your Consistency Score reflects how often you complete your scheduled habits. It is a measure of your reliability to yourself.',
        whyItMatters: 'Consistency is the key to habit formation. It\'s not about intensity; it\'s about showing up. A score above 80% indicates a strong, sustainable routine.',
        tips: [
            'Don\'t break the chain! Even a small action counts.',
            'If you miss a day, get back on track immediately. Never miss twice.',
            'Start small. It\'s easier to be consistent with easy habits.',
        ],
    },
    streak: {
        title: 'Average Streak',
        subtitle: 'Momentum Builder',
        icon: Zap,
        gradient: ['#F59E0B', '#D97706'], // Amber
        description: 'Your Average Streak shows the typical length of your consecutive completion chains across all active habits.',
        whyItMatters: 'Streaks build momentum. The longer your streak, the more automatic the behavior becomes. High average streaks mean you are building strong neural pathways.',
        tips: [
            'Protect your streak! Use "skip" or "vacation mode" if needed (coming soon).',
            'Celebrate milestones (7 days, 21 days, 66 days).',
            'Focus on one habit at a time to build a massive streak.',
        ],
    },
    heatmap: {
        title: 'Consistency Map',
        subtitle: 'Visualizing Effort',
        icon: Calendar,
        gradient: ['#3B82F6', '#2563EB'], // Blue
        description: 'This map visualizes your daily activity over the last 90 days. Darker squares mean more completed habits.',
        whyItMatters: 'Visualizing your progress helps you see patterns. Are weekends harder? Do you have "slump" weeks? Use this data to adjust your schedule.',
        tips: [
            'Aim to "fill the grid" with color.',
            'Look for empty columns—what happened those days?',
            'Try to keep the color intensity consistent.',
        ],
    },
    balance: {
        title: 'Life Balance',
        subtitle: 'Category Distribution',
        icon: PieChart,
        gradient: ['#EC4899', '#DB2777'], // Pink
        description: 'This chart shows how your habits are distributed across different areas of your life (Health, Productivity, Mindfulness, etc.).',
        whyItMatters: 'A well-rounded life requires attention to multiple areas. If 90% of your habits are work-related, you might be neglecting health or relationships.',
        tips: [
            'Aim for a mix of categories to prevent burnout.',
            'If one category dominates, try adding a small habit in a neglected area.',
            'Review this monthly to ensure you\'re living by your values.',
        ],
    },
    chronotype: {
        title: 'Chronotype',
        subtitle: 'Peak Performance Hours',
        icon: Clock,
        gradient: ['#8B5CF6', '#7C3AED'], // Violet
        description: 'This analysis reveals when you are most likely to complete your habits: Morning, Afternoon, Evening, or Night.',
        whyItMatters: 'Work with your biology, not against it. If you\'re a night owl, don\'t force 5 AM habits. Schedule hard habits during your peak energy times.',
        tips: [
            'Schedule your hardest habits during your peak hours.',
            'Use low-energy times for easy, routine habits.',
            'Experiment with moving a struggling habit to a different time of day.',
        ],
    },
    perfectDays: {
        title: 'Perfect Days',
        subtitle: '100% Completion',
        icon: Award,
        gradient: ['#F43F5E', '#E11D48'], // Rose
        description: 'A "Perfect Day" is a day where you completed ALL your scheduled habits. These are days of total victory.',
        whyItMatters: 'Perfect days prove to yourself that you are capable of full discipline. They build massive self-efficacy and confidence.',
        tips: [
            'Don\'t obsess over perfection; progress is better.',
            'Treat perfect days as special wins.',
            'Analyze what made a day perfect—was it sleep? preparation? mood?',
        ],
    },
    level: {
        title: 'User Level & XP',
        subtitle: 'Gamified Progress',
        icon: Award,
        gradient: ['#6366F1', '#4F46E5'], // Indigo
        description: 'Your User Level is a reflection of your dedication. You earn Experience Points (XP) for every habit you complete.',
        whyItMatters: 'Gamifying your life makes building habits fun. Watching your XP grow gives you a tangible sense of progress, even on days when you don\'t feel like it.',
        tips: [
            'Earn 10 XP for every habit completion.',
            'Level up by reaching XP milestones (e.g., 100 XP, 250 XP).',
            'Consistency is the fastest way to level up!',
        ],
    },
};

const StatDetailScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<ParamList, 'StatDetail'>>();
    const { theme } = useTheme();
    const { statType, data, metrics } = route.params;
    const config = STAT_CONFIG[statType];

    const scrollY = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const renderHeroContent = () => {
        switch (statType) {
            case 'consistency':
                return (
                    <View style={styles.heroMetricContainer}>
                        <Text style={[styles.heroMetricValue, { color: theme.colors.white }]}>
                            {data || metrics?.consistencyScore}%
                        </Text>
                        <Text style={[styles.heroMetricLabel, { color: 'rgba(255,255,255,0.8)' }]}>
                            Consistency
                        </Text>
                    </View>
                );
            case 'streak':
                return (
                    <View style={styles.heroMetricContainer}>
                        <Text style={[styles.heroMetricValue, { color: theme.colors.white }]}>
                            {data || metrics?.avgStreak}
                        </Text>
                        <Text style={[styles.heroMetricLabel, { color: 'rgba(255,255,255,0.8)' }]}>
                            Days Avg.
                        </Text>
                    </View>
                );
            case 'heatmap':
                return (
                    <View style={styles.chartContainer}>
                        <ConsistencyHeatmap data={metrics?.heatmapData || []} />
                    </View>
                );
            case 'balance':
                return (
                    <View style={styles.chartContainer}>
                        <CategoryDistributionChart data={metrics?.categoryData || []} />
                    </View>
                );
            case 'chronotype':
                return (
                    <View style={styles.chartContainer}>
                        <TimeOfDayChart data={metrics?.timeOfDayData || []} />
                    </View>
                );
            case 'perfectDays':
                return (
                    <View style={styles.heroMetricContainer}>
                        <Text style={[styles.heroMetricValue, { color: theme.colors.white }]}>
                            {data || metrics?.perfectDays}
                        </Text>
                        <Text style={[styles.heroMetricLabel, { color: 'rgba(255,255,255,0.8)' }]}>
                            Perfect Days
                        </Text>
                    </View>
                );
            case 'level':
                return (
                    <View style={styles.heroMetricContainer}>
                        <Text style={[styles.heroMetricValue, { color: theme.colors.white }]}>
                            Lvl {metrics?.userLevel?.level}
                        </Text>
                        <Text style={[styles.heroMetricLabel, { color: 'rgba(255,255,255,0.8)' }]}>
                            {metrics?.userLevel?.xp} / {metrics?.userLevel?.nextLevelXp} XP
                        </Text>
                        <View style={{
                            width: 200,
                            height: 6,
                            backgroundColor: 'rgba(255,255,255,0.3)',
                            borderRadius: 3,
                            marginTop: 12,
                            overflow: 'hidden'
                        }}>
                            <View style={{
                                width: `${(metrics?.userLevel?.xp / metrics?.userLevel?.nextLevelXp) * 100}%`,
                                height: '100%',
                                backgroundColor: '#fff'
                            }} />
                        </View>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
            >
                {/* Hero Section with Gradient */}
                <View style={styles.heroSection}>
                    <LinearGradient
                        colors={config.gradient as any}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                    />
                    <SafeAreaView edges={['top']} style={styles.heroContent}>
                        <View style={styles.header}>
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={styles.backButton}
                            >
                                <ArrowLeft color="#fff" size={24} />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>{config.title}</Text>
                            <View style={{ width: 24 }} />
                        </View>

                        <Animated.View
                            style={[
                                styles.heroMain,
                                {
                                    opacity: fadeAnim,
                                    transform: [{ translateY: slideAnim }],
                                },
                            ]}
                        >
                            <View style={styles.iconCircle}>
                                <config.icon size={32} color={config.gradient[1]} />
                            </View>
                            <Text style={styles.heroSubtitle}>{config.subtitle}</Text>

                            {renderHeroContent()}
                        </Animated.View>
                    </SafeAreaView>
                </View>

                {/* Content Section */}
                <Animated.View
                    style={[
                        styles.contentSection,
                        {
                            backgroundColor: theme.colors.background,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    {/* What is this? */}
                    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                        <View style={styles.cardHeader}>
                            <Info size={20} color={theme.colors.primary} />
                            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                                What is this?
                            </Text>
                        </View>
                        <Text style={[styles.cardText, { color: theme.colors.textSecondary }]}>
                            {config.description}
                        </Text>
                    </View>

                    {/* Why it matters */}
                    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                        <View style={styles.cardHeader}>
                            <Target size={20} color={theme.colors.secondary} />
                            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                                Why it matters
                            </Text>
                        </View>
                        <Text style={[styles.cardText, { color: theme.colors.textSecondary }]}>
                            {config.whyItMatters}
                        </Text>
                    </View>

                    {/* Pro Tips */}
                    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                        <View style={styles.cardHeader}>
                            <Lightbulb size={20} color="#F59E0B" />
                            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                                Pro Tips
                            </Text>
                        </View>
                        <View style={styles.tipsList}>
                            {config.tips.map((tip, index) => (
                                <View key={index} style={styles.tipItem}>
                                    <View style={[styles.tipBullet, { backgroundColor: config.gradient[0] }]} />
                                    <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
                                        {tip}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={{ height: 40 }} />
                </Animated.View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    heroSection: {
        height: 380,
        width: '100%',
        position: 'relative',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        overflow: 'hidden',
    },
    heroContent: {
        flex: 1,
        paddingHorizontal: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 8,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    heroMain: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        paddingBottom: 40,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    heroSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 16,
        fontWeight: '500',
    },
    heroMetricContainer: {
        alignItems: 'center',
    },
    heroMetricValue: {
        fontSize: 48,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    heroMetricLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    chartContainer: {
        width: width - 48,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 24,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentSection: {
        paddingHorizontal: 24,
        paddingTop: 24,
        marginTop: -20, // Overlap slightly
    },
    card: {
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    cardText: {
        fontSize: 15,
        lineHeight: 24,
    },
    tipsList: {
        gap: 12,
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    tipBullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 9,
    },
    tipText: {
        flex: 1,
        fontSize: 15,
        lineHeight: 24,
    },
});

export default StatDetailScreen;
