<div align="center">
  <a href="https://github.com/athexweb3/react-native-libprisma">
    <picture>
      <img alt="react-native-libprisma" src="./docs/images/banner.png" />
    </picture>
  </a>
</div>

<div align="center">
  <h1>react-native-libprisma</h1>
  <p>
    <strong>High-performance syntax highlighting for React Native</strong>
  </p>
  
  <p>
    <a href="https://www.npmjs.com/package/react-native-libprisma"><img src="https://img.shields.io/npm/v/react-native-libprisma" alt="NPM Version"></a>
    <a href="https://github.com/athexweb3/react-native-libprisma/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/react-native-libprisma" alt="License"></a>
    <a href="https://github.com/athexweb3/react-native-libprisma/actions"><img src="https://img.shields.io/github/actions/workflow/status/athexweb3/react-native-libprisma/ci.yml?branch=main" alt="Build Status"></a>
  </p>
</div>

<br />

> [!NOTE]
> Powered by a C++ port of [Prism.js](https://prismjs.com/), supporting **200+ programming languages** with built-in themes.  
> View all supported languages in [implementation-coverage.md](./docs/implementation-coverage.md).

## ⚡️ Features

- **Blazing Fast** - C++ implementation with native performance via JSI. [See Benchmarks](./docs/benchmark.md) 🚀
- **Zero JS Dependencies** - Pure native module using Turbo Modules.
- **200+ Languages** - Comprehensive language support out of the box.
- **11 Built-in Themes** - Beautiful, ready-to-use themes (Dracula, VS Code, etc.).
- **TypeScript First** - Full type safety with autocomplete.
- **Cross Platform** - Works on iOS, Android, and macOS.

---

## Installation

<h3>
  React Native  <a href="#"><img src="./docs/images/react-native.png" height="15" /></a>
</h3>

```bash
npm install react-native-libprisma
# or
bun add react-native-libprisma
```

**iOS**:
```bash
cd ios && pod install
```

<h3>
  Expo  <a href="#"><img src="./docs/images/expo.png" height="12" /></a>
</h3>

```bash
npx expo install react-native-libprisma
```

> [!IMPORTANT]
> This library uses native code. You must use a **Development Build** or **Prebuild**.
>
> ```bash
> npx expo prebuild
> ```

---

## Usage

### Basic Tokenization

```tsx
import { tokenize } from 'react-native-libprisma';

const code = `const greeting = "Hello, World!";`;
const tokens = tokenize(code, 'javascript');
```

### Rendering with Themes

```tsx
import { tokenize, themes } from 'react-native-libprisma';
import { Text } from 'react-native';

function CodeBlock() {
  const code = `console.log("Hello!");`;
  const tokens = tokenize(code, 'javascript');
  const theme = themes.draculaTheme;

  return (
    <Text>
      {tokens.map((token, i) => (
        <TokenDisplay key={i} token={token} theme={theme} />
      ))}
    </Text>
  );
}
```

<details>
<summary><strong>View TokenDisplay Component Implementation</strong></summary>

```tsx
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
</details>

---

## Themes

We include 11 popular themes out of the box:

```ts
import { themes } from 'react-native-libprisma';

themes.draculaTheme             // Dracula
themes.peaceOfEyeTheme          // Default Dark
themes.officialTheme            // VS Code Dark
themes.blueVelvetTheme          // Blue Velvet
themes.vintageTheme             // Vintage
themes.shadesOfGreyTheme        // Shades of Grey
themes.traditionalTheme         // Traditional
themes.professionalTheme        // Professional
themes.defaultColorTheme        // Default
themes.peaceOfEyeDraculaTheme   // Peace of Eye (Dracula variant)
themes.simpleAsLightTheme       // Light Theme
```

---

## API Reference

### `tokenize(code, language)`

| Parameter | Type | Description |
|-----------|------|-------------|
| `code` | `string` | The source code to highlight. |
| `language` | `Language` | Language identifier (e.g., `'javascript'`, `'python'`). |

**Returns**: `Token[]`

### `Token` Interface

```ts
interface Token {
  type: string;               // e.g., "keyword", "string", "comment"
  content: string | Token[];  // The text content or nested tokens
  alias?: string;             // Optional alias
}
```

---

## 🤝 Contributing

See the [CONTRIBUTING.md](CONTRIBUTING.md) guide for details on how to contribute to this project.

## 🙏 Acknowledgements

This project builds upon the excellent work of:

- **[Telegram](https://github.com/TelegramMessenger/libprisma)** - C++ implementation of the syntax highlighter
- **[Prism.js](https://prismjs.com/)** - Core syntax highlighting engine and grammar definitions
- **[LearnWithSumit](https://github.com/learnwithsumit)** - VSCode theme inspiration

**Author Contributions:**
- React Native compatibility layer and native module integration
- C++ core modifications for cross-platform React Native support
- Unified API design merging all components into a cohesive library

## 📄 License

MIT

---

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/athexweb3">Athex Web3</a></p>
</div>
