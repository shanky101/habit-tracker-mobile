import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme';
import { Droplets, Plus, Minus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

interface HydrationDetailViewProps {
    current: number;
    target: number;
    onAdd: (amount: number) => void;
    onRemove: (amount: number) => void;
}

const HydrationDetailView: React.FC<HydrationDetailViewProps> = ({
    current,
    target,
    onAdd,
    onRemove,
}) => {
    const { theme } = useTheme();
    const fillAnim = useRef(new Animated.Value(0)).current;

    // Calculate percentage (capped at 100%)
    const percentage = Math.min(Math.max(current / target, 0), 1);

    useEffect(() => {
        Animated.spring(fillAnim, {
            toValue: percentage,
            friction: 6,
            tension: 40,
            useNativeDriver: false, // height doesn't support native driver
        }).start();
    }, [percentage]);

    const handleAdd = (amount: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onAdd(amount);
    };

    const handleRemove = (amount: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onRemove(amount);
    };

    return (
        <View style={styles.container}>
            {/* Main Bottle Visual */}
            <View style={styles.bottleContainer}>
                {/* Bottle Neck */}
                <View style={[styles.bottleNeck, { borderColor: 'rgba(255,255,255,0.3)' }]} />

                {/* Bottle Body */}
                <View style={[styles.bottleBody, { borderColor: 'rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                    {/* Water Fill */}
                    <Animated.View
                        style={[
                            styles.waterFill,
                            {
                                height: fillAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0%', '100%'],
                                }),
                            },
                        ]}
                    >
                        <LinearGradient
                            colors={['#3B82F6', '#2563EB']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                            style={StyleSheet.absoluteFill}
                        />
                        {/* Bubbles (Visual decoration) */}
                        <View style={styles.bubbles}>
                            <View style={[styles.bubble, { left: '20%', width: 8, height: 8, opacity: 0.6 }]} />
                            <View style={[styles.bubble, { left: '50%', width: 12, height: 12, opacity: 0.4 }]} />
                            <View style={[styles.bubble, { left: '80%', width: 6, height: 6, opacity: 0.7 }]} />
                        </View>
                    </Animated.View>

                    {/* Measurement Lines */}
                    <View style={styles.measurements}>
                        <View style={[styles.measurementLine, { bottom: '25%' }]}>
                            <Text style={styles.measurementText}>25%</Text>
                        </View>
                        <View style={[styles.measurementLine, { bottom: '50%' }]}>
                            <Text style={styles.measurementText}>50%</Text>
                        </View>
                        <View style={[styles.measurementLine, { bottom: '75%' }]}>
                            <Text style={styles.measurementText}>75%</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: theme.colors.white }]}>
                        {current}<Text style={styles.statUnit}>ml</Text>
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Current</Text>
                </View>
                <View style={[styles.divider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: theme.colors.white }]}>
                        {Math.round(percentage * 100)}%
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Goal</Text>
                </View>
                <View style={[styles.divider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: theme.colors.textSecondary }]}>
                        {target}<Text style={styles.statUnit}>ml</Text>
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Target</Text>
                </View>
            </View>

            {/* Controls */}
            <View style={styles.controlsContainer}>
                <TouchableOpacity
                    style={[styles.controlButton, { backgroundColor: 'rgba(255,255,255,0.1)' }]}
                    onPress={() => handleRemove(250)}
                >
                    <Minus size={24} color="#FFF" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: '#3B82F6', shadowColor: '#3B82F6' }]}
                    onPress={() => handleAdd(250)}
                >
                    <Droplets size={24} color="#FFF" fill="#FFF" />
                    <Text style={styles.addButtonText}>+250ml</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.controlButton, { backgroundColor: 'rgba(255,255,255,0.1)' }]}
                    onPress={() => handleAdd(500)}
                >
                    <Plus size={24} color="#FFF" />
                    <Text style={styles.smallAddText}>+500</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 40,
    },
    bottleContainer: {
        alignItems: 'center',
        height: height * 0.45,
        marginBottom: 40,
    },
    bottleNeck: {
        width: 60,
        height: 40,
        borderWidth: 4,
        borderBottomWidth: 0,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        marginBottom: -2,
        zIndex: 1,
    },
    bottleBody: {
        width: 160,
        flex: 1,
        borderWidth: 4,
        borderRadius: 30,
        overflow: 'hidden',
        position: 'relative',
    },
    waterFill: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#3B82F6',
    },
    bubbles: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 20,
    },
    bubble: {
        position: 'absolute',
        backgroundColor: 'rgba(255,255,255,0.4)',
        borderRadius: 999,
    },
    measurements: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        width: 40,
        justifyContent: 'center',
    },
    measurementLine: {
        position: 'absolute',
        right: 0,
        width: 10,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.5)',
        flexDirection: 'row',
        alignItems: 'center',
    },
    measurementText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 10,
        position: 'absolute',
        right: 14,
        width: 30,
        textAlign: 'right',
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 40,
        marginBottom: 40,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: 'Outfit_700Bold',
    },
    statUnit: {
        fontSize: 14,
        fontWeight: 'normal',
        marginLeft: 2,
    },
    statLabel: {
        fontSize: 12,
        marginTop: 4,
    },
    divider: {
        width: 1,
        height: 30,
    },
    controlsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    controlButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        height: 64,
        borderRadius: 32,
        gap: 8,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    addButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Outfit_700Bold',
    },
    smallAddText: {
        color: '#FFF',
        fontSize: 10,
        position: 'absolute',
        bottom: 8,
    },
});

export default HydrationDetailView;
