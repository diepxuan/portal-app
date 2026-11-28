/**
 * Nút action chính — theo DESIGN.md: chỉ một primary action nổi bật mỗi màn hình,
 * màu blue-600, weight tối đa semibold (600).
 */

import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors, fontSize, fontWeight, radius, spacing } from '@/tokens';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function PrimaryButton({ label, onPress, disabled, loading }: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        isDisabled && styles.buttonDisabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.surface} />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  // Mobile không có hover — dùng pressed state theo DESIGN-TOKENS.md §4
  buttonPressed: {
    backgroundColor: colors.primaryHover,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  label: {
    color: colors.surface,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});
