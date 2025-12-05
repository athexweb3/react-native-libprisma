#include "LibprismaModule.h"
#include "pch.h"
#include <winrt/Microsoft.ReactNative.h>

using namespace winrt::Microsoft::ReactNative;

namespace winrt::Libprisma {
/**
 * React Package Provider for LibPrisma
 * Registers the Turbo Module with React Native Windows
 */
void RegisterLibprismaPackage(
    winrt::Microsoft::ReactNative::IReactPackageBuilder const
        &packageBuilder) noexcept {
  // Register the Turbo Module
  packageBuilder.AddModule(L"Libprisma", MakeModuleProvider<LibprismaModule>());
}
} // namespace winrt::Libprisma
