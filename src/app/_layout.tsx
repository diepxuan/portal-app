import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

/**
 * Root navigator của portal-app.
 *
 * Mọi route nằm trong src/app/. Thêm screen = thêm file, không cần khai báo tay.
 * Header được ẩn ở cấp root; từng nhóm route tự bật header khi cần.
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
