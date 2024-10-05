import { memo } from 'react';
import { Markdown } from './Markdown';

interface AssistantMessageProps {
  content: string;
}

/**
 * AssistantMessage component renders messages from the assistant.
 * It uses the Markdown component to render the content as HTML.
 * /
 /**
 * @param {AssistantMessageProps} props - The properties for the AssistantMessage component.
 * @param {string} props.content - The content of the assistant's message.
 * @returns {JSX.Element} The rendered AssistantMessage component.
 */
export const AssistantMessage = memo(({ content }: AssistantMessageProps) => {
  return (
    <div className="overflow-hidden w-full">
      <Markdown html>{content}</Markdown>
    </div>
  );
});
