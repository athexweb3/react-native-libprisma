package com.athex.libprisma;

import androidx.annotation.NonNull;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.annotations.ReactModule;

@ReactModule(name = LibprismaModule.NAME)
public class LibprismaModule extends NativeLibprismaSpec {
  public static final String NAME = "Libprisma";

  static {
    System.loadLibrary("libprisma");
  }

  public LibprismaModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  @NonNull
  public String getName() {
    return NAME;
  }

  @Override
  public String tokenizeToJson(String code, String language) {
    return nativeTokenizeToJson(code, language);
  }

  @Override
  public void loadGrammars(String grammars) {
    nativeLoadGrammars(grammars);
  }

  // Native methods (JNI)
  private native String nativeTokenizeToJson(String code, String language);
  private native void nativeLoadGrammars(String grammars);
}
