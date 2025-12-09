import { tokenize } from 'react-native-libprisma';

export interface BenchmarkResult {
  language: string;
  codeLength: number;
  tokenCount: number;
  timeMs: number;
  tokensPerSecond: number;
  charsPerSecond: number;
}

/**
 * Benchmark a single tokenization operation
 */
export function benchmarkTokenize(
  code: string,
  language: string
): BenchmarkResult {
  const start = performance.now();
  const tokens = tokenize(code, language);
  const end = performance.now();

  const timeMs = end - start;
  const tokenCount = countTokens(tokens);
  const codeLength = code.length;

  return {
    language,
    codeLength,
    tokenCount,
    timeMs,
    tokensPerSecond: Math.round((tokenCount / timeMs) * 1000),
    charsPerSecond: Math.round((codeLength / timeMs) * 1000),
  };
}

/**
 * Run multiple iterations and return average
 */
export function benchmarkAverage(
  code: string,
  language: string,
  iterations: number = 10
): BenchmarkResult {
  const results: BenchmarkResult[] = [];

  for (let i = 0; i < iterations; i++) {
    results.push(benchmarkTokenize(code, language));
  }

  const avgTimeMs = results.reduce((sum, r) => sum + r.timeMs, 0) / iterations;
  const first = results[0];

  if (!first) {
    throw new Error('No benchmark results generated');
  }

  return {
    language,
    codeLength: first.codeLength,
    tokenCount: first.tokenCount,
    timeMs: avgTimeMs,
    tokensPerSecond: Math.round((first.tokenCount / avgTimeMs) * 1000),
    charsPerSecond: Math.round((first.codeLength / avgTimeMs) * 1000),
  };
}

/**
 * Stress test with large code
 */
export function stressTest(
  code: string,
  language: string,
  multiplier: number = 100
): BenchmarkResult {
  const largeCode = Array(multiplier).fill(code).join('\n');
  return benchmarkTokenize(largeCode, language);
}

/**
 * Count total tokens recursively
 */
function countTokens(tokens: any[]): number {
  let count = 0;

  function countToken(token: any) {
    count++;
    if (Array.isArray(token.content)) {
      token.content.forEach(countToken);
    }
  }

  tokens.forEach(countToken);
  return count;
}

/**
 * Format benchmark result for display
 */
export function formatBenchmarkResult(result: BenchmarkResult): string {
  return `${result.language}: ${result.timeMs.toFixed(2)}ms | ${result.tokenCount} tokens | ${result.tokensPerSecond.toLocaleString()} tok/s | ${result.charsPerSecond.toLocaleString()} char/s`;
}
