#pragma once
#include <functional>
#include <map>
#include <regex>
#include <string>
#include <vector>

class GrammarPtr;
class GrammarToken;
class Pattern;
class TokenList;

class LanguageTree;

struct Grammar {
  std::vector<GrammarToken> tokens;
};

class GrammarPtr {
public:
  GrammarPtr(std::shared_ptr<LanguageTree> tree, size_t path);

  const Grammar *operator->() const;
  const Grammar *get() const;

private:
  std::shared_ptr<LanguageTree> m_tree;
  size_t m_path;
};

class PatternRaw {
public:
  PatternRaw(std::string_view pattern,
             std::regex_constants::syntax_option_type flags, bool lookbehind,
             bool greedy, std::string alias, std::shared_ptr<GrammarPtr> inside)
      : m_regex(std::string{pattern}), m_flags(flags), m_lookbehind(lookbehind),
        m_greedy(greedy), m_alias(alias), m_inside(inside) {}

  std::shared_ptr<Pattern> realize();

private:
  std::string m_regex;
  std::regex_constants::syntax_option_type m_flags;
  bool m_lookbehind;
  bool m_greedy;
  std::string m_alias;
  std::shared_ptr<GrammarPtr> m_inside;
};

class Pattern {
public:
  Pattern(std::string_view pattern,
          std::regex_constants::syntax_option_type flags, bool lookbehind,
          bool greedy, std::string alias, std::shared_ptr<GrammarPtr> inside)
      : m_lookbehind(lookbehind), m_greedy(greedy), m_alias(alias),
        m_inside(inside) {
    try {
      m_regex = std::regex(std::string{pattern},
                           flags | std::regex_constants::optimize);
    } catch (const std::regex_error &e) {
      // Log error and fallback to a regex that never matches
      printf("Libprisma Regex Error: %s | Pattern: %s\n", e.what(),
             std::string(pattern).c_str());
      m_regex = std::regex("$^", std::regex_constants::optimize);
    }
  }

  std::string_view match(bool &success, size_t &pos,
                         std::string_view text) const {
    std::cmatch m;

    auto match = std::regex_search(text.data() + pos, text.data() + text.size(),
                                   m, m_regex);
    if (match) {
      success = true;
      pos += m.position();

      if (m_lookbehind && m[1].matched) {
        // change the match to remove the text matched by the Prism lookbehind
        // group
        auto lookbehindLength = m[1].length();
        pos += lookbehindLength;

        return text.substr(pos, m[0].length() - lookbehindLength);
      }

      return text.substr(pos, m[0].length());
    }

    return {};
  }

  bool lookbehind() const { return m_lookbehind; }

  bool greedy() const { return m_greedy; }

  std::string alias() const { return m_alias; }

  const Grammar *inside() const;

private:
  std::regex m_regex;
  bool m_lookbehind;
  bool m_greedy;
  std::string m_alias;
  std::shared_ptr<GrammarPtr> m_inside;
};

class PatternPtr {
public:
  PatternPtr(std::shared_ptr<LanguageTree> tree, size_t path);

  const Pattern *operator->() const { return get(); }

  const Pattern *get() const;

private:
  std::shared_ptr<LanguageTree> m_tree;
  size_t m_path;
};

class GrammarToken {
public:
  GrammarToken(const std::string name, std::vector<PatternPtr> patterns)
      : m_name(name), m_patterns(std::move(patterns)) {}

  const std::string &name() const { return m_name; }

  std::vector<PatternPtr>::const_iterator cbegin() const noexcept {
    return m_patterns.cbegin();
  }

  std::vector<PatternPtr>::const_iterator cend() const noexcept {
    return m_patterns.cend();
  }

private:
  std::string m_name;
  const std::vector<PatternPtr> m_patterns;
};
