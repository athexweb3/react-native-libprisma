import { useEffect, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  tokenize,
  themes,
  type Token,
  type PrismTheme,
  type ThemeName,
} from 'react-native-libprisma';

const CODE_SAMPLES = {
  javascript: `const greeting = "Hello, World!";
console.log(greeting);

function add(a, b) {
  return a + b;
}`,

  python: `def hello_world():
    print("Hello, World!")
    
class Person:
    def __init__(self, name):
        self.name = name`,

  cpp: `#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
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
      alert(
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
