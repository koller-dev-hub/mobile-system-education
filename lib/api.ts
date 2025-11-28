import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const getBaseURL = () =>
  Platform.select({
    ios: 'https://08054cfe4f24.ngrok-free.app',
    android: 'http://10.0.2.2:8080',
    default: 'https://08054cfe4f24.ngrok-free.app',
  }) as string;

type Options = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeoutMs?: number;
  auth?: boolean;
};

async function apiFetch(path: string, opts: Options = {}) {
  const baseURL = getBaseURL();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? 10000);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
  };

  if (opts.auth !== false) {
    const token = await AsyncStorage.getItem('auth:token');
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const body =
    opts.body !== undefined && headers['Content-Type'] === 'application/json'
      ? JSON.stringify(opts.body)
      : opts.body;

  const res = await fetch(`${baseURL}${path}`, {
    method: opts.method ?? 'GET',
    headers,
    body,
    signal: controller.signal,
  });
  clearTimeout(timeout);

  let data: any = null;
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  } else {
    try {
      data = await res.text();
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `HTTP ${res.status}`;
    throw new Error(typeof msg === 'string' ? msg : 'Erro na requisição');
  }

  return data;
}

export const api = {
  get: (path: string, opts?: Options) =>
    apiFetch(path, { ...(opts || {}), method: 'GET' }),
  post: (path: string, body?: any, opts?: Options) =>
    apiFetch(path, { ...(opts || {}), method: 'POST', body }),
  put: (path: string, body?: any, opts?: Options) =>
    apiFetch(path, { ...(opts || {}), method: 'PUT', body }),
  patch: (path: string, body?: any, opts?: Options) =>
    apiFetch(path, { ...(opts || {}), method: 'PATCH', body }),
  del: (path: string, opts?: Options) =>
    apiFetch(path, { ...(opts || {}), method: 'DELETE' }),
};
