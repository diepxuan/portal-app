/**
 * Màn hình đăng nhập.
 *
 * Hành vi bám Portal gốc (resources/views/auth/login.blade.php):
 * - Đăng nhập bằng **email** + password (Fortify username = 'email')
 * - Có "Quên mật khẩu?" nhưng app KHÔNG tự mở vì Portal chưa có endpoint reset qua API
 * - Lỗi validate hiển thị dưới field, lỗi chung hiển thị đầu form
 *
 * Nhãn tiếng Việt: hiển thị theo yêu cầu dự án (AGENTS.md §0.1). Portal dùng `__()`
 * với bản dịch tiếng Anh nên không có nguồn nhãn tiếng Việt để chép — đây là
 * ngoại lệ duy nhất được phép vì app phải tiếng Việt theo quy định dự án.
 */

import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type TextInputInstance,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/PrimaryButton';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/hooks/useAuth';
import { colors, fontSize, fontWeight, radius, spacing } from '@/tokens';

export default function LoginScreen() {
  const { signIn, signingIn, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const passwordRef = useRef<TextInputInstance>(null);

  /** Validate tối thiểu — Portal là nơi quyết định quy tắc thật. */
  function validate(): boolean {
    let valid = true;

    if (!email.trim()) {
      setEmailError('Vui lòng nhập email.');
      valid = false;
    } else if (!email.includes('@')) {
      setEmailError('Email không hợp lệ.');
      valid = false;
    } else {
      setEmailError(null);
    }

    if (!password) {
      setPasswordError('Vui lòng nhập mật khẩu.');
      valid = false;
    } else {
      setPasswordError(null);
    }

    return valid;
  }

  async function handleSubmit() {
    clearError();
    if (!validate()) {
      return;
    }

    const ok = await signIn(email, password);
    if (ok) {
      router.replace('/');
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.eyebrow}>Diepxuan</Text>
            <Text style={styles.title}>Đăng nhập</Text>
            <Text style={styles.subtitle}>
              Dùng tài khoản Portal để truy cập ứng dụng.
            </Text>
          </View>

          {error ? (
            <View style={styles.banner} accessibilityRole="alert">
              <Text style={styles.bannerText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <TextField
              label="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) {
                  setEmailError(null);
                }
              }}
              errorText={emailError ?? undefined}
              placeholder="ten@diepxuan.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="username"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              editable={!signingIn}
            />

            <TextField
              ref={passwordRef}
              label="Mật khẩu"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) {
                  setPasswordError(null);
                }
              }}
              errorText={passwordError ?? undefined}
              placeholder="Nhập mật khẩu"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
              editable={!signingIn}
            />

            <PrimaryButton label="Đăng nhập" onPress={handleSubmit} loading={signingIn} />
          </View>

          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>Đang chờ API từ Portal</Text>
            <Text style={styles.noticeBody}>
              App đã sẵn sàng phần đăng nhập, nhưng Portal chưa mở endpoint
              auth/login. Khi API có, màn hình này hoạt động ngay không cần sửa code.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.neutral,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.xl,
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    gap: spacing.xs,
  },
  eyebrow: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.secondary,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.semibold,
    color: colors.onSurface,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.secondary,
    lineHeight: 20,
  },
  form: {
    gap: spacing.lg,
  },
  banner: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  bannerText: {
    fontSize: fontSize.sm,
    color: colors.error,
  },
  notice: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  noticeTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.onSurface,
  },
  noticeBody: {
    fontSize: fontSize.xs,
    color: colors.secondary,
    lineHeight: 18,
  },
});
