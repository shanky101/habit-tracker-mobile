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
        const r = s / 2;
        const w = r * Math.sqrt(3);
        // Pointy top hexagon
        return `
      M ${r} 0
      L ${r + w * 0.5} ${r * 0.5}
      L ${r + w * 0.5} ${r * 1.5}
      L ${r} ${s}
      L ${r - w * 0.5} ${r * 1.5}
      L ${r - w * 0.5} ${r * 0.5}
      Z
    `;
    },
    diamond: (s) => {
        const r = s / 2;
        return `M ${r} 0 L ${s} ${r} L ${r} ${s} L 0 ${r} Z`;
    },
    shield: (s) => {
        return `
      M ${s * 0.5} 0
      L ${s} ${s * 0.25}
      V ${s * 0.5}
      C ${s} ${s * 0.8} ${s * 0.75} ${s * 0.9} ${s * 0.5} ${s}
      C ${s * 0.25} ${s * 0.9} 0 ${s * 0.8} 0 ${s * 0.5}
      V ${s * 0.25}
      Z
    `;
    },
    star: (s) => {
        // Simplified star path
        const cx = s / 2;
        const cy = s / 2;
        const outerRadius = s / 2;
        const innerRadius = s / 4;
        let path = "";
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const x = cx + outerRadius * Math.cos(angle);
            const y = cy + outerRadius * Math.sin(angle);
            path += i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
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
                    <Path path={pathData} color={colors[0]}>
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

                    {/* Inner highlight/bevel */}
                    <Path
                        path={pathData}
                        style="stroke"
                        strokeWidth={size * 0.05}
                        color="rgba(255,255,255,0.3)"
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
