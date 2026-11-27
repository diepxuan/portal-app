import { ScrollView, StyleSheet, Text, View } from 'react-native';

/**
 * Màn hình khởi đầu.
 *
 * Trạng thái hiện tại: Portal CHƯA mở API cho app (xem docs/API-CONTRACT.md),
 * nên màn hình này chỉ hiển thị khung — KHÔNG có dữ liệu giả.
 *
 * Khi có API: thay phần thân bằng dashboard thật, lấy dữ liệu qua src/api/.
 */
export default function HomeScreen() {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Diepxuan</Text>
        <Text style={styles.title}>Portal App</Text>
        <Text style={styles.subtitle}>
          Ứng dụng di động cho hệ thống Portal.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Chưa kết nối API</Text>
        <Text style={styles.cardBody}>
          Portal chưa mở endpoint cho ứng dụng. Cần có auth, context công ty/năm và
          danh sách endpoint trước khi dựng màn hình nghiệp vụ.
        </Text>
        <Text style={styles.cardHint}>Xem docs/API-CONTRACT.md</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Nguyên tắc</Text>
        <Text style={styles.cardBody}>
          Ứng dụng không định nghĩa nghiệp vụ. Tên bảng, stored procedure, tên field
          và nhãn tiếng Việt đều phải lấy từ repo Portal và simba-docs.
        </Text>
        <Text style={styles.cardHint}>Xem docs/PORTAL-REFERENCE.md</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  header: {
    gap: 4,
    paddingTop: 12,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#6b7280',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 15,
    color: '#4b5563',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 21,
    color: '#374151',
  },
  cardHint: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
});
