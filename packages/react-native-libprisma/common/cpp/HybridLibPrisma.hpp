#pragma once

#include "HybridLibPrismaSpec.hpp"
#include "Libprisma.hpp"
#include <memory>

namespace margelo::nitro::libprisma {

using namespace margelo::nitro;

/**
 * Nitro Hybrid Object wrapper for LibPrisma C++ implementation.
 * This bridges the standalone C++ library to Nitro Modules.
 */
class HybridLibPrisma : public HybridLibPrismaSpec {
public:
  explicit HybridLibPrisma() : HybridObject(TAG) {
    _impl = std::make_shared<athex::libprisma::Libprisma>();
  }

  /**
   * Tokenize source code into JSON tokens
   */
  std::string tokenizeToJson(const std::string &code,
                             const std::string &language) override {
    return _impl->tokenizeToJson(code, language);
  }

  /**
   * Load grammars from base64-encoded gzipped data
   */
  void loadGrammars(const std::string &grammars) override {
    _impl->loadGrammars(grammars);
  }

private:
  static constexpr auto TAG = "LibPrisma";
  std::shared_ptr<athex::libprisma::Libprisma> _impl;
};

} // namespace margelo::nitro::libprisma
