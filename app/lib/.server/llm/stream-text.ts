import { streamText as _streamText, convertToCoreMessages } from 'ai';
import { getAPIKey } from '~/lib/.server/llm/api-key';
import { getAnthropicModel } from '~/lib/.server/llm/model';
import { MAX_TOKENS } from './constants';
import { getSystemPrompt } from './prompts';
import { generateUILibraryContext, selectUILibrary } from '~/lib/.server/generateUICode';
import type { UiLibrary } from '~/lib/.server/generateUICode';

interface ToolResult<Name extends string, Args, Result> {
  toolCallId: string;
  toolName: Name;
  args: Args;
  result: Result;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: ToolResult<string, unknown, unknown>[];
}

export type Messages = Message[];

export type StreamingOptions = Omit<Parameters<typeof _streamText>[0], 'model'>;

type ExtendedStreamingOptions = StreamingOptions & { uiLibrary?: UiLibrary };

export function streamText(messages: Messages, env: Env, options?: ExtendedStreamingOptions) {
  const selectedLibrary = selectUILibrary(options?.uiLibrary);
  const uiLibraryContext = generateUILibraryContext(selectedLibrary);
  const enhancedSystemPrompt = getSystemPrompt() + '\n\n' + uiLibraryContext;

  return _streamText({
    model: getAnthropicModel(getAPIKey(env)),
    system: enhancedSystemPrompt,
    maxTokens: MAX_TOKENS,
    headers: {
      'anthropic-beta': 'max-tokens-3-5-sonnet-2024-07-15',
    },
    messages: convertToCoreMessages(messages),
    ...options,
  });
}
