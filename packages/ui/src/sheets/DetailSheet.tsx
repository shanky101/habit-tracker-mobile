import React, { ReactNode } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    Dimensions,
} from 'react-native';
import { useTheme } from '@app-core/theme';
import { X } from 'lucide-react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================
// TYPES
// ============================================

export type SheetHeight = 'half' | 'tall' | 'full' | number;

export interface DetailSheetProps {
    visible: boolean;
    onClose: () => void;

    // Header
    title: string;
    subtitle?: string;
    renderHeaderRight?: () => ReactNode;

    // Content
    renderSummary?: () => ReactNode;
    renderContent: () => ReactNode;

    // Configuration
    height?: SheetHeight;
    backgroundColor?: string;
    showCloseButton?: boolean;
}

// ============================================
// COMPONENT
// ============================================

export const DetailSheet: React.FC<DetailSheetProps> = ({
    visible,
    onClose,
    title,
    subtitle,
    renderHeaderRight,
    renderSummary,
    renderContent,
    height = 'tall',
    backgroundColor,
    showCloseButton = true,
}) => {
    const { theme } = useTheme();

    // Calculate sheet height
    const getSheetHeight = (): number => {
        if (typeof height === 'number') return height;

        switch (height) {
            case 'half':
                return SCREEN_HEIGHT * 0.5;
            case 'tall':
                return SCREEN_HEIGHT * 0.7;
            case 'full':
                return SCREEN_HEIGHT * 0.95;
            default:
                return SCREEN_HEIGHT * 0.7;
        }
    };

    const sheetHeight = getSheetHeight();

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.backdrop}
                    onPress={onClose}
                    activeOpacity={1}
                />

                <View
                    style={[
                        styles.sheet,
                        {
                            backgroundColor: backgroundColor || theme.colors.surface,
                            height: sheetHeight,
                        }
                    ]}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Text
                                style={[
                                    styles.title,
                                    {
                                        color: theme.colors.text,
                                        fontFamily: theme.typography.fontFamilyDisplayBold,
                                        fontSize: theme.typography.fontSizeXL,
                                    },
                                ]}
                            >
                                {title}
                            </Text>
                            {subtitle && (
                                <Text
                                    style={[
                                        styles.subtitle,
                                        {
                                            color: theme.colors.textSecondary,
                                            fontFamily: theme.typography.fontFamilyBody,
                                            fontSize: theme.typography.fontSizeSM,
                                        },
                                    ]}
                                >
                                    {subtitle}
                                </Text>
                            )}
                        </View>

                        {renderHeaderRight ? (
                            renderHeaderRight()
                        ) : showCloseButton ? (
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <X size={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        ) : null}
                    </View>

                    {/* Summary Card (optional) */}
                    {renderSummary && (
                        <View style={styles.summaryContainer}>
                            {renderSummary()}
                        </View>
                    )}

                    {/* Content */}
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {renderContent()}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    headerLeft: {
        flex: 1,
    },
    title: {
        marginBottom: 4,
    },
    subtitle: {
        marginTop: 4,
    },
    closeButton: {
        padding: 4,
        marginLeft: 16,
    },
    summaryContainer: {
        marginBottom: 24,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
});

export default DetailSheet;
