import { z } from 'zod';
import nextUIDump from '~/lib/.server/nextui/dump.json';
import flowbiteDump from '~/lib/.server/flowbite/dump.json';
import shadcnDump from '~/lib/.server/shadcn-ui/dump.json';

const componentExampleSchema = z.object({
  source: z.string(),
  code: z.string(),
});
const componentSchema = z.object({
  name: z.string(),
  description: z.string(),
  docs: z.object({
    examples: z.array(componentExampleSchema),
  }),
});
const libraryDumpSchema = z.array(componentSchema);

// type ComponentExample = z.infer<typeof componentExampleSchema>;
export type Component = z.infer<typeof componentSchema>;
type LibraryDump = z.infer<typeof libraryDumpSchema>;

const libraries = ['nextui', 'flowbite', 'shadcn'] as const;
export type UiLibrary = (typeof libraries)[number];

const libraryDumps = {
  nextui: nextUIDump,
  flowbite: flowbiteDump,
  shadcn: shadcnDump,
} as const;

/**
 * Retrieves and parses the component dump for a given UI library.
 *
 * @param library The UI library to get the dump for.
 * @returns A parsed array of components for the specified library.
 */
function getLibraryDump(library: UiLibrary): LibraryDump {
  const dump = libraryDumps[library];
  return libraryDumpSchema.parse(dump);
}

/**
 * Generates a context string for a specific UI library.
 *
 * @param library The name of the UI library.
 * @param dump The parsed component dump for the library.
 * @returns A formatted string describing the library's components.
 */
function generateLibraryContext(library: UiLibrary, dump: LibraryDump): string {
  let context = `${library.toUpperCase()} Components:\n`;
  dump.forEach((component) => {
    context += `- ${component.name}: ${component.description}\n`;

    if (component.docs.examples.length > 0) {
      context += `  Example:\n${component.docs.examples[0].code}\n\n`;
    }
  });

  return context;
}

function isUILibrary(lib: any): lib is UiLibrary {
  return libraries.includes(lib);
}

export function selectUILibrary(library?: UiLibrary): UiLibrary {
  return isUILibrary(library) ? library : 'shadcn';
}

export function generateUILibraryContextForComponent(selectedLibrary: UiLibrary): string {
  let context = `When generating React component code, use ONLY components from the ${selectedLibrary} UI library:\n\n`;

  const dump = getLibraryDump(selectedLibrary);
  context += generateLibraryContext(selectedLibrary, dump);

  context += `
    When asked to generate UI components or layouts, refer to this library and use its components.
    If a requested component is not available in this library, use the closest alternative or combine
    existing components to achieve the desired functionality.
`;

  return context;
}

/**
 * Generates a comprehensive context string for all supported UI libraries.
 *
 * @returns A string containing information about components from all supported libraries.
 */
export function generateUILibraryContext(): string {
  let context = 'When generating React component code, use ONLY components from the following UI libraries:\n\n';

  libraries.forEach((library) => {
    const dump = getLibraryDump(library);
    context += generateLibraryContext(library, dump);
  });

  context +=
    '\nWhen asked to generate UI components or layouts, refer to these libraries and use their components. If a requested component is not available in these libraries, use the closest alternative or combine existing components to achieve the desired functionality.';

  return context;
}
