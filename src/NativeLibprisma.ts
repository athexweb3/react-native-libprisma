import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

/**
 * Represents a single token in the syntax highlighting result.
 * A token can be either plain text or a syntax element with nested tokens.
 */
export interface Token {
  /**
   * The type of the token (e.g., "keyword", "string", "comment")
   * For plain text tokens, this will be "text"
   */
  type: string;

  /**
   * The content of the token.
   * Can be a string or an array of nested Token objects.
   */
  content: string | Token[];

  /**
   * Optional alias for the token type (e.g., "keyword" might have alias "builtin")
   */
  alias?: string;
}

/**
 * LibPrisma Turbo Module Specification
 *
 * High-performance syntax highlighter for React Native
 * A C++ port of Prism.js that provides fast syntax highlighting
 * for 200+ programming languages.
 */
export interface Spec extends TurboModule {
  /**
   * Tokenize source code into syntax-highlighted tokens.
   * Returns a JSON string representation of the tokens.
   *
   * @param code - The source code to tokenize
   * @param language - The language identifier (e.g., "javascript", "python", "cpp")
   * @returns JSON string representing an array of tokens
   *
   * @example
   * ```ts
   * const jsonString = libprisma.tokenizeToJson('const x = 42;', 'javascript');
   * const tokens = JSON.parse(jsonString);
   * // tokens: [
   * //   { type: 'keyword', content: 'const' },
   * //   { type: 'text', content: ' x ' },
   * //   ...
   * // ]
   * ```
   */
  tokenizeToJson(code: string, language: string): string;

  /**
   * Load grammars from a base64 string.
   * This should be called once before using tokenizeToJson.
   *
   * @param grammars - Base64 encoded grammar data
   */
  loadGrammars(grammars: string): void;
}

export default TurboModuleRegistry.get<Spec>('NativeLibprisma') as Spec | null;
