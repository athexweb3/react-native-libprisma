#pragma once

#include <winrt/Microsoft.ReactNative.h>

namespace winrt::Libprisma {
/**
 * Registers the LibPrisma Turbo Module with React Native Windows
 *
 * @param packageBuilder The React Native package builder
 */
void RegisterLibprismaPackage(
    winrt::Microsoft::ReactNative::IReactPackageBuilder const
        &packageBuilder) noexcept;
} // namespace winrt::Libprisma
