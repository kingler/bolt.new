import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProjectConfig, Framework, UILibrary, Database, LLMProvider, OpenAIModel } from '../types/config';

const defaultConfig: ProjectConfig = {
  framework: Framework.NextJS,
  uiLibrary: UILibrary.ShadcnUI,
  database: Database.Supabase,
  llmProvider: LLMProvider.OpenAI,
  llmModel: OpenAIModel.O1Preview,
};

const ConfigContext = createContext<{
  config: ProjectConfig;
  updateConfig: (newConfig: Partial<ProjectConfig>) => void;
}>({
  config: defaultConfig,
  updateConfig: () => {},
});

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<ProjectConfig>(defaultConfig);

  useEffect(() => {
    const storedConfig = localStorage.getItem('projectConfig');
    if (storedConfig) {
      setConfig(JSON.parse(storedConfig));
    }
  }, []);

  const updateConfig = (newConfig: Partial<ProjectConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    localStorage.setItem('projectConfig', JSON.stringify(updatedConfig));
  };

  return (
    <ConfigContext.Provider value={{ config, updateConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};
