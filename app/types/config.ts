export enum Framework {
  Auto = 'Auto',
  NextJS = 'Next.js',
  ReactJS = 'React.js',
  VueJS = 'Vue.js',
  Python = 'Python',
}

export enum UILibrary {
  None = 'None',
  ShadcnUI = 'Shadcn UI',
  NextUI = 'NextUI',
  Flowbite = 'Flowbite',
}

export enum Database {
  None = 'None',
  SQLite = 'SQL Light',
  Supabase = 'Supabase',
  Firebase = 'Firebase',
  MongoDB = 'MongoDB',
}

export enum LLMProvider {
  OpenAI = 'OpenAI',
  Anthropic = 'Anthropic',
}

export enum OpenAIModel {
  O1Preview = 'o1 Preview',
  O1Mini = 'o1 mini',
  GPT4O = 'GPT-4o',
  GPT4OMini = 'GPT-4o Mini',
}

export enum AnthropicModel {
  Claude35Sonnet = 'Claude 3.5 Sonnet',
  ClaudeHiku = 'Claude Hiku',
}

export interface ProjectConfig {
  framework: Framework;
  uiLibrary: UILibrary;
  database: Database;
  llmProvider: LLMProvider;
  llmModel: OpenAIModel | AnthropicModel;
}
