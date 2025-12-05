# Benchmark Results

Performance benchmarks for LibPrisma tokenization across **14 popular programming languages**.

## Test Environment

- **Device**: iPhone 17 Pro Simulator
- **Runs**: 5 iterations (average)
- **Code Size**: Realistic production-level samples (2-12KB)
- **Features**: Modern language syntax with advanced patterns

## Results Summary

| Rank | Language | Time (ms) | Tokens | Speed (tok/s) | Code Size |
|------|----------|-----------|--------|---------------| ---------|
| 🥇 1 | Go | 62.47ms | 2,507 | 40,131 tok/s | 5.3KB |
| 🥈 2 | Rust | 100.65ms | 3,335 | 33,133 tok/s | 6.2KB |
| 🥉 3 | Kotlin | 82.39ms | 2,461 | 29,870 tok/s | 6.3KB |
| 4 | Swift | 129.14ms | 3,721 | 28,814 tok/s | 9.8KB |
| 5 | Python | 71.75ms | 2,021 | 28,167 tok/s | 6.1KB |
| 6 | Ruby | 86.33ms | 2,175 | 25,193 tok/s | 6.0KB |
| 7 | Solidity | 135.41ms | 3,270 | 24,149 tok/s | 11.9KB |
| 8 | C++ | 109.97ms | 2,595 | 23,598 tok/s | 5.4KB |
| 9 | Java | 155.97ms | 3,283 | 21,049 tok/s | 8.0KB |
| 10 | C# | 175.96ms | 2,173 | 12,349 tok/s | 8.5KB |
| 11 | JavaScript | 359.16ms | 3,121 | 8,690 tok/s | 6.6KB |
| 12 | TypeScript | 357.78ms | 3,065 | 8,567 tok/s | 16.9KB |
| 13 | PHP | 402.68ms | 3,398 | 8,438 tok/s | 7.7KB |
| 14 | Objective-C++ | 0.80ms | 1 | 1,247 tok/s | 9.1KB |

## Performance Analysis

### 🏆 Top Performers

**Go** leads with exceptional speed (**40,131 tok/s**), demonstrating LibPrisma's optimization for efficient compiled languages with minimal overhead.

**Rust** follows closely (**33,133 tok/s**), showing excellent performance with memory safety guarantees.

**Kotlin** rounds out the top 3 (**29,870 tok/s**) with impressive JVM-based performance.

### 💡 Insights

- **Go** dominates with the fastest tokenization speed, showcasing its simplicity
- **Systems Languages** (Rust, C++, Go) consistently show top-tier performance
- **Modern JVM** (Kotlin, Java) maintains solid mid-range performance  
- **Interpreted Languages** (Python, Ruby, PHP) trade speed for rich syntax features
- **TypeScript/JavaScript** show similar performance, optimized for web development
- **Web3 Language** (Solidity) performs excellently despite complex smart contract syntax

### 📊 Detailed Breakdown

#### Go
```
Time: 62.47ms | Tokens: 2,507 | Speed: 40,131 tok/s | Size: 5.3KB
Features: goroutines, channels, interfaces, defer, error handling
```

#### Rust
```
Time: 100.65ms | Tokens: 3,335 | Speed: 33,133 tok/s | Size: 6.2KB
Features: async/await, ownership, traits, lifetimes, macros
```

#### Kotlin
```
Time: 82.39ms | Tokens: 2,461 | Speed: 29,870 tok/s | Size: 6.3KB
Features: coroutines, data classes, sealed classes, extension functions
```

#### Swift
```
Time: 129.14ms | Tokens: 3,721 | Speed: 28,814 tok/s | Size: 9.8KB
Features: SwiftUI, actors, async/await, property wrappers
```

#### Python
```
Time: 71.75ms | Tokens: 2,021 | Speed: 28,167 tok/s | Size: 6.1KB
Features: async/await, type hints, decorators, context managers
```

## Testing Methodology

1. **Code Samples**: Each language includes realistic production patterns:
   - Repository patterns
   - Async/concurrent operations
   - Event systems
   - Type safety features
   - Modern syntax (generics, async, etc.)

2. **Measurement**: Average of 5 runs using `performance.now()`
3. **Metrics**:
   - **Time**: Total tokenization time in milliseconds
   - **Tokens**: Number of tokens generated
   - **Speed**: Tokens per second (tok/s)
   - **Size**: Source code size in kilobytes

## Running Benchmarks

To run benchmarks yourself:

1. Open the LibPrisma example app
2. Tap "Run All Benchmarks"
3. Results display in both:
   - On-screen table (sorted by speed)
   - Console logs (detailed metrics)

## Notes

- Results may vary based on device performance
- Benchmarks run on iOS Simulator (iPhone 17 Pro)
- All samples use modern language features
- Objective-C++ shows unusual results due to incomplete sample tokenization

---

*Last Updated: 5 December 2025*
*RNLibPrisma Version: Latest*
