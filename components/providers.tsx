'use client';

import React from 'react';
import { HardwareStoreProvider } from '@/lib/store';

export function Providers({ children }: { children: React.ReactNode }) {
  return <HardwareStoreProvider>{children}</HardwareStoreProvider>;
}

