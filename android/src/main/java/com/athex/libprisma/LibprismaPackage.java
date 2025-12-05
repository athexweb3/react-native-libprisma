package com.athex.libprisma;

import androidx.annotation.Nullable;
import com.facebook.react.TurboReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.model.ReactModuleInfo;
import com.facebook.react.module.model.ReactModuleInfoProvider;

import java.util.HashMap;
import java.util.Map;

public class LibprismaPackage extends TurboReactPackage {

  @Nullable
  @Override
  public NativeModule getModule(String name, ReactApplicationContext reactContext) {
    if (name.equals(LibprismaModule.NAME)) {
      return new LibprismaModule(reactContext);
    }
    return null;
  }

  @Override
  public ReactModuleInfoProvider getReactModuleInfoProvider() {
    return () -> {
      final Map<String, ReactModuleInfo> moduleInfos = new HashMap<>();
      moduleInfos.put(
        LibprismaModule.NAME,
        new ReactModuleInfo(
          LibprismaModule.NAME,
          LibprismaModule.class.getName(),
          false, // canOverrideExistingModule
          false, // needsEagerInit
          true,  // isCxxModule
          true   // isTurboModule
        )
      );
      return moduleInfos;
    };
  }
}
