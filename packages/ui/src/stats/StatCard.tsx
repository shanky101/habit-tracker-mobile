import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@app-core/theme';
import { LucideIcon } from 'lucide-react-native';

interface StatCardProps {
    title: string;
    value?: string | number;
    subtitle?: string;
    icon?: LucideIcon;
    gradientColors?: string[];
    style?: ViewStyle;
    children?: React.ReactNode;
    onPress?: () => void;
    fullWidth?: boolean;
    height?: number;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    subtitle,
    icon: Icon,
    gradientColors,
    style,
    children,
    onPress,
    fullWidth = false,
    height,
}) => {
    const { theme } = useTheme();

    const CardContent = (
        <View style={[styles.contentContainer, { height }]}>
            <View style={styles.header}>
                <View>
                    <Text
                        style={[
                            styles.title,
                            {
                                color: gradientColors ? theme.colors.white : theme.colors.textSecondary,
                                fontFamily: theme.typography.fontFamilyBodyMedium,
                            },
                        ]}
                    >
                        {title}
                    </Text>
                    {value !== undefined && (
                        <Text
                            style={[
                                styles.value,
                                {
                                    color: gradientColors ? theme.colors.white : theme.colors.text,
                                    fontFamily: theme.typography.fontFamilyDisplayBold,
                                },
                            ]}
                        >
                            {value}
                        </Text>
                    )}
                </View>
                {Icon && (
                    <View
                        style={[
                            styles.iconContainer,
                            {
                                backgroundColor: gradientColors
                                    ? 'rgba(255,255,255,0.2)'
                                    : theme.colors.backgroundSecondary,
                            },
                        ]}
                    >
                        <Icon
                            size={20}
                            color={gradientColors ? theme.colors.white : theme.colors.primary}
                            strokeWidth={2.5}
                        />
                    </View>
                )}
            </View>

            {children && <View style={styles.childrenContainer}>{children}</View>}

            {subtitle && (
                <Text
                    style={[
                        styles.subtitle,
                        {
                            color: gradientColors
                                ? 'rgba(255,255,255,0.8)'
                                : theme.colors.textSecondary,
                            fontFamily: theme.typography.fontFamilyBody,
                        },
                    ]}
                >
                    {subtitle}
                </Text>
            )}
        </View>
    );

    const containerStyle = [
        styles.container,
        fullWidth ? styles.fullWidth : styles.halfWidth,
        !gradientColors && {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderWidth: 1,
        },
        style,
    ];

    if (gradientColors) {
        return (
            <TouchableOpacity
                activeOpacity={onPress ? 0.9 : 1}
                onPress={onPress}
                style={[containerStyle, { borderWidth: 0 }]}
            >
                <LinearGradient
                    colors={gradientColors as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />
                {CardContent}
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            activeOpacity={onPress ? 0.9 : 1}
            onPress={onPress}
            style={containerStyle}
        >
            {CardContent}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    fullWidth: {
        width: '100%',
    },
    halfWidth: {
        flex: 1,
        minWidth: '48%',
    },
    contentContainer: {
        padding: 16,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    title: {
        fontSize: 13,
        marginBottom: 4,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    value: {
        fontSize: 28,
        letterSpacing: -0.5,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    childrenContainer: {
        marginTop: 8,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 12,
        marginTop: 4,
    },
});

export default StatCard;
