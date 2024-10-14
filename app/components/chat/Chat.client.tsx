import React, { useCallback, useState, useEffect, useRef, memo } from 'react';
import { useStore } from '@nanostores/react';
import { useChat } from 'ai/react';
import { toast, ToastContainer } from 'react-toastify';
import { useMessageParser, usePromptEnhancer, useShortcuts, useSnapScroll } from '~/lib/hooks';
import { useChatHistory } from '~/lib/persistence';
import { chatStore } from '~/lib/stores/chat';
import { workbenchStore } from '~/lib/stores/workbench';
import { fileModificationsToHTML } from '~/utils/diff';
import { createScopedLogger } from '~/utils/logger';
import { BaseChat } from './BaseChat';
import { Menu } from '~/components/sidebar/Menu.client';
import { CheckCircle } from 'lucide-react';

const logger = createScopedLogger('Chat');

const ChatToast = memo(() => (
  <ToastContainer
    closeButton={({ closeToast }) => (
      <button className="Toastify__close-button" onClick={closeToast} aria-label="Close notification">
        <div className="i-ph:x text-lg" aria-hidden="true" />
      </button>
    )}
    icon={({ type }) => {
      switch (type) {
        case 'success': {
          return <CheckCircle />; // Use Lucide CheckCircle icon
        }
        // Add other cases as needed
        default: {
          return null;
        }
      }
    }}
    position="bottom-right"
    pauseOnFocusLoss
  />
));

ChatToast.displayName = 'ChatToast';

export const Chat: React.FC = () => {
  const { ready, initialMessages, storeMessageHistory } = useChatHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { showChat } = useStore(chatStore);
  const { enhancingPrompt, promptEnhanced, enhancePrompt, resetEnhancer } = usePromptEnhancer();
  const { parsedMessages, parseMessages } = useMessageParser();
  const [messageRef, scrollRef] = useSnapScroll();

  useShortcuts();

  const { messages, handleInputChange, stop, append } = useChat({
    api: '/api/chat',
    onError: (error: Error) => {
      logger.error('Request failed\n\n', error);
      toast.error('There was an error processing your request');
    },
    onFinish: () => {
      logger.debug('Finished streaming');
    },
    initialMessages,
  });

  useEffect(() => {
    chatStore.setKey('started', initialMessages.length > 0);
  }, [initialMessages.length]);

  useEffect(() => {
    parseMessages(messages, isLoading);

    if (messages.length > initialMessages.length) {
      storeMessageHistory(messages).catch((error: Error) => toast.error(error.message));
    }
  }, [messages, isLoading, parseMessages, storeMessageHistory, initialMessages.length]);

  useEffect(() => {
    if (ready) {
      logger.debug('Chat history is ready');
    }
  }, [ready]);

  const scrollTextArea = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, []);

  const abort = useCallback(() => {
    stop();
    chatStore.setKey('aborted', true);
    workbenchStore.abortAllActions();
  }, [stop]);

  const sendMessage = useCallback(
    async (event: React.UIEvent, messageInput?: string) => {
      const inputToUse = messageInput || input;

      if (inputToUse.length === 0 || isLoading) {
        return;
      }

      setIsLoading(true);

      try {
        await workbenchStore.saveAllFiles();
        const fileModifications = workbenchStore.getFileModifcations();
        chatStore.setKey('aborted', false);

        if (fileModifications) {
          const diff = fileModificationsToHTML(fileModifications);
          append({ role: 'user', content: `${diff}\n\n${inputToUse}` });
          workbenchStore.resetAllFileModifications();
        } else {
          append({ role: 'user', content: inputToUse });
        }

        setInput('');
        resetEnhancer();
        textareaRef.current?.blur();
      } catch (error) {
        logger.error('Error sending message:', error);
        toast.error('Failed to send message');
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, append, resetEnhancer],
  );

  return (
    <>
      <div className="chat-container">
        <Menu />
        <BaseChat
          textareaRef={textareaRef}
          input={input}
          showChat={showChat}
          chatStarted={initialMessages.length > 0}
          isStreaming={isLoading}
          enhancingPrompt={enhancingPrompt}
          promptEnhanced={promptEnhanced}
          sendMessage={sendMessage}
          messageRef={messageRef}
          scrollRef={scrollRef}
          handleInputChange={handleInputChange}
          handleStop={abort}
          messages={messages.map((message, i) =>
            message.role === 'user' ? message : { ...message, content: parsedMessages[i] || '' }
          )}
          enhancePrompt={() => {
            enhancePrompt(input, (newInput) => {
              setInput(newInput);
              scrollTextArea();
            });
          }}
        />
      </div>
      <ChatToast />
    </>
  );
};
