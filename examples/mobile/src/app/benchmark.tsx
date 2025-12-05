import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

interface BenchmarkResult {
  language: string;
  timeMs: number;
  tokenCount: number;
  tokensPerSecond: number;
  codeLength: number;
}
import Entypo from '@expo/vector-icons/Entypo';

export default function BenchmarkScreen() {
  const params = useLocalSearchParams();
  const resultsJson = params.results as string;
  const results: BenchmarkResult[] = resultsJson ? JSON.parse(resultsJson) : [];

  // Sort by tokens per second (fastest first)
  const sortedResults = [...results].sort(
    (a, b) => b.tokensPerSecond - a.tokensPerSecond
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Entypo name="chevron-left" size={24} color="#3b82f6" />
          </TouchableOpacity>
          <Text style={styles.title}>Benchmark Results</Text>
        </View>
      </View>

      {/* Results Table */}
      <ScrollView style={styles.scrollContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={[styles.row, styles.headerRow]}>
              <Text style={[styles.cell, styles.headerCell, styles.rankCell]}>
                #
              </Text>
              <Text style={[styles.cell, styles.headerCell, styles.langCell]}>
                Language
              </Text>
              <Text style={[styles.cell, styles.headerCell]}>Time</Text>
              <Text style={[styles.cell, styles.headerCell]}>Tokens</Text>
              <Text style={[styles.cell, styles.headerCell]}>tok/s</Text>
              <Text style={[styles.cell, styles.headerCell]}>Size</Text>
            </View>

            {/* Table Rows */}
            {sortedResults.map((result, index) => (
              <View
                key={result.language}
                style={[
                  styles.row,
                  index % 2 === 0 ? styles.rowEven : styles.rowOdd,
                ]}
              >
                <Text style={[styles.cell, styles.rankCell, styles.rankText]}>
                  {index + 1}
                </Text>
                <Text style={[styles.cell, styles.langCell, styles.cellText]}>
                  {result.language}
                </Text>
                <Text style={[styles.cell, styles.cellText]}>
                  {result.timeMs.toFixed(1)}ms
                </Text>
                <Text style={[styles.cell, styles.cellText]}>
                  {result.tokenCount.toLocaleString()}
                </Text>
                <Text style={[styles.cell, styles.cellText, styles.speedText]}>
                  {result.tokensPerSecond.toLocaleString()}
                </Text>
                <Text style={[styles.cell, styles.cellText]}>
                  {(result.codeLength / 1000).toFixed(1)}KB
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#141933',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2f4a',
  },
  backButton: {
    padding: 4,
  },
  backText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  table: {
    minWidth: '100%',
    paddingVertical: 16,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2f4a',
    paddingVertical: 12,
  },
  headerRow: {
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
    paddingVertical: 14,
  },
  cell: {
    fontSize: 13,
    fontFamily: 'Menlo',
    paddingHorizontal: 8,
    width: 90,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerCell: {
    fontWeight: '700',
    color: '#3b82f6',
    fontSize: 14,
  },
  cellText: {
    color: '#e5e7eb',
  },
  rankCell: {
    width: 50,
    textAlign: 'center',
  },
  rankText: {
    fontWeight: '700',
    color: '#fbbf24',
  },
  langCell: {
    width: 110,
    fontWeight: '600',
  },
  speedText: {
    fontWeight: '600',
    color: '#34d399',
  },
  rowEven: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  rowOdd: {
    backgroundColor: 'transparent',
  },
});
