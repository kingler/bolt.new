import React, { useState } from 'react';
import { useConfig } from '~/contexts/ConfigContext';
import { Framework, UILibrary, Database, LLMProvider, OpenAIModel, AnthropicModel } from '~/types/config';
import { toast } from 'react-toastify';
import { handleSubmit as submitComponentSelection } from '~/lib/.server/componentSelection';

const renderOption = (model: string) => (
  <option key={model} value={model}>
    {model}
  </option>
);

const ProjectSettings: React.FC = () => {
  const { config, updateConfig } = useConfig();
  const [appDescription, setAppDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (_uiLibrary: string, _appDescription: string) => {
    if (!_uiLibrary || !_appDescription) {
      toast.error('UI Library and App Description are required');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitComponentSelection(_uiLibrary, _appDescription);
      console.log('Submission result:', result);
      toast.success('App description submitted successfully');
    } catch (error) {
      console.error('Error submitting app description:', error);
      toast.error('Failed to submit app description');
    } finally {
    setIsSubmitting(false);
    }
  };

  const handleAppDescriptionSubmit = async () => {
    if (!appDescription.trim()) {
      toast.error('Please provide an app description');
      return;
    }

    setIsSubmitting(true);
    setIsSubmitting(true);

    try {
      const result = await handleSubmit(config.uiLibrary, appDescription);
      console.log('Submission result:', result);
      toast.success('App description submitted successfully');
    } catch (error) {
      console.error('Error submitting app description:', error);
      toast.error('Failed to submit app description');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="project-settings">
      <h2>Project Settings</h2>
      <div className="settings-row">
        <div className="setting">
          <label htmlFor="framework">Framework</label>
          <select
            id="framework"
            value={config.framework}
            onChange={(e) => updateConfig({ framework: e.target.value as Framework })}
          >
            {Object.values(Framework).map((framework) => (
              <option key={framework} value={framework}>
                {framework}
              </option>
            ))}
          </select>
        </div>
        <div className="setting">
          <label htmlFor="uiLibrary">UI Component Lib</label>
          <select
            id="uiLibrary"
            value={config.uiLibrary}
            onChange={(e) => updateConfig({ uiLibrary: e.target.value as UILibrary })}
          >
            {Object.values(UILibrary).map((library) => (
              <option key={library} value={library}>
                {library}
              </option>
            ))}
          </select>
        </div>
        <div className="setting">
          <label htmlFor="database">Database</label>
          <select
            id="database"
            value={config.database}
            onChange={(e) => updateConfig({ database: e.target.value as Database })}
          >
            {Object.values(Database).map((db) => (
              <option key={db} value={db}>
                {db}
              </option>
            ))}
          </select>
        </div>
        <div className="setting">
          <label htmlFor="llmProvider">LLM Provider</label>
          <select
            id="llmProvider"
            value={config.llmProvider}
            onChange={(e) => updateConfig({ llmProvider: e.target.value as LLMProvider })}
          >
            {Object.values(LLMProvider).map((provider) => (
              <option key={provider} value={provider}>
                {provider}
              </option>
            ))}
          </select>
        </div>
        <div className="setting">
          <label htmlFor="llmModel">LLM Model</label>
          <select
            id="llmModel"
            value={config.llmModel}
            onChange={(e) => updateConfig({ llmModel: e.target.value as OpenAIModel | AnthropicModel })}
          >
            {config.llmProvider === LLMProvider.OpenAI
              ? Object.values(OpenAIModel).map(renderOption)
              : Object.values(AnthropicModel).map(renderOption)}
          </select>
        </div>
      </div>
      <div className="app-description">
        <label htmlFor="appDescription">Describe your app...</label>
        <textarea
          id="appDescription"
          rows={5}
          value={appDescription}
          onChange={(e) => setAppDescription(e.target.value)}
          placeholder="Enter your app description here..."
        ></textarea>
        <div className="button-row">
          <button className="attach-files">Attach files</button>
          <button
            className="submit-button"
            onClick={handleAppDescriptionSubmit}
            disabled={isSubmitting || !appDescription.trim()}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectSettings;
