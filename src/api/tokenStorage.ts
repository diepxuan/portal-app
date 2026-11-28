/**
 * Lưu token an toàn theo nền tảng.
 *
 * Vì sao cần lớp bọc này:
 * - iOS/Android: expo-secure-store dùng Keychain / Keystore — đúng chuẩn cho token.
 * - Web: `expo-secure-store` export object RỖNG (xem ExpoSecureStore.web.js), nên
 *   `SecureStore.setItemAsync` sẽ gọi hàm không tồn tại và crash. Đã kiểm chứng
 *   bằng source thật, không phải suy đoán.
 *
 * Trên web trình duyệt không có vùng lưu trữ mã hoá tương đương Keychain, nên dùng
 * localStorage và chấp nhận rủi ro thấp hơn (token vẫn cần HTTPS). Đây là lựa chọn
 * có ý thức, không phải bỏ qua bảo mật.
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const WEB_PREFIX = 'portal_app:';

async function webGet(key: string): Promise<string | null> {
  if (typeof localStorage === 'undefined') {
    return null;
  }
  return localStorage.getItem(WEB_PREFIX + key);
}

async function webSet(key: string, value: string): Promise<void> {
  if (typeof localStorage === 'undefined') {
    return;
  }
  localStorage.setItem(WEB_PREFIX + key, value);
}

async function webDelete(key: string): Promise<void> {
  if (typeof localStorage === 'undefined') {
    return;
  }
  localStorage.removeItem(WEB_PREFIX + key);
}

export async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return webGet(key);
  }
  return SecureStore.getItemAsync(key);
}

export async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    await webSet(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    await webDelete(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
