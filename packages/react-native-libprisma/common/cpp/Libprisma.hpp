#pragma once

#include "libprisma/SyntaxHighlighter.h"
#include "libprisma/TokenList.h"
#include <memory>
#include <string>

namespace athex {
namespace libprisma {

/**
 * Pure C++ implementation of the Libprisma syntax highlighter.
 * Provides high-performance syntax highlighting using the libprisma C++
 * library. This class is standalone and can be used from any bridge layer
 * (Turbo Modules, etc).
 */
class Libprisma {
public:
  Libprisma() = default;
  ~Libprisma() = default;

  /**
   * Tokenize source code into syntax-highlighted tokens.
   * Returns a JSON string representation.
   *
   * @param code The source code to tokenize
   * @param language The language identifier (e.g., "javascript", "python")
   * @return JSON string representing an array of tokens
   */
  std::string tokenizeToJson(const std::string &code,
                             const std::string &language);

  /**
   * Load grammars from a base64 string.
   * This should be called once before using tokenizeToJson.
   *
   * @param grammars Base64-encoded gzipped grammar data
   */
  void loadGrammars(const std::string &grammars);

private:
  std::shared_ptr<SyntaxHighlighter> m_highlighter;

  /**
   * Convert a TokenList to JSON string
   */
  std::string tokensToJson(const TokenList &tokens);

  /**
   * Convert a single TokenListNode to JSON
   */
  std::string tokenNodeToJson(const TokenListNode &node);

  /**
   * Escape a string for JSON
   */
  std::string escapeJson(const std::string &str);

  /**
   * Decode base64 string
   */
  std::string base64_decode(const std::string &in);

  /**
   * Decompress gzip data
   */
  std::string gzip_decompress(const std::string &data);
};

} // namespace libprisma
} // namespace athex
