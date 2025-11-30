project(libprisma)
cmake_minimum_required(VERSION 3.9.0)

set (PACKAGE_NAME libprisma)
set (CMAKE_VERBOSE_MAKEFILE ON)
set (CMAKE_CXX_STANDARD 20)

# Collect all libprisma source files
file(GLOB LIBPRISMA_SOURCES "../cpp/libprisma/*.cpp")

# Define C++ library and add all sources
add_library(${PACKAGE_NAME} SHARED
        src/main/cpp/cpp-adapter.cpp
        ../cpp/HybridLibprisma.cpp
        ${LIBPRISMA_SOURCES}
)

# Add Nitrogen specs :)
include(${CMAKE_SOURCE_DIR}/../nitrogen/generated/android/libprisma+autolinking.cmake)

# Set up local includes
include_directories(
        "src/main/cpp"
        "../cpp"
        "../cpp/libprisma"
)

find_library(LOG_LIB log)

# Link all libraries together
target_link_libraries(
        ${PACKAGE_NAME}
        ${LOG_LIB}
        android                                   # <-- Android core
)
