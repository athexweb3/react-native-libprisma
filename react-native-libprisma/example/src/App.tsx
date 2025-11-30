import { useEffect, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  tokenize,
  themes,
  type Token,
  type PrismTheme,
  type ThemeName,
} from 'react-native-libprisma';

const CODE_SAMPLES = {
  javascript: `import type { Token } from './Libprisma.nitro';
import type { PrismTheme } from './themes';

/**
 * Gets the color for a token based on its type and alias.
 * Falls back to the theme's foreground color if no specific color is found.
 *
 * @param token - The token to get color for
 * @param theme - The theme to use
 * @returns The hex color string
 *
 * @example
 * \`\`\`ts
 * const color = getTokenColor(token, themes.peaceOfEyeTheme);
 * \`\`\`
 */
export function getTokenColor(token: Token, theme: PrismTheme): string {
  const tokenType = token.alias || token.type;
  return theme.colors[tokenType] || theme.colors.foreground;
}

/**
 * Gets the style properties for a token including color and optional font weight.
 *
 * @param token - The token to get style for
 * @param theme - The theme to use
 * @param options - Optional styling options
 * @returns Style object suitable for React Native Text component
 *
 * @example
 * \`\`\`tsx
 * const style = getTokenStyle(token, theme, { boldKeywords: true });
 * <Text style={style}>{token.content}</Text>
 * \`\`\`
 */
export function getTokenStyle(
  token: Token,
  theme: PrismTheme,
  options?: {
    /**
     * Apply bold font weight to keywords and functions
     * @default false
     */
    boldKeywords?: boolean;
    /**
     * Apply italic font style to comments
     * @default false
     */
    italicComments?: boolean;
    /**
     * Custom font family
     */
    fontFamily?: string;
  }
): {
  color: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  fontFamily?: string;
} {
  const color = getTokenColor(token, theme);
  const tokenType = token.alias || token.type;

  const style: ReturnType<typeof getTokenStyle> = { color };

  if (options?.boldKeywords && ['keyword', 'function'].includes(tokenType)) {
    style.fontWeight = 'bold';
  }

  if (options?.italicComments && tokenType === 'comment') {
    style.fontStyle = 'italic';
  }

  if (options?.fontFamily) {
    style.fontFamily = options.fontFamily;
  }

  return style;
}

/**
 * Checks if a token has nested content (i.e., content is an array of tokens).
 *
 * @param token - The token to check
 * @returns True if the token has nested content
 *
 * @example
 * \`\`\`ts
 * if (isNestedToken(token)) {
 *   // Recursively render nested tokens
 * }
 * \`\`\`
 */
export function isNestedToken(
  token: Token
): token is Token & { content: Token[] } {
  return Array.isArray(token.content);
}

/**
 * Flattens a token tree into a flat array of tokens with string content only.
 * Useful for extracting plain text from tokenized code.
 *
 * @param tokens - Array of tokens to flatten
 * @returns Flat array of tokens with string content
 *
 * @example
 * \`\`\`ts
 * const flatTokens = flattenTokens(tokens);
 * const plainText = flatTokens.map(t => t.content).join('');
 * \`\`\`
 */
export function flattenTokens(
  tokens: Token[]
): Array<Token & { content: string }> {
  const result: Array<Token & { content: string }> = [];

  function flatten(token: Token) {
    if (typeof token.content === 'string') {
      result.push(token as Token & { content: string });
    } else {
      token.content.forEach(flatten);
    }
  }

  tokens.forEach(flatten);
  return result;
}

/**
 * Extracts plain text from tokenized code.
 *
 * @param tokens - Array of tokens
 * @returns Plain text string
 *
 * @example
 * \`\`\`ts
 * const plainText = getPlainText(tokens);
 * console.log(plainText); // "const x = 42;"
 * \`\`\`
 */
export function getPlainText(tokens: Token[]): string {
  return flattenTokens(tokens)
    .map((t) => t.content)
    .join('');
}

/**
 * Gets all unique token types from a token array.
 * Useful for understanding what token types are present in code.
 *
 * @param tokens - Array of tokens
 * @returns Array of unique token type strings
 *
 * @example
 * \`\`\`ts
 * const types = getTokenTypes(tokens);
 * console.log(types); // ['keyword', 'string', 'punctuation', ...]
 * \`\`\`
 */
export function getTokenTypes(tokens: Token[]): string[] {
  const types = new Set<string>();

  function collectTypes(token: Token) {
    types.add(token.type);
    if (token.alias) {
      types.add(token.alias);
    }

    if (Array.isArray(token.content)) {
      token.content.forEach(collectTypes);
    }
  }

  tokens.forEach(collectTypes);
  return Array.from(types);
}

/**
 * Counts the total number of tokens in a token tree.
 *
 * @param tokens - Array of tokens
 * @returns Total count of tokens including nested ones
 *
 * @example
 * \`\`\`ts
 * const count = countTokens(tokens);
 * console.log(\`Total tokens: \$\{count\}\`);
 * \`\`\`
 */
export function countTokens(tokens: Token[]): number {
  let count = 0;

  function countToken(token: Token) {
    count++;
    if (Array.isArray(token.content)) {
      token.content.forEach(countToken);
    }
  }

  tokens.forEach(countToken);
  return count;
}`,
};

function TokenDisplay({
  token,
  theme,
  depth = 0,
}: {
  token: Token;
  theme: PrismTheme;
  depth?: number;
}) {
  const getColorForType = (type: string) => {
    return theme.colors[type];
  };

  const color =
    getColorForType(token.alias || token.type) || getColorForType(token.type);
  const style = color ? { color } : {};

  if (typeof token.content === 'string') {
    return <Text style={style}>{token.content}</Text>;
  }

  return (
    <Text style={style}>
      {token.content.map((nested, idx) => (
        <TokenDisplay
          key={idx}
          token={nested}
          theme={theme}
          depth={depth + 1}
        />
      ))}
    </Text>
  );
}

export default function App() {
  const [selectedLang, setSelectedLang] =
    useState<keyof typeof CODE_SAMPLES>('javascript');
  const [selectedThemeName, setSelectedThemeName] = useState<ThemeName>(
    'peaceOfEyeDraculaTheme'
  );
  const [tokens, setTokens] = useState<Token[]>([]);
  const [error, setError] = useState<string>('');

  console.log('Tokens: ', tokens);

  const handleTokenize = (lang: keyof typeof CODE_SAMPLES) => {
    try {
      setSelectedLang(lang);
      setError('');
      const result = tokenize(CODE_SAMPLES[lang], lang);
      setTokens(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setTokens([]);
    }
  };

  // Initial tokenize
  useEffect(() => {
    handleTokenize(selectedLang);
  }, [selectedLang]);

  const runStressTest = () => {
    const baseCode = CODE_SAMPLES.javascript;
    // Generate ~10,000 lines of code
    const largeCode = Array(2000).fill(baseCode).join('\n');

    console.log(`Starting stress test with ${largeCode.length} characters...`);
    const start = performance.now();

    try {
      const result = tokenize(largeCode, 'javascript');
      const end = performance.now();
      const duration = (end - start).toFixed(2);

      console.log(`Tokenized ${result.length} tokens in ${duration}ms`);
      Alert.alert(
        `Success! Tokenized ${largeCode.length} chars (${result.length} tokens) in ${duration}ms`
      );

      // Don't render all tokens to avoid React rendering bottleneck, just show a sample
      setTokens(result.slice(0, 100));
      setError(
        `Stress test passed: ${duration}ms (Showing first 100 tokens only)`
      );
    } catch (err) {
      setError(
        'Stress test failed: ' +
        (err instanceof Error ? err.message : String(err))
      );
    }
  };

  const currentTheme = themes[selectedThemeName] || themes.peaceOfEyeTheme;
  const themeBackground = currentTheme.colors.background;
  const themeForeground = currentTheme.colors.foreground;

  return (
    <View style={[styles.container, { backgroundColor: themeBackground }]}>
      <Text style={[styles.title, { color: themeForeground }]}>
        LibPrisma Syntax Highlighter
      </Text>

      <View style={styles.section}>
        <Text style={[styles.label, { color: themeForeground }]}>
          Language:
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scrollRow}
        >
          {(Object.keys(CODE_SAMPLES) as Array<keyof typeof CODE_SAMPLES>).map(
            (lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.button,
                  selectedLang === lang && styles.buttonActive,
                ]}
                onPress={() => handleTokenize(lang)}
              >
                <Text style={styles.buttonText}>{lang}</Text>
              </TouchableOpacity>
            )
          )}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#e74c3c' }]}
            onPress={runStressTest}
          >
            <Text style={styles.buttonText}>Stress Test (10k lines)</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: themeForeground }]}>Theme:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scrollRow}
        >
          {(Object.keys(themes) as ThemeName[]).map((themeName) => (
            <TouchableOpacity
              key={themeName}
              style={[
                styles.button,
                selectedThemeName === themeName && styles.buttonActive,
              ]}
              onPress={() => setSelectedThemeName(themeName)}
            >
              <Text style={styles.buttonText}>
                {themeName.replace('Theme', '')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={[
          styles.codeContainer,
          { backgroundColor: themeBackground, borderColor: '#333' },
        ]}
      >
        <View style={styles.codeBlock}>
          {error ? (
            <Text style={styles.error}>{error}</Text>
          ) : tokens.length > 0 ? (
            <Text style={[styles.code, { color: themeForeground }]}>
              {tokens.map((token, idx) => (
                <TokenDisplay key={idx} token={token} theme={currentTheme} />
              ))}
            </Text>
          ) : (
            <Text style={styles.placeholder}>
              Tap a language button to see highlighted code
            </Text>
          )}
        </View>
      </ScrollView>

      <Text style={styles.info}>
        {tokens.length > 0 && `Tokenized ${tokens.length} tokens`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  scrollRow: {
    flexDirection: 'row',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#333333',
    borderRadius: 6,
    marginRight: 10,
  },
  buttonActive: {
    backgroundColor: '#007acc',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  codeContainer: {
    flex: 1,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
  },
  codeBlock: {
    flex: 1,
  },
  code: {
    fontFamily: 'Menlo',
    fontSize: 14,
    lineHeight: 20,
  },
  placeholder: {
    color: '#666666',
    fontStyle: 'italic',
  },
  error: {
    color: '#f48771',
  },
  info: {
    marginTop: 10,
    color: '#666666',
    fontSize: 12,
  },
});
