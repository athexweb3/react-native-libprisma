import { NitroModules } from 'react-native-nitro-modules';
import type { LibPrisma as LibPrismaSpec } from './specs/LibPrisma.nitro';
import { GRAMMARS_DATA } from './grammars';
import type { Token, Language } from './types';

// Create Nitro Module instance
const LibPrismaHybrid = NitroModules.createHybridObject<LibPrismaSpec>('LibPrisma');

// Load grammars immediately when module loads
if (LibPrismaHybrid) {
    LibPrismaHybrid.loadGrammars(GRAMMARS_DATA);
}

/**
 * Tokenize source code into syntax-highlighted tokens.
 *
 * @param code - The source code to tokenize
 * @param language - The language identifier (e.g., "javascript", "python", "cpp")
 * @returns An array of tokens representing the highlighted code
 *
 * @example
 * ```ts
 * import { tokenize } from 'react-native-libprisma';
 *
 * const tokens = tokenize('const x = 42;', 'javascript');
 * console.log(tokens);
 * // [
 * //   { type: 'keyword', content: 'const' },
 * //   { type: 'text', content: ' x ' },
 * //   ...
 * // ]
 * ```
 */
export function tokenize(code: string, language: Language): Token[] {
    if (!LibPrismaHybrid) {
        throw new Error(
            'LibPrisma Nitro Module is not available. Make sure the native module is properly linked.'
        );
    }

    const jsonString = LibPrismaHybrid.tokenizeToJson(code, language);
    return JSON.parse(jsonString) as Token[];
}

// Export types
export type { Token, Language } from './types';

// Export themes
export * from './utils/themes';
export type { ThemeName, PrismTheme } from './utils/themes';

// Export utils
export * from './utils';

// Export the hybrid object for advanced use cases
export { LibPrismaHybrid as LibPrisma };
