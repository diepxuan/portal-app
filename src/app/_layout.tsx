import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/hooks/useAuth';

/**
 * Root navigator của portal-app.
 *
 * AuthProvider bọc ngoài Stack để mọi screen đọc được phiên đăng nhập.
 * Header ẩn ở cấp root; từng nhóm route tự bật khi cần.
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }} />
        <StatusBar style="auto" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
