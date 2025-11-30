#include "HybridLibprisma.hpp"
#include "libprisma/TokenList.h"
#include <sstream>
#include <vector>

namespace margelo::nitro::libprisma {

HybridLibprisma::~HybridLibprisma() {}

#include <zlib.h>

void HybridLibprisma::loadGrammars(const std::string &grammars) {
  if (m_highlighter) {
    return;
  }
  std::string decoded = base64_decode(grammars);
  std::string decompressed = gzip_decompress(decoded);
  m_highlighter = std::make_shared<SyntaxHighlighter>(decompressed);
}

std::string HybridLibprisma::gzip_decompress(const std::string &data) {
  z_stream zs;
  memset(&zs, 0, sizeof(zs));

  if (inflateInit2(&zs, 16 + MAX_WBITS) != Z_OK) {
    throw std::runtime_error("inflateInit2 failed while decompressing.");
  }

  zs.next_in = (Bytef *)data.data();
  zs.avail_in = data.size();

  int ret;
  char buffer[32768];
  std::string outstring;

  do {
    zs.next_out = reinterpret_cast<Bytef *>(buffer);
    zs.avail_out = sizeof(buffer);

    ret = inflate(&zs, 0);

    if (outstring.size() < zs.total_out) {
      outstring.append(buffer, zs.total_out - outstring.size());
    }

  } while (ret == Z_OK);

  inflateEnd(&zs);

  if (ret != Z_STREAM_END) {
    throw std::runtime_error("Exception during zlib decompression: (" +
                             std::to_string(ret) + ") " + zs.msg);
  }

  return outstring;
}

std::string HybridLibprisma::tokenizeToJson(const std::string &code,
                                            const std::string &language) {
  if (!m_highlighter) {
    // Fallback or error if grammars not loaded?
    // For now, let's just return empty array or handle gracefully
    // But ideally loadGrammars should be called first.
    return "[]";
  }

  TokenList tokens = m_highlighter->tokenize(code, language);
  return tokensToJson(tokens);
}

std::string HybridLibprisma::base64_decode(const std::string &in) {
  std::string out;
  std::vector<int> T(256, -1);
  for (int i = 0; i < 64; i++)
    T["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[i]] =
        i;

  int val = 0, valb = -8;
  for (unsigned char c : in) {
    if (T[c] == -1)
      break;
    val = (val << 6) + T[c];
    valb += 6;
    if (valb >= 0) {
      out.push_back(char((val >> valb) & 0xFF));
      valb -= 8;
    }
  }
  return out;
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
