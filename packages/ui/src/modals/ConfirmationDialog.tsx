import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Animated,
} from 'react-native';
import { useTheme } from '@app-core/theme';

// ============================================
// CONFIRMATION DIALOG
// ============================================
export interface ConfirmationDialogProps {
    visible: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    destructive?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    visible,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    destructive = false,
    onConfirm,
    onCancel,
}) => {
    const { theme } = useTheme();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.9);
        }
    }, [visible, fadeAnim, scaleAnim]);

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onCancel}>
            <Animated.View
                style={[
                    styles.dialogOverlay,
                    { backgroundColor: 'rgba(0,0,0,0.5)', opacity: fadeAnim },
                ]}
            >
                <Animated.View
                    style={[
                        styles.dialogContent,
                        {
                            backgroundColor: theme.colors.surface,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.dialogTitle,
                            {
                                color: theme.colors.text,
                                fontFamily: theme.typography.fontFamilyDisplayBold,
                                fontSize: theme.typography.fontSizeLG,
                            },
                        ]}
                    >
                        {title}
                    </Text>
                    <Text
                        style={[
                            styles.dialogMessage,
                            {
                                color: theme.colors.textSecondary,
                                fontFamily: theme.typography.fontFamilyBody,
                                fontSize: theme.typography.fontSizeSM,
                                lineHeight: theme.typography.fontSizeSM * theme.typography.lineHeightRelaxed,
                            },
                        ]}
                    >
                        {message}
                    </Text>
                    <View style={styles.dialogActions}>
                        <TouchableOpacity
                            style={[styles.dialogButton, { borderColor: theme.colors.border }]}
                            onPress={onCancel}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.dialogButtonText,
                                    {
                                        color: theme.colors.textSecondary,
                                        fontFamily: theme.typography.fontFamilyBodyMedium,
                                        fontSize: theme.typography.fontSizeMD,
                                    },
                                ]}
                            >
                                {cancelText}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.dialogButton,
                                {
                                    backgroundColor: destructive ? theme.colors.error : theme.colors.primary,
                                    borderWidth: 0,
                                },
                            ]}
                            onPress={onConfirm}
                            activeOpacity={0.8}
                        >
                            <Text
                                style={[
                                    styles.dialogButtonText,
                                    {
                                        color: theme.colors.white,
                                        fontFamily: theme.typography.fontFamilyBodySemibold,
                                        fontSize: theme.typography.fontSizeMD,
                                    },
                                ]}
                            >
                                {confirmText}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    dialogOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    dialogContent: {
        width: '100%',
        maxWidth: 300,
        borderRadius: 16,
        padding: 24,
    },
    dialogTitle: {
        textAlign: 'center',
        marginBottom: 8,
    },
    dialogMessage: {
        textAlign: 'center',
        marginBottom: 24,
    },
    dialogActions: {
        flexDirection: 'row',
        gap: 12,
    },
    dialogButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: 'center',
    },
    dialogButtonText: {},
});

export default ConfirmationDialog;
