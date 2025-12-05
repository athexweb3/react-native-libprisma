import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SyntaxHighlighter } from 'react-native-libprisma';

const exampleCode = `const greeting = "Hello, World!";

function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));`;

export default function TestHighlighterScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>SyntaxHighlighter Test</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Basic Example:</Text>
        <SyntaxHighlighter code={exampleCode} language="typescript" />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>With Line Numbers:</Text>
        <SyntaxHighlighter
          code={exampleCode}
          language="typescript"
          showLineNumbers
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>With Copy Button:</Text>
        <SyntaxHighlighter
          code={exampleCode}
          language="typescript"
          showToolbar
          showCopyButton
          onCopy={(text) => console.log('Copied:', text.length, 'chars')}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Full Features:</Text>
        <SyntaxHighlighter
          code={exampleCode}
          language="typescript"
          theme="vintageTheme"
          showLineNumbers
          showToolbar
          showCopyButton
          fontSize={16}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Light Theme:</Text>
        <SyntaxHighlighter
          code={exampleCode}
          language="typescript"
          theme="simpleAsLightTheme"
          showLineNumbers
          fontSize={14}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 8,
  },
  codeBlock: {
    borderRadius: 8,
    overflow: 'hidden',
  },
});
