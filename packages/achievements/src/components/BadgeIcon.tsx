import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Canvas, Path, LinearGradient, vec, Shadow, Group, RuntimeShader } from '@shopify/react-native-skia';
import * as LucideIcons from 'lucide-react-native';
import { BadgeShape, BadgeTier } from '../types/badges';
import { TIER_COLORS, TIER_SHADOWS, COSMIC_SHADER, HOLOGRAPHIC_SHADER, DIAMOND_SHADER } from '../assets/badgeShaders';

interface BadgeIconProps {
    tier: BadgeTier;
    shape: BadgeShape;
    icon: string;
    size?: number;
    isLocked?: boolean;
    showProgress?: boolean;
    progress?: number; // 0 to 1
}

const SHAPES: Record<BadgeShape, (size: number) => string> = {
    circle: (s) => {
        // Reduce radius to account for stroke width (0.08 * s)
        // We need 0.04 * s padding on each side
        const padding = s * 0.05;
        const r = (s - 2 * padding) / 2;
        const cx = s / 2;
        const cy = s / 2;
        return `M ${cx} ${padding} A ${r} ${r} 0 1 1 ${cx} ${s - padding} A ${r} ${r} 0 1 1 ${cx} ${padding} Z`;
    },
    hexagon: (s) => {
        const padding = s * 0.05;
        const availableSize = s - 2 * padding;
        const r = availableSize / 2;
        const w = r * Math.sqrt(3);
        const cx = s / 2;
        const cy = s / 2;

        // Rounded Hexagon
        const cornerRadius = availableSize * 0.15;

        // Adjust points to be centered
        // Top Center: (cx, padding)

        return `
            M ${cx} ${padding + cornerRadius}
            Q ${cx} ${padding} ${cx + w * 0.25} ${padding + r * 0.125}
            L ${cx + w - cornerRadius} ${cy - cornerRadius}
            Q ${cx + w} ${cy} ${cx + w} ${cy + cornerRadius}
            L ${cx + w} ${cy + r - cornerRadius}
            Q ${cx + w} ${cy + r} ${cx + w - cornerRadius} ${cy + r + cornerRadius}
            L ${cx + w * 0.5} ${s - padding - r * 0.125}
            Q ${cx} ${s - padding} ${cx - w * 0.5} ${s - padding - r * 0.125}
            L ${cx - w + cornerRadius} ${cy + r + cornerRadius}
            Q ${cx - w} ${cy + r} ${cx - w} ${cy + r - cornerRadius}
            L ${cx - w} ${cy + cornerRadius}
            Q ${cx - w} ${cy} ${cx - w + cornerRadius} ${cy - cornerRadius}
            Z
        `;
    },
    diamond: (s) => {
        const padding = s * 0.05;
        const availableSize = s - 2 * padding;
        const r = availableSize / 2;
        const cornerRadius = availableSize * 0.1;
        const cx = s / 2;
        const cy = s / 2;

        return `
            M ${cx} ${padding + cornerRadius}
            Q ${cx} ${padding} ${cx + cornerRadius} ${padding + cornerRadius}
            L ${s - padding - cornerRadius} ${cy - cornerRadius}
            Q ${s - padding} ${cy} ${s - padding - cornerRadius} ${cy + cornerRadius}
            L ${cx + cornerRadius} ${s - padding - cornerRadius}
            Q ${cx} ${s - padding} ${cx - cornerRadius} ${s - padding - cornerRadius}
            L ${padding + cornerRadius} ${cy + cornerRadius}
            Q ${padding} ${cy} ${padding + cornerRadius} ${cy - cornerRadius}
            Z
        `;
    },
    shield: (s) => {
        const padding = s * 0.05;
        const w = s - 2 * padding;
        const h = s - 2 * padding;
        const x = padding;
        const y = padding;

        return `
            M ${s * 0.5} ${y}
            L ${x + w - 10} ${y + h * 0.25}
            V ${y + h * 0.5}
            C ${x + w - 10} ${y + h * 0.8} ${x + w * 0.75} ${y + h * 0.9} ${s * 0.5} ${y + h}
            C ${x + w * 0.25} ${y + h * 0.9} ${x + 10} ${y + h * 0.8} ${x + 10} ${y + h * 0.5}
            V ${y + h * 0.25}
            Z
        `;
    },
    star: (s) => {
        const padding = s * 0.05;
        const availableSize = s - 2 * padding;
        const cx = s / 2;
        const cy = s / 2;
        const outerRadius = availableSize / 2;
        const innerRadius = availableSize / 4;
        let path = "";
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const x = cx + outerRadius * Math.cos(angle);
            const y = cy + outerRadius * Math.sin(angle);

            const a2 = ((i * 2 + 1) * Math.PI) / 5 - Math.PI / 2;
            const x2 = cx + innerRadius * Math.cos(a2);
            const y2 = cy + innerRadius * Math.sin(a2);

            if (i === 0) {
                path += `M ${x} ${y}`;
            } else {
                path += `L ${x} ${y}`;
            }
            path += `L ${x2} ${y2}`;
        }
        path += "Z";
        return path;
    }
};

export const BadgeIcon: React.FC<BadgeIconProps> = ({
    tier,
    shape,
    icon,
    size = 64,
    isLocked = false,
    showProgress = false,
    progress = 0
}) => {
    // Convert icon name to PascalCase if needed (e.g. 'check-circle' -> 'CheckCircle')
    // But assumes input is already PascalCase or matches export name
    // Also handle kebab-case just in case
    const iconName = icon.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');

    const LucideIcon = (LucideIcons as any)[iconName] || (LucideIcons as any)[icon] || LucideIcons.HelpCircle;
    const colors = TIER_COLORS[tier];
    const shadowColor = TIER_SHADOWS[tier];
    const pathData = SHAPES[shape](size);

    // Animation for unlock using React Native Animated
    const scale = useRef(new Animated.Value(isLocked ? 1 : 0)).current;

    useEffect(() => {
        if (!isLocked) {
            Animated.spring(scale, {
                toValue: 1,
                friction: 6,
                tension: 40,
                useNativeDriver: true,
            }).start();
        } else {
            scale.setValue(1);
        }
    }, [isLocked]);

    const animatedStyle = {
        transform: [{ scale }],
        opacity: isLocked ? 0.6 : 1,
    };

    // Skia animation for Cosmic tier using useState loop
    const [time, setTime] = useState(0);

    useEffect(() => {
        if (tier === 'cosmic' || tier === 'platinum' || tier === 'diamond') {
            let start = Date.now();
            let animationFrameId: number;

            const animate = () => {
                const now = Date.now();
                setTime((now - start) / 1000); // Time in seconds
                animationFrameId = requestAnimationFrame(animate);
            };

            animate();

            return () => {
                cancelAnimationFrame(animationFrameId);
            };
        }
    }, [tier]);

    const uniforms = {
        resolution: [size, size],
        time: time,
    };

    return (
        <Animated.View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, animatedStyle]}>
            <Canvas style={{ width: size, height: size, position: 'absolute' }}>
                <Group>
                    {/* Main Fill */}
                    <Path path={pathData} color={colors[0]} style="fill">
                        <Shadow dx={0} dy={4} blur={8} color={shadowColor} />
                        {tier === 'cosmic' ? (
                            <RuntimeShader source={COSMIC_SHADER} uniforms={uniforms} />
                        ) : tier === 'platinum' ? (
                            <RuntimeShader source={HOLOGRAPHIC_SHADER} uniforms={uniforms} />
                        ) : tier === 'diamond' ? (
                            <RuntimeShader source={DIAMOND_SHADER} uniforms={uniforms} />
                        ) : (
                            <LinearGradient
                                start={vec(0, 0)}
                                end={vec(size, size)}
                                colors={colors}
                            />
                        )}
                    </Path>

                    {/* Metallic Border */}
                    <Path
                        path={pathData}
                        style="stroke"
                        strokeWidth={size * 0.08}
                        strokeJoin="round"
                        strokeCap="round"
                    >
                        <LinearGradient
                            start={vec(0, 0)}
                            end={vec(size, size)}
                            colors={[
                                tier === 'bronze' ? '#CD7F32' : tier === 'silver' ? '#E0E0E0' : tier === 'gold' ? '#FFD700' : '#E0E0E0',
                                '#FFF',
                                tier === 'bronze' ? '#8B4513' : tier === 'silver' ? '#A0A0A0' : tier === 'gold' ? '#B8860B' : '#A0A0A0',
                            ]}
                            positions={[0, 0.5, 1]}
                        />
                    </Path>

                    {/* Inner Bevel/Highlight */}
                    <Path
                        path={pathData}
                        style="stroke"
                        strokeWidth={size * 0.02}
                        color="rgba(255,255,255,0.5)"
                        strokeJoin="round"
                    />
                </Group>
            </Canvas>

            {/* Icon Overlay */}
            <View style={{ opacity: isLocked ? 0.5 : 0.9 }}>
                <LucideIcon
                    size={size * 0.4}
                    color={isLocked ? '#888' : (tier === 'silver' || tier === 'platinum' || tier === 'diamond' ? '#333' : '#FFF')}
                    strokeWidth={2.5}
                />
            </View>

            {/* Locked Overlay / Progress */}
            {isLocked && (
                <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: size / 2 }]}>
                    {/* Could add a lock icon here if needed, but the dimmed look works */}
                </View>
            )}
        </Animated.View>
    );
};
