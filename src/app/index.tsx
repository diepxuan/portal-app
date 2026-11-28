/**
 * Màn hình khởi đầu — rẽ nhánh theo trạng thái đăng nhập.
 *
 * Chưa đăng nhập → chuyển sang /login
 * Đang đăng nhập → hiển thị dashboard khung (chờ API nghiệp vụ)
 *
 * Chưa có dữ liệu thật vì Portal chưa mở API (docs/API-CONTRACT.md §1).
 * KHÔNG hiển thị số liệu giả.
 */

import { Redirect } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/PrimaryButton';
import { useAuth } from '@/hooks/useAuth';
import { colors, fontSize, fontWeight, radius, spacing } from '@/tokens';

export default function HomeScreen() {
  const { user, restoring, companyId, year, signOut } = useAuth();

  // Đọc secure store là async — chưa biết trạng thái thì chưa được điều hướng.
  if (restoring) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.loadingText}>Đang kiểm tra phiên đăng nhập…</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  const company = user.companies.find((item) => item.ma_cty === companyId);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Diepxuan</Text>
          <Text style={styles.title}>Xin chào, {user.name}</Text>
          <Text style={styles.subtitle}>{user.email}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ngữ cảnh làm việc</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Công ty</Text>
            <Text style={styles.rowValue}>
              {company ? `${company.ten_cty} (${company.ma_cty})` : '—'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Năm</Text>
            <Text style={styles.rowValue}>{year}</Text>
          </View>
          <Text style={styles.hint}>
            Hai giá trị này được gửi kèm mọi request qua header X-Company-Id và X-Year.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Chưa có dữ liệu nghiệp vụ</Text>
          <Text style={styles.cardBody}>
            Portal chưa mở endpoint danh mục và báo cáo. App không hiển thị số liệu
            giả — khi API có, màn hình này thay bằng dashboard thật.
          </Text>
        </View>

        <PrimaryButton label="Đăng xuất" onPress={signOut} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.neutral,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.neutral,
  },
  loadingText: {
    fontSize: fontSize.sm,
    color: colors.secondary,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.lg,
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
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.secondary,
  },
  cardBody: {
    fontSize: fontSize.sm,
    color: colors.onSurface,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowLabel: {
    fontSize: fontSize.sm,
    color: colors.secondary,
  },
  rowValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.onSurface,
    flexShrink: 1,
    textAlign: 'right',
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.secondary,
    lineHeight: 18,
  },
});
