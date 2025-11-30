#pragma once

#include "HybridLibprismaSpec.hpp"
#include "libprisma/SyntaxHighlighter.h"
#include "libprisma/TokenList.h"
#include <memory>
#include <string>

namespace margelo::nitro::libprisma {

using namespace margelo::nitro;

/**
 * C++ implementation of the Libprisma Hybrid Object.
 * Provides high-performance syntax highlighting using the libprisma C++
 * library.
 */
class HybridLibprisma : public HybridLibprismaSpec {
public:
  explicit HybridLibprisma() : HybridObject(TAG) {}
  virtual ~HybridLibprisma();

  /**
   * Tokenize source code into syntax-highlighted tokens.
   * Returns a JSON string representation.
   *
   * @param code The source code to tokenize
   * @param language The language identifier (e.g., "javascript", "python")
   * @return JSON string representing an array of tokens
   */
  std::string tokenizeToJson(const std::string &code,
                             const std::string &language) override;

  /**
   * Load grammars from a base64 string.
   */
  void loadGrammars(const std::string &grammars) override;

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

} // namespace margelo::nitro::libprisma
