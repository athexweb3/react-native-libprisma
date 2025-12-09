#pragma once

#include "Libprisma.hpp"
#include "NativeModules.h"
#include "pch.h"
#include <memory>

namespace winrt::Libprisma {
/**
 * Windows Turbo Module for LibPrisma
 * Provides high-performance syntax highlighting using C++ implementation
 */
REACT_MODULE(LibprismaModule)
struct LibprismaModule {
  REACT_INIT(Initialize)
  void Initialize(winrt::Microsoft::ReactNative::ReactContext const
                      &reactContext) noexcept {
    m_reactContext = reactContext;
    m_libprisma = std::make_shared<athex::libprisma::Libprisma>();
  }

  /**
   * Tokenize source code into syntax-highlighted tokens.
   * Returns a JSON string representation.
   *
   * @param code The source code to tokenize
   * @param language The language identifier (e.g., "javascript", "python",
   * "cpp")
   * @return JSON string representing an array of tokens
   */
  REACT_METHOD(TokenizeToJson, L"tokenizeToJson")
  std::wstring TokenizeToJson(std::wstring code,
                              std::wstring language) noexcept {
    try {
      // Convert wide string to UTF-8
      std::string codeUtf8 = winrt::to_string(code);
      std::string langUtf8 = winrt::to_string(language);

      // Call C++ implementation
      std::string resultUtf8 = m_libprisma->tokenizeToJson(codeUtf8, langUtf8);

      // Convert back to wide string
      return winrt::to_hstring(resultUtf8);
    } catch (const std::exception &ex) {
      // Return empty array on error
      return L"[]";
    }
  }

  /**
   * Load grammars from a base64 string.
   * This should be called once before using tokenizeToJson.
   *
   * @param grammars Base64 encoded grammar data
   */
  REACT_METHOD(LoadGrammars, L"loadGrammars")
  void LoadGrammars(std::wstring grammars) noexcept {
    try {
      // Convert wide string to UTF-8
      std::string grammarsUtf8 = winrt::to_string(grammars);

      // Call C++ implementation
      m_libprisma->loadGrammars(grammarsUtf8);
    } catch (const std::exception &ex) {
      // Silently handle errors
    }
  }

private:
  winrt::Microsoft::ReactNative::ReactContext m_reactContext{nullptr};
  std::shared_ptr<athex::libprisma::Libprisma> m_libprisma;
};
} // namespace winrt::Libprisma
