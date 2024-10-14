import { useUi } from './UiProvider';
import { ClientOnly } from 'remix-utils/client-only';

export function withUiContext<T extends { uiContext: ReturnType<typeof useUi> }>(
  WrappedComponent: React.ComponentType<T>
) {
  return function WithUiContext(props: Omit<T, 'uiContext'>) {
    return (
      <ClientOnly fallback={<div>Loading...</div>}>
        {() => {
          const uiContext = useUi();
          if (!uiContext) {
            throw new Error('withUiContext must be used within a UIProvider');
          }
          return <WrappedComponent {...(props as T)} uiContext={uiContext} />;
        }}
      </ClientOnly>
    );
  };
}
