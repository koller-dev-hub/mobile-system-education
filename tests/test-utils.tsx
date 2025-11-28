import { render } from '@testing-library/react-native';
import React, { PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function Providers({ children }: PropsWithChildren) {
  const initialMetrics = {
    frame: { x: 0, y: 0, width: 360, height: 640 },
    insets: { top: 0, bottom: 0, left: 0, right: 0 },
  } as any;
  return (
    <SafeAreaProvider initialMetrics={initialMetrics}>
      {children}
    </SafeAreaProvider>
  );
}

export function renderWithProviders(ui: React.ReactElement) {
  return render(ui, { wrapper: Providers });
}
