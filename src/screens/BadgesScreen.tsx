import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBadgeStore, BadgeState } from '../store/badgeStore';
import { BadgeIcon } from '../components/badges/BadgeIcon';
import { BadgeDefinition, BadgeCategory } from '../types/badges';
import { ArrowLeft, Bug } from 'lucide-react-native';
import { BadgeDetailModal } from '../components/badges/BadgeDetailModal';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur'; // Assuming expo-blur is available, or fallback
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const ITEM_SIZE = width / COLUMN_COUNT;

type FilterType = 'all' | 'earned' | 'locked';

export const BadgesScreen: React.FC = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { badges, refreshBadges, seedMockBadges, isLoading } = useBadgeStore();
    const [filter, setFilter] = useState<FilterType>('all');
    const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition | null>(null);

    useEffect(() => {
        refreshBadges();
    }, []);

    const filteredBadges = useMemo(() => {
        switch (filter) {
            case 'earned': return badges.filter(b => b.isUnlocked);
            case 'locked': return badges.filter(b => !b.isUnlocked);
            default: return badges;
        }
    }, [badges, filter]);

    const renderItem = ({ item }: { item: BadgeState }) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => setSelectedBadge(item)}
            activeOpacity={0.7}
        >
            <BadgeIcon
                tier={item.tier}
                shape={item.shape}
                icon={item.icon}
                size={ITEM_SIZE * 0.7}
                isLocked={!item.isUnlocked}
            />
            <Text style={[styles.itemTitle, !item.isUnlocked && styles.lockedText]} numberOfLines={1}>
                {item.secret && !item.isUnlocked ? '???' : item.title}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#1a1a1a', '#000000']}
                style={StyleSheet.absoluteFill}
            />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Badges</Text>
                <TouchableOpacity
                    onPress={() => {
                        Alert.alert(
                            'Debug: Seed Badges',
                            'Unlock 50 mock badges?',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Seed', onPress: () => seedMockBadges() }
                            ]
                        );
                    }}
                    style={styles.backButton}
                >
                    <Bug size={20} color="#666" />
                </TouchableOpacity>
            </View>

            {/* Stats Summary */}
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{badges.filter(b => b.isUnlocked).length}</Text>
                    <Text style={styles.statLabel}>Earned</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{badges.length}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                        {badges.length > 0
                            ? Math.round((badges.filter(b => b.isUnlocked).length / badges.length) * 100)
                            : 0}%
                    </Text>
                    <Text style={styles.statLabel}>Complete</Text>
                </View>
            </View>

            {/* Filter Tabs */}
            <View style={styles.tabsContainer}>
                {(['all', 'earned', 'locked'] as FilterType[]).map((f) => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.tab, filter === f && styles.activeTab]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[styles.tabText, filter === f && styles.activeTabText]}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Grid */}
            <FlatList
                data={filteredBadges}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                numColumns={COLUMN_COUNT}
                contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
                showsVerticalScrollIndicator={false}
            />

            {/* Detail Modal */}
            <BadgeDetailModal
                badge={selectedBadge}
                visible={!!selectedBadge}
                onClose={() => setSelectedBadge(null)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginHorizontal: 20,
        borderRadius: 16,
        padding: 16,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
    },
    statLabel: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    activeTab: {
        backgroundColor: '#FFF',
    },
    tabText: {
        color: '#888',
        fontWeight: '600',
    },
    activeTabText: {
        color: '#000',
    },
    listContent: {
        paddingHorizontal: 10,
    },
    itemContainer: {
        width: ITEM_SIZE,
        alignItems: 'center',
        marginBottom: 20,
        padding: 10,
    },
    itemTitle: {
        color: '#FFF',
        fontSize: 12,
        marginTop: 8,
        textAlign: 'center',
        fontWeight: '500',
    },
    lockedText: {
        color: '#555',
    },
});
