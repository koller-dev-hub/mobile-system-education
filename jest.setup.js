globalThis.__ExpoImportMetaRegistry = () => ({ moduleExports: {} });

jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));
jest.mock('expo', () => ({}));
if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = (val) => JSON.parse(JSON.stringify(val));
}
