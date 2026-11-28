/**
 * Ô nhập liệu dùng chung — style theo token Portal.
 *
 * RN 0.88 không còn cho `forwardRef<TextInput>` (TextInput là function component).
 * Cách đúng: nhận prop `ref` kiểu `TextInputInstance` và truyền xuống TextInput.
 */

import { StyleSheet, Text, TextInput, View, type TextInputInstance, type TextInputProps } from 'react-native';
import type { Ref } from 'react';

import { colors, fontSize, fontWeight, radius, spacing } from '@/tokens';

interface TextFieldProps extends TextInputProps {
  label: string;
  /** Thông báo lỗi dưới field — hiển thị màu error theo DESIGN.md */
  errorText?: string;
  ref?: Ref<TextInputInstance>;
}

export function TextField({ label, errorText, style, ref, ...inputProps }: TextFieldProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        ref={ref}
        style={[styles.input, errorText ? styles.inputError : null, style]}
        placeholderTextColor={colors.secondary}
        {...inputProps}
      />
      {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.onSurface,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.sm,
    color: colors.onSurface,
    minHeight: 44,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: fontSize.xs,
    color: colors.error,
  },
});
