import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { UiLibrary } from '~/types/library';
import { ErrorBoundary } from 'react-error-boundary';

interface UiContextProps {
  selectedLibrary: UiLibrary;
  setSelectedLibrary: React.Dispatch<React.SetStateAction<UiLibrary>>;
}

export const UiContext = createContext<UiContextProps | undefined>(undefined);

interface UiProviderProps {
  children: ReactNode;
}

export function UiProvider({ children }: UiProviderProps) {
  const [selectedLibrary, setSelectedLibrary] = useState<UiLibrary>(UiLibrary.Shadcn);

  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <UiContext.Provider value={{ selectedLibrary, setSelectedLibrary }}>{children}</UiContext.Provider>
    </ErrorBoundary>
  );
}

export const useUi = (): UiContextProps => {
  const context = useContext(UiContext);

  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }

  return context;
};
