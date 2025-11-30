#include "HybridLibprisma.hpp"
#include "EmbeddedGrammars.h"
#include "libprisma/TokenList.h"
#include <sstream>

namespace margelo::nitro::libprisma {

HybridLibprisma::~HybridLibprisma() {}

void HybridLibprisma::ensureHighlighterLoaded() {
  if (m_highlighter) {
    return;
  }

  // Use embedded grammars data
  std::string grammarsData(reinterpret_cast<const char *>(GRAMMARS_DATA),
                           GRAMMARS_DATA_SIZE);

  m_highlighter = std::make_shared<SyntaxHighlighter>(grammarsData);
}

std::string HybridLibprisma::tokenizeToJson(const std::string &code,
                                            const std::string &language) {
  ensureHighlighterLoaded();

  TokenList tokens = m_highlighter->tokenize(code, language);
  return tokensToJson(tokens);
}

std::string HybridLibprisma::escapeJson(const std::string &str) {
  std::stringstream escaped;
  for (char c : str) {
    switch (c) {
    case '"':
      escaped << "\\\"";
      break;
    case '\\':
      escaped << "\\\\";
      break;
    case '\b':
      escaped << "\\b";
      break;
    case '\f':
      escaped << "\\f";
      break;
    case '\n':
      escaped << "\\n";
      break;
    case '\r':
      escaped << "\\r";
      break;
    case '\t':
      escaped << "\\t";
      break;
    default:
      escaped << c;
      break;
    }
  }
  return escaped.str();
}

std::string HybridLibprisma::tokensToJson(const TokenList &tokenList) {
  std::stringstream json;
  json << "[";

  bool first = true;
  for (auto it = tokenList.begin(); it != tokenList.end(); ++it) {
    if (!first)
      json << ",";
    first = false;
    json << tokenNodeToJson(*it);
  }

  json << "]";
  return json.str();
}

std::string HybridLibprisma::tokenNodeToJson(const TokenListNode &node) {
  std::stringstream json;
  json << "{";

  if (node.isSyntax()) {
    const auto &syntax = dynamic_cast<const Syntax &>(node);

    json << "\"type\":\"" << escapeJson(syntax.type()) << "\"";

    if (!syntax.alias().empty()) {
      json << ",\"alias\":\"" << escapeJson(syntax.alias()) << "\"";
    }

    // Check if there are nested tokens
    const TokenList &nested = syntax.children();
    if (nested.begin() != nested.end()) {
      json << ",\"content\":" << tokensToJson(nested);
    } else {
      json << ",\"content\":\"\"";
    }
  } else {
    const auto &text = dynamic_cast<const Text &>(node);
    json << "\"type\":\"text\"";
    json << ",\"content\":\"" << escapeJson(std::string(text.value())) << "\"";
  }

  json << "}";
  return json.str();
}

} // namespace margelo::nitro::libprisma
