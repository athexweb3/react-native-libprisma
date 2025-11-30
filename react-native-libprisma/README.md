# react-native-libprisma

⚡️ **High-performance syntax highlighting for React Native** powered by a C++ port of [Prism.js](https://prismjs.com/), supporting **200+ programming languages** with **built-in themes**.

## Features

- 🚀 **Blazing Fast** - C++ implementation with native performance
- 🎨 **11 Built-in Themes** - Beautiful themes ready to use
- 🌐 **200+ Languages** - Comprehensive language support
- 📦 **Zero JS Dependencies** - Pure native module using Nitro Modules
- 💪 **TypeScript First** - Full type safety with autocomplete
- 🎯 **Easy to Use** - Simple API with powerful features

## Installation

```sh
npm install react-native-libprisma react-native-nitro-modules
# or
yarn add react-native-libprisma react-native-nitro-modules
```

> **Note:** `react-native-nitro-modules` is required as this library is built with [Nitro Modules](https://nitro.margelo.com/).

### iOS Setup

```sh
cd ios && pod install
```

### Android Setup

No additional setup required. The library will work out of the box.

## Usage

### Basic Example

```tsx
import { tokenize } from 'react-native-libprisma';

const code = `const greeting = "Hello, World!";
console.log(greeting);`;

const tokens = tokenize(code, 'javascript');
// Returns an array of syntax tokens
```

### With Themes

```tsx
import { tokenize, themes, type ThemeName } from 'react-native-libprisma';
import { Text } from 'react-native';

function CodeHighlighter({ code, language }: { code: string; language: string }) {
  const tokens = tokenize(code, language);
  const theme = themes['peaceOfEyeTheme'];

  return (
    <Text>
      {tokens.map((token, idx) => (
        <TokenDisplay key={idx} token={token} theme={theme} />
      ))}
    </Text>
  );
}

function TokenDisplay({ token, theme }) {
  const color = theme.colors[token.type] || theme.colors.foreground;
  
  if (typeof token.content === 'string') {
    return <Text style={{ color }}>{token.content}</Text>;
  }
  
  return (
    <Text style={{ color }}>
      {token.content.map((nested, idx) => (
        <TokenDisplay key={idx} token={nested} theme={theme} />
      ))}
    </Text>
  );
}
```

## API Reference

### `tokenize(code: string, language: Language): Token[]`

Tokenizes source code into an array of syntax-highlighted tokens.

**Parameters:**
- `code`: The source code to tokenize
- `language`: Language identifier (e.g., 'javascript', 'python', 'cpp')

**Returns:** Array of `Token` objects

**Example:**
```ts
const tokens = tokenize('const x = 42;', 'javascript');
```

### Types

#### `Token`

Represents a single syntax token.

```ts
interface Token {
  type: string;          // Token type (e.g., "keyword", "string", "comment")
  content: string | Token[];  // Token content (string or nested tokens)
  alias?: string;        // Optional alias for the token type
}
```

#### `Language`

Union type of all supported language identifiers (200+ languages). Provides full autocomplete support.

```ts
type Language = 
  | 'javascript' | 'typescript' | 'python' | 'java' | 'cpp'
  | 'rust' | 'go' | 'swift' | 'kotlin' | 'php'
  // ... 200+ more languages
  | string; // Fallback for custom languages
```

#### `ThemeName`

Union type of all available theme names.

```ts
type ThemeName = 
  | 'peaceOfEyeTheme'
  | 'draculaTheme'
  | 'blueVelvetTheme'
  | 'vintageTheme'
  | 'shadesOfGreyTheme'
  | 'traditionalTheme'
  | 'professionalTheme'
  | 'officialTheme'
  | 'defaultColorTheme'
  | 'peaceOfEyeDraculaTheme'
  | 'simpleAsLightTheme';
```

#### `PrismTheme`

Theme object structure.

```ts
interface PrismTheme {
  colors: {
    background: string;
    foreground: string;
    [tokenType: string]: string;  // Token type colors
  };
}
```

### Themes

Access pre-configured VS Code themes:

```ts
import { themes } from 'react-native-libprisma';

// Available themes:
themes.peaceOfEyeTheme          // Default dark theme
themes.draculaTheme             // Popular Dracula theme
themes.blueVelvetTheme          // Blue-tinted dark theme
themes.vintageTheme             // Retro-inspired theme
themes.shadesOfGreyTheme        // Monochrome theme
themes.traditionalTheme         // Classic editor theme
themes.professionalTheme        // Corporate-style theme
themes.officialTheme            // Clean professional theme
themes.defaultColorTheme        // Standard color scheme
themes.peaceOfEyeDraculaTheme   // Dracula variant
themes.simpleAsLightTheme       // Light theme
```

Each theme includes:
- `colors.background` - Editor background color
- `colors.foreground` - Default text color
- `colors[tokenType]` - Color for each token type (keyword, string, comment, etc.)

### Utilities

The package includes helpful utility functions for working with tokens and themes:

#### `getTokenColor(token: Token, theme: PrismTheme): string`

Gets the color for a token based on its type and alias.

```ts
import { getTokenColor, themes } from 'react-native-libprisma';

const color = getTokenColor(token, themes.peaceOfEyeTheme);
```

#### `getTokenStyle(token: Token, theme: PrismTheme, options?): object`

Gets the complete style object for a token including color and optional styling.

```tsx
import { getTokenStyle } from 'react-native-libprisma';

const style = getTokenStyle(token, theme, {
  boldKeywords: true,      // Make keywords and functions bold
  italicComments: true,    // Make comments italic
  fontFamily: 'monospace'  // Custom font family
});

<Text style={style}>{token.content}</Text>
```

#### `isNestedToken(token: Token): boolean`

Checks if a token has nested content.

```ts
if (isNestedToken(token)) {
  // Recursively render nested tokens
}
```

#### `getPlainText(tokens: Token[]): string`

Extracts plain text from tokenized code.

```ts
const plainText = getPlainText(tokens);
```

#### `flattenTokens(tokens: Token[]): Token[]`

Flattens nested token tree into a flat array.

```ts
const flatTokens = flattenTokens(tokens);
```

#### `getTokenTypes(tokens: Token[]): string[]`

Gets all unique token types from a token array.

```ts
const types = getTokenTypes(tokens);
// ['keyword', 'string', 'punctuation', ...]
```

#### `countTokens(tokens: Token[]): number`

Counts the total number of tokens including nested ones.

```ts
const count = countTokens(tokens);
```

## Supported Languages

LibPrisma supports **200+ programming languages** including:

### Popular Languages
JavaScript, TypeScript, Python, Java, C, C++, C#, Go, Rust, Swift, Kotlin, PHP, Ruby, Perl, Lua, R, Scala, Dart, Julia, Elixir, Erlang, Haskell, OCaml, F#, Clojure

### Web Technologies
HTML, CSS, SCSS, Sass, Less, Markdown, JSON, YAML, XML, GraphQL, SQL

### Shell & System
Bash, PowerShell, Batch, Makefile, Dockerfile, Nginx, Apache

### Specialized Languages
Assembly (ARM, x86, MIPS), GLSL, HLSL, Solidity, WASM, LaTeX, MATLAB, Verilog, VHDL, and many more...

**[View complete language list](../../README.md#supported-languages)**

## Advanced Usage

### Custom Theme Colors

```tsx
import { themes, type PrismTheme } from 'react-native-libprisma';

// Create a custom theme based on an existing one
const customTheme: PrismTheme = {
  colors: {
    ...themes.peaceOfEyeTheme.colors,
    keyword: '#ff6b6b',
    string: '#51cf66',
    comment: '#868e96',
  }
};
```

### Multi-Language Support

```tsx
const languages = ['javascript', 'python', 'cpp', 'rust'] as const;

function CodeEditor({ language }: { language: typeof languages[number] }) {
  const [code, setCode] = useState('');
  const tokens = tokenize(code, language);
  
  // Render with syntax highlighting
}
```

### Token Type Detection

```tsx
function highlightToken(token: Token, theme: PrismTheme): React.ReactNode {
  const tokenType = token.alias || token.type;
  const color = theme.colors[tokenType] || theme.colors.foreground;
  
  // Apply custom styling based on token type
  const fontWeight = ['keyword', 'function'].includes(tokenType) ? 'bold' : 'normal';
  
  return (
    <Text style={{ color, fontWeight }}>
      {/* render content */}
    </Text>
  );
}
```

## Performance

LibPrisma is optimized for mobile performance:

- **Native C++ Implementation** - No JS bridge overhead for tokenization
- **Efficient Memory Usage** - Token objects are created once
- **Quick Startup** - Embedded grammar data for instant availability
- **Small Bundle Size** - Minimal impact on app size

## Example App

Check out the [example app](example/) for a complete implementation with theme switching and multiple languages.

```sh
cd example
yarn install
yarn ios    # or yarn android
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## Troubleshooting

### iOS Build Issues

If you encounter build errors on iOS:

```sh
cd ios
pod deintegrate
pod install
```

### Android Build Issues

Clean and rebuild:

```sh
cd android
./gradlew clean
cd ..
npx react-native run-android
```

## Credits

- **C++ Implementation** - Based on [Telegram's libprisma](https://github.com/TelegramMessenger/libprisma) C++ port of Prism.js
- **Themes** - Beautiful VS Code themes from [Learn with Sumit](https://github.com/learnwithsumit/learn-with-sumit-theme)
- **Framework** - Built with [Nitro Modules](https://nitro.margelo.com/)
- **Original Library** - Inspired by [Prism.js](https://prismjs.com/)

## License

MIT

---

Bootstrapped with ❤️ using [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
