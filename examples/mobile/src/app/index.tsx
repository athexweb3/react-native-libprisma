import { useEffect, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ProgressiveAlert from 'rn-progresive-alert';
import {
  tokenize,
  themes,
  type Token,
  type PrismTheme,
  type ThemeName,
} from 'react-native-libprisma';
import {
  benchmarkTokenize,
  benchmarkAverage,
  stressTest,
  formatBenchmarkResult,
  type BenchmarkResult,
} from '../utils/benchmark';
import {
  typescriptCode,
  cppCode,
  rustCode,
  javaCode,
  swiftCode,
  solidityCode,
  objcppCode,
  pythonCode,
  goCode,
  kotlinCode,
  csharpCode,
  phpCode,
  rubyCode,
} from '../code';

// Dynamic code samples
const CODE_SAMPLES = {
  typescript: typescriptCode,
  python: pythonCode,
  javascript: typescriptCode, // Alias for TypeScript
  java: javaCode,
  kotlin: kotlinCode,
  csharp: csharpCode,
  cpp: cppCode,
  rust: rustCode,
  go: goCode,
  swift: swiftCode,
  objcpp: objcppCode,
  php: phpCode,
  ruby: rubyCode,
  solidity: solidityCode,
};

type LanguageKey = keyof typeof CODE_SAMPLES;

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
  const [selectedLang, setSelectedLang] = useState<LanguageKey>('typescript');
  const [selectedThemeName, setSelectedThemeName] = useState<ThemeName>(
    'peaceOfEyeDraculaTheme'
  );
  const [tokens, setTokens] = useState<Token[]>([]);
  const [error, setError] = useState<string>('');
  const [benchmark, setBenchmark] = useState<BenchmarkResult | null>(null);
  const [showBenchmarks, setShowBenchmarks] = useState(false);

  const handleTokenize = (lang: LanguageKey) => {
    try {
      setSelectedLang(lang);
      setError('');

      // Benchmark the tokenization
      const result = benchmarkTokenize(CODE_SAMPLES[lang], lang);
      setBenchmark(result);

      // Tokenize for display
      const displayTokens = tokenize(CODE_SAMPLES[lang], lang);
      setTokens(displayTokens);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setTokens([]);
      setBenchmark(null);
    }
  };

  // Initial tokenize
  useEffect(() => {
    handleTokenize(selectedLang);
  }, [selectedLang]);

  const runStressTest = async () => {
    const baseCode = CODE_SAMPLES[selectedLang];
    const multiplier = 100;

    const { presented } = await ProgressiveAlert.show({
      title: 'Stress Test',
      message: `Preparing ${multiplier}x code multiplication...`,
      initialProgress: 0,
      cancelTitle: 'Cancel',
    });

    if (!presented) {
      // Fallback to regular alert if native not available
      Alert.alert('Running', 'Stress test in progress...');
    }

    console.log(`Starting stress test with ${multiplier}x multiplier...`);

    try {
      // Progress: 0-0.3 = Preparation
      await new Promise((resolve) => setTimeout(resolve, 200));
      await ProgressiveAlert.update(0.2);

      // Progress: 0.3-0.9 = Tokenization
      await ProgressiveAlert.update(0.3);
      const result = stressTest(baseCode, selectedLang, multiplier);

      // Progress: 0.9-1.0 = Complete
      await ProgressiveAlert.update(0.95);
      await new Promise((resolve) => setTimeout(resolve, 100));
      await ProgressiveAlert.update(1.0);
      await new Promise((resolve) => setTimeout(resolve, 300));
      await ProgressiveAlert.dismiss();

      Alert.alert('Stress Test Complete ✅', formatBenchmarkResult(result), [
        { text: 'OK' },
      ]);

      setError(
        `Stress test passed: ${result.timeMs.toFixed(2)}ms for ${result.codeLength.toLocaleString()} chars`
      );
    } catch (err) {
      await ProgressiveAlert.dismiss();
      setError(
        'Stress test failed: ' +
          (err instanceof Error ? err.message : String(err))
      );
    }
  };

  const runBenchmarkSuite = async () => {
    setShowBenchmarks(true);

    const languages = Object.keys(CODE_SAMPLES) as LanguageKey[];
    const results: Record<string, BenchmarkResult> = {};

    const { presented } = await ProgressiveAlert.show({
      title: 'Benchmark Suite',
      message: `Testing ${languages.length} languages...`,
      initialProgress: 0,
      cancelTitle: null, // No cancel button
    });

    if (!presented) {
      // Fallback
      Alert.alert('Running', 'Benchmarking in progress...');
    }

    for (let i = 0; i < languages.length; i++) {
      const lang = languages[i];
      if (!lang) continue;

      const progressStart = i / languages.length;
      const progressEnd = (i + 1) / languages.length;

      try {
        // Update progress at start of each language
        await ProgressiveAlert.update(progressStart);

        results[lang] = benchmarkAverage(CODE_SAMPLES[lang], lang, 5);

        // Update progress at end of each language
        await ProgressiveAlert.update(progressEnd);

        // Small delay to show progress
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (err) {
        console.error(`Benchmark failed for ${lang}:`, err);
      }
    }

    // Ensure we reach 100%
    await ProgressiveAlert.update(1.0);
    await new Promise((resolve) => setTimeout(resolve, 300));
    await ProgressiveAlert.dismiss();

    // Store results and show in UI
    // setAllBenchmarks(results); // Removed unused state

    console.log('\n=== Benchmark Results Summary ===');
    console.log(`Total languages tested: ${Object.keys(results).length}`);
    Object.entries(results)
      .sort(([, a], [, b]) => b.tokensPerSecond - a.tokensPerSecond)
      .forEach(([lang, result], index) => {
        console.log(`${index + 1}. ${lang}: ${formatBenchmarkResult(result)}`);
      });

    // Navigate to benchmark screen with results
    const benchmarkData = Object.entries(results).map(([, data]) => ({
      ...data,
    }));

    router.push({
      pathname: '/benchmark',
      params: { results: JSON.stringify(benchmarkData) },
    });
  };

  const currentTheme = themes[selectedThemeName] || themes.peaceOfEyeTheme;
  const themeBackground = currentTheme.colors.background;
  const themeForeground = currentTheme.colors.foreground;

  return (
    <View style={[styles.container, { backgroundColor: themeBackground }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeForeground }]}>
          LibPrisma
        </Text>
        <TouchableOpacity onPress={() => router.push('/test-highlighter')}>
          <Ionicons name="code" size={24} color={themeForeground} />
        </TouchableOpacity>
      </View>

      {/* Language Selector */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: themeForeground }]}>
          Popular Languages ({Object.keys(CODE_SAMPLES).length}): Test
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scrollRow}
        >
          {(Object.keys(CODE_SAMPLES) as LanguageKey[]).map((lang) => (
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
          ))}
        </ScrollView>
      </View>

      {/* Theme Selector */}
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

      {/* Benchmark Info - Single or All Results */}
      {benchmark && !showBenchmarks && (
        <View
          style={[styles.benchmarkBox, { borderColor: themeForeground + '30' }]}
        >
          <Text style={[styles.benchmarkText, { color: themeForeground }]}>
            ⚡ {benchmark.timeMs.toFixed(2)}ms | {benchmark.tokenCount} tokens |
            {benchmark.tokensPerSecond.toLocaleString()} tok/s |
            {(benchmark.codeLength / 1000).toFixed(1)}KB
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionButton, styles.stressTestButton]}
          onPress={runStressTest}
        >
          <Text style={styles.buttonText}>Stress Test (100x)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.benchmarkButton]}
          onPress={runBenchmarkSuite}
        >
          <Text style={styles.buttonText}>Run All Benchmarks</Text>
        </TouchableOpacity>
      </View>

      {/* Code Display */}
      <ScrollView
        style={[
          styles.codeContainer,
          styles.codeContainerBorder,
          { backgroundColor: themeBackground },
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

      {/* Info */}
      <Text style={[styles.info, styles.infoText]}>
        {tokens.length > 0 &&
          `Displaying ${tokens.length} tokens from ${selectedLang}`}
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
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 12,
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
  benchmarkBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  benchmarkText: {
    fontSize: 12,
    fontFamily: 'Menlo',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
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
    fontSize: 12,
  },
  resultsContainer: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  resultsTable: {
    minWidth: '100%',
  },
  resultRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  resultHeader: {
    borderBottomWidth: 2,
    borderBottomColor: '#555',
  },
  resultCell: {
    fontSize: 12,
    fontFamily: 'Menlo',
    paddingHorizontal: 8,
    width: 80,
  },
  headerCell: {
    fontWeight: '700',
    color: '#fff',
  },
  langCell: {
    width: 100,
    fontWeight: '600',
  },
  rankCell: {
    width: 50,
    textAlign: 'center',
    fontWeight: '700',
  },
  stressTestButton: {
    backgroundColor: '#e74c3c',
  },
  benchmarkButton: {
    backgroundColor: '#27ae60',
  },
  codeContainerBorder: {
    borderColor: '#333',
  },
  infoText: {
    color: '#fff',
    textAlign: 'center',
  },
});
