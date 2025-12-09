cmake_minimum_required(VERSION 3.13)
project(ReactNativeLibprisma)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_VERBOSE_MAKEFILE ON)

# Enable C++/WinRT
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} /await /EHsc /DWIN32 /D_WINDOWS")

# Project source files
set(SOURCE_FILES
    pch.cpp
    LibprismaModule.cpp
    ReactPackageProvider.cpp
    ../common/cpp/Libprisma.cpp
    ../common/cpp/libprisma/SyntaxHighlighter.cpp
    ../common/cpp/libprisma/TokenList.cpp
    ../common/cpp/libprisma/LanguageTree.cpp
    ../common/cpp/libprisma/Highlight.cpp
)

# Create the DLL
add_library(${PROJECT_NAME} SHARED ${SOURCE_FILES})

# Include directories
target_include_directories(${PROJECT_NAME} PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${CMAKE_CURRENT_SOURCE_DIR}/../common/cpp
    ${CMAKE_CURRENT_SOURCE_DIR}/../common/cpp/libprisma
)

# Precompiled headers
target_precompile_headers(${PROJECT_NAME} PRIVATE pch.h)

# Link against zlib for gzip decompression
find_package(ZLIB REQUIRED)
target_link_libraries(${PROJECT_NAME} PRIVATE
    ZLIB::ZLIB
)

# Windows-specific settings
if(MSVC)
    target_compile_definitions(${PROJECT_NAME} PRIVATE
        _UNICODE
        UNICODE
        WINRT_LEAN_AND_MEAN
    )
    
    target_compile_options(${PROJECT_NAME} PRIVATE
        /W3
        /bigobj
    )
endif()

# DLL exports
set_target_properties(${PROJECT_NAME} PROPERTIES
    WINDOWS_EXPORT_ALL_SYMBOLS ON
)

# Output directory
set_target_properties(${PROJECT_NAME} PROPERTIES
    ARCHIVE_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/lib"
    LIBRARY_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/lib"
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/bin"
)

message(STATUS "LibPrisma Windows build configured")
message(STATUS "C++ Standard: ${CMAKE_CXX_STANDARD}")
message(STATUS "Build type: ${CMAKE_BUILD_TYPE}")
