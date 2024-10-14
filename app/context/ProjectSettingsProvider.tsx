import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { UiLibrary } from '../types/library';

export type Language = 'JavaScript' | 'TypeScript' | 'Python';
export type Framework = 'React' | 'Vue' | 'Angular' | 'Svelte' | 'None';
export type Database = 'MongoDB' | 'PostgreSQL' | 'MySQL' | 'SQLite' | 'None';
export type LLM = 'GPT-3.5' | 'GPT-4' | 'Claude' | 'Auto';

interface ProjectSettings {
  language: Language;
  framework: Framework;
  uiLibrary: UiLibrary;
  database: Database;
  llm: LLM;
}

interface ProjectSettingsContextProps {
  settings: ProjectSettings;
  updateSettings: (newSettings: Partial<ProjectSettings>) => void;
}

const defaultSettings: ProjectSettings = {
  language: 'JavaScript',
  framework: 'React',
  uiLibrary: UiLibrary.Shadcn,
  database: 'None',
  llm: 'Auto',
};

export const ProjectSettingsContext = createContext<ProjectSettingsContextProps | undefined>(undefined);

interface ProjectSettingsProviderProps {
  children: ReactNode;
}

export function ProjectSettingsProvider({ children }: ProjectSettingsProviderProps) {
  const [settings, setSettings] = useState<ProjectSettings>(defaultSettings);

  const updateSettings = (newSettings: Partial<ProjectSettings>) => {
    setSettings((prevSettings) => ({ ...prevSettings, ...newSettings }));
  };

  return (
    <ProjectSettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </ProjectSettingsContext.Provider>
  );
}

export const useProjectSettings = (): ProjectSettingsContextProps => {
  const context = useContext(ProjectSettingsContext);

  if (context === undefined) {
    throw new Error('useProjectSettings must be used within a ProjectSettingsProvider');
  }

  return context;
};
