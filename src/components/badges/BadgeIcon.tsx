import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Canvas, Path, LinearGradient, vec, Shadow, Group, RuntimeShader } from '@shopify/react-native-skia';
import * as LucideIcons from 'lucide-react-native';
import { BadgeShape, BadgeTier } from '../../types/badges';
import { TIER_COLORS, TIER_SHADOWS, COSMIC_SHADER, HOLOGRAPHIC_SHADER, DIAMOND_SHADER } from '../../assets/shaders/badgeShaders';

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
        const r = s / 2;
        return `M ${r} 0 A ${r} ${r} 0 1 1 ${r} ${s} A ${r} ${r} 0 1 1 ${r} 0 Z`;
    },
    hexagon: (s) => {
        // User requested hexagon to be replaced with circle
        const r = s / 2;
        return `M ${r} 0 A ${r} ${r} 0 1 1 ${r} ${s} A ${r} ${r} 0 1 1 ${r} 0 Z`;
    },
    diamond: (s) => {
        const r = s / 2;
        const cornerRadius = s * 0.1;
        return `
            M ${r} ${cornerRadius}
            Q ${r} 0 ${r + cornerRadius} ${cornerRadius}
            L ${s - cornerRadius} ${r - cornerRadius}
            Q ${s} ${r} ${s - cornerRadius} ${r + cornerRadius}
            L ${r + cornerRadius} ${s - cornerRadius}
            Q ${r} ${s} ${r - cornerRadius} ${s - cornerRadius}
            L ${cornerRadius} ${r + cornerRadius}
            Q 0 ${r} ${cornerRadius} ${r - cornerRadius}
            Z
        `;
    },
    shield: (s) => {
        // Rounded Shield
        return `
            M ${s * 0.5} 0
            L ${s - 10} ${s * 0.25}
            V ${s * 0.5}
            C ${s - 10} ${s * 0.8} ${s * 0.75} ${s * 0.9} ${s * 0.5} ${s}
            C ${s * 0.25} ${s * 0.9} 10 ${s * 0.8} 10 ${s * 0.5}
            V ${s * 0.25}
            Z
        `;
    },
    star: (s) => {
        // Rounded Star
        const cx = s / 2;
        const cy = s / 2;
        const outerRadius = s / 2;
        const innerRadius = s / 4;
        let path = "";
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const x = cx + outerRadius * Math.cos(angle);
            const y = cy + outerRadius * Math.sin(angle);

            // Inner point
            const nextAngle = ((i + 1) * 4 * Math.PI) / 5 - Math.PI / 2;
            const midAngle = (angle + nextAngle) / 2; // Actually this logic is for 5-point star skipping vertices
            // Let's use a simpler standard star logic but round it

            // Standard 5-point star vertices
            const a1 = (i * 2 * Math.PI) / 5 - Math.PI / 2;
            const x1 = cx + outerRadius * Math.cos(a1);
            const y1 = cy + outerRadius * Math.sin(a1);

            const a2 = ((i * 2 + 1) * Math.PI) / 5 - Math.PI / 2;
            const x2 = cx + innerRadius * Math.cos(a2);
            const y2 = cy + innerRadius * Math.sin(a2);

            if (i === 0) {
                path += `M ${x1} ${y1}`;
            } else {
                path += `L ${x1} ${y1}`;
            }
            path += `L ${x2} ${y2}`;
        }
        path += "Z";
        // Note: True rounded star path is complex, using standard star for now but will add corner rounding via strokeJoin="round"
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
