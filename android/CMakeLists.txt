cmake_minimum_required(VERSION 3.13)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_VERBOSE_MAKEFILE ON)

project(libprisma)

set(PACKAGE_NAME "libprisma")
set(BUILD_DIR ${CMAKE_SOURCE_DIR}/build)

# Find React Native
find_package(ReactAndroid REQUIRED CONFIG)
find_package(fbjni REQUIRED CONFIG)

# Add C++ source files
add_library(
    ${PACKAGE_NAME}
    SHARED
    # JNI Bridge
    src/main/jni/LibprismaJNI.cpp
    # C++ Implementation
    ../common/cpp/Libprisma.cpp
    ../common/cpp/libprisma/SyntaxHighlighter.cpp
    ../common/cpp/libprisma/TokenList.cpp
    ../common/cpp/libprisma/LanguageTree.cpp
    ../common/cpp/libprisma/Highlight.cpp
)

# Include directories
target_include_directories(
    ${PACKAGE_NAME}
    PRIVATE
    ../common/cpp
    ../common/cpp/libprisma
)

# Link libraries
target_link_libraries(
    ${PACKAGE_NAME}
    ReactAndroid::jsi
    fbjni::fbjni
    android
    log
    z  # zlib for gzip decompression
)
