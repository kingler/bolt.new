import React from 'react';
import { ConfigProvider } from './contexts/ConfigContext';
import Chat from './components/chat/Chat';
// Import other existing components

const App: React.FC = () => {
  return (
    <ConfigProvider>
      <div className="app">
        <header>
          {/* Existing header content */}
        </header>
        <main>
          <Chat />
          {/* Other existing components */}
        </main>
      </div>
    </ConfigProvider>
  );
};

export default App;
