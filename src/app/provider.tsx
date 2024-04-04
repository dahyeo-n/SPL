'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { NextUIProvider } from '@nextui-org/react';

const queryClient = new QueryClient();

const QueryProvider = ({ children }: React.PropsWithChildren) => {
  return (
    <NextUIProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </NextUIProvider>
  );
};

export default QueryProvider;
