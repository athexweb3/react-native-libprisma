import { type HybridObject } from 'react-native-nitro-modules'

/**
 * LibPrisma Nitro Module
 * High-performance syntax highlighting powered by C++
 */
export interface LibPrisma extends HybridObject<{ ios: 'c++'; android: 'c++' }> {
    /**
     * Tokenize source code into syntax-highlighted tokens.
     * Returns a JSON string representation of the tokens.
     */
    tokenizeToJson(code: string, language: string): string

    /**
     * Load grammars from a base64-encoded gzipped string.
     * This should be called once before using tokenizeToJson.
     */
    loadGrammars(grammars: string): void
}
