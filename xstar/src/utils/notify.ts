import { Toast } from 'antd-mobile';

export function showError(message: string, duration = 2000) {
  Toast.show({ content: message, duration });
}

export function showSuccess(message: string, duration = 1500) {
  Toast.show({ content: message, duration });
}

export function showInfo(message: string, duration = 1500) {
  Toast.show({ content: message, duration });
}

export function formatApiError(e: unknown, fallback = '请求失败') {
  if (typeof e === 'string') return e || fallback;
  if (e && typeof e === 'object' && 'message' in e) {
    const msg = (e as { message?: unknown }).message;
    if (typeof msg === 'string') return msg || fallback;
    if (msg == null) return fallback;
    return String(msg);
  }
  return fallback;
}
