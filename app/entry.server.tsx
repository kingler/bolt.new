import type { AppLoadContext, EntryContext } from '@remix-run/cloudflare';
import { RemixServer } from '@remix-run/react';
import { isbot } from 'isbot';
import { renderToReadableStream } from 'react-dom/server';
import { renderHeadToString } from 'remix-island';
import { Head } from './root';
import { themeStore } from '~/lib/stores/theme';

/**
 * Handles the incoming request and generates the server-side rendered HTML response.
 *
 * Parameters:
 * request (Request): The incoming request object.
 * responseStatusCode (number): The initial status code for the response.
 * responseHeaders (Headers): The headers for the response.
 * remixContext (EntryContext): The context for the Remix server.
 * _loadContext (AppLoadContext): The context for the app load.
 *
 * Returns:
 * Promise<Response>: The generated HTML response.
 */
export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  _loadContext: AppLoadContext,
) {
  /**
   * Renders the Remix server-side application to a readable stream.
   *
   * Parameters:
   * <RemixServer> (JSX.Element): The Remix server component.
   * options (Object): Options for rendering the stream.
   * options.signal (AbortSignal): The signal to abort the rendering process.
   * options.onError (Function): The callback function to handle errors during rendering.
   *
   * Returns:
   * Promise<ReadableStream>: The readable stream containing the rendered HTML.
   */
  const readable = await renderToReadableStream(<RemixServer context={remixContext} url={request.url} />, {
    signal: request.signal,
    onError(error: unknown) {
      console.error(error);
      responseStatusCode = 500;
    },
  });

  /** Create a new ReadableStream to handle the response body */
  const body = new ReadableStream({
    start(controller) {
      /** Render the head section of the HTML */
      const head = renderHeadToString({ request, remixContext, Head });

      /** Enqueue the initial part of the HTML document */
      controller.enqueue(
        new Uint8Array(
          new TextEncoder().encode(
            `<!DOCTYPE html><html lang="en" data-theme="${themeStore.value}"><head>${head}</head><body><div id="root" class="w-full h-full">`,
          ),
        ),
      );

      /** Get a reader for the readable stream */
      const reader = readable.getReader();

      /** Function to read from the readable stream and enqueue the chunks */
      function read() {
        reader
          .read()
          .then(({ done, value }) => {
            if (done) {
              /** Enqueue the closing part of the HTML document and close the stream */
              controller.enqueue(new Uint8Array(new TextEncoder().encode(`</div></body></html>`)));
              controller.close();

              return;
            }

            /** Enqueue the current chunk and read the next one */
            controller.enqueue(value);
            read();
          })
          .catch((error) => {
            /** Handle any errors that occur during reading */
            controller.error(error);
            readable.cancel();
          });
      }
      read();
    },

    /** Handle stream cancellation */
    cancel() {
      readable.cancel();
    },
  });

  /** Check if the request is from a bot and wait for the stream to be ready if it is */
  if (isbot(request.headers.get('user-agent') || '')) {
    await readable.allReady;
  }

  /** Set the response headers */
  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');
  responseHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');

  /** Return the response with the generated HTML body and headers*/
  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
