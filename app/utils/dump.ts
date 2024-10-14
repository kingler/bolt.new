/**
 * This utility function simulates reading the dump.json file containing shadcn-ui component details.
 * In a real implementation, this would read an actual file or fetch data from an API.
 */
export async function dump(): Promise<string> {
  // simulated content of dump.json
  const dumpContent = JSON.stringify(
    {
      components: [
        {
          name: 'Button',
          description: 'A clickable button component with various styles and states.',
          props: ['variant', 'size', 'disabled'],
        },
        {
          name: 'Input',
          description: 'A text input component for collecting user input.',
          props: ['type', 'placeholder', 'disabled'],
        },
        {
          name: 'Card',
          description: 'A container component for grouping related content.',
          props: ['variant', 'className'],
        },
      ],
    },
    null,
    2,
  );

  // simulate an asynchronous operation
  await new Promise((resolve) => setTimeout(resolve, 100));

  return dumpContent;
}
