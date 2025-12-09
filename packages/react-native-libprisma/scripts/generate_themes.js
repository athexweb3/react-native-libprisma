const fs = require('fs');
const path = require('path');

const THEMES_DIR = path.join(
  __dirname,
  '../theme-experiment/extracted/extension/themes'
);
const OUTPUT_FILE = path.join(__dirname, '../src/themes.ts');

const PRISM_TO_SCOPE_MAP = {
  'keyword': ['keyword', 'keyword.control', 'storage.type', 'storage.modifier'],
  'boolean': ['constant.language.boolean', 'constant.language'],
  'function': [
    'entity.name.function',
    'support.function',
    'meta.function-call',
  ],
  'string': ['string', 'string.quoted', 'string.template'],
  'number': ['constant.numeric'],
  'operator': ['keyword.operator'],
  'punctuation': ['punctuation', 'meta.brace'],
  'comment': ['comment'],
  'class-name': ['entity.name.type', 'entity.name.class', 'support.class'],
  'maybe-class-name': ['entity.name.type', 'entity.name.class'],
  'constant': ['constant', 'variable.other.constant'],
  'symbol': ['constant.other.symbol'],
  'property': [
    'variable.object.property',
    'meta.object-literal.key',
    'support.type.property-name',
  ],
  'parameter': ['variable.parameter'],
  'variable': ['variable', 'variable.other.readwrite'],
  'tag': ['entity.name.tag'],
  'attr-name': ['entity.other.attribute-name'],
  'attr-value': ['string.quoted', 'meta.attribute-with-value'],
  'selector': ['meta.selector', 'entity.name.tag.css'],
  'method': ['entity.name.function', 'meta.method.declaration'],
  'console': ['support.class.console'],
};

function parseTheme(theme) {
  const prismTheme = {
    colors: {
      background: theme.colors?.['editor.background'] || '#1e1e1e',
      foreground: theme.colors?.['editor.foreground'] || '#d4d4d4',
    },
  };

  const tokenColors = theme.tokenColors || [];

  const findColorForScope = (targetScopes) => {
    for (const rule of tokenColors) {
      if (!rule.scope || !rule.settings.foreground) continue;
      const ruleScopes = Array.isArray(rule.scope) ? rule.scope : [rule.scope];

      for (const target of targetScopes) {
        for (const ruleScope of ruleScopes) {
          if (target.startsWith(ruleScope) || ruleScope.startsWith(target)) {
            return rule.settings.foreground;
          }
        }
      }
    }
    return undefined;
  };

  for (const [prismType, scopes] of Object.entries(PRISM_TO_SCOPE_MAP)) {
    const color = findColorForScope(scopes);
    if (color) {
      prismTheme.colors[prismType] = color;
    }
  }

  return prismTheme;
}

function toCamelCase(str) {
  return str.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace('-', '').replace('_', '')
  );
}

const themes = {};
const files = fs.readdirSync(THEMES_DIR).filter((f) => f.endsWith('.json'));

files.forEach((file) => {
  const content = fs.readFileSync(path.join(THEMES_DIR, file), 'utf8');
  // Remove comments from JSON (VS Code themes can have comments)
  const cleanContent = content.replace(/\/\/.*$/gm, '');
  try {
    const json = JSON.parse(cleanContent);
    const themeName = path.basename(file, '.json');
    const camelName = toCamelCase(themeName);
    themes[camelName] = parseTheme(json);
    console.log(`Parsed ${themeName} -> ${camelName}`);
  } catch (e) {
    console.error(`Failed to parse ${file}:`, e.message);
  }
});

const outputContent = `export interface PrismTheme {
  colors: {
    background: string;
    foreground: string;
    [key: string]: string;
  };
}

export const themes = ${JSON.stringify(themes, null, 2)} as const;

export type ThemeName = keyof typeof themes;
`;

fs.writeFileSync(OUTPUT_FILE, outputContent);
console.log(`Generated ${OUTPUT_FILE}`);
