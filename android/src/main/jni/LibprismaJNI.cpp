#include "Libprisma.hpp"
#include <jni.h>
#include <string>

using namespace athex::libprisma;

// Global instance of Libprisma
static Libprisma *libprismaInstance = nullptr;

extern "C" {

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM *vm, void *reserved) {
  JNIEnv *env;
  if (vm->GetEnv(reinterpret_cast<void **>(&env), JNI_VERSION_1_6) != JNI_OK) {
    return JNI_ERR;
  }

  // Initialize the global Libprisma instance
  if (libprismaInstance == nullptr) {
    libprismaInstance = new Libprisma();
  }

  return JNI_VERSION_1_6;
}

JNIEXPORT void JNICALL JNI_OnUnload(JavaVM *vm, void *reserved) {
  if (libprismaInstance != nullptr) {
    delete libprismaInstance;
    libprismaInstance = nullptr;
  }
}

JNIEXPORT jstring JNICALL
Java_com_athex_libprisma_LibprismaModule_nativeTokenizeToJson(
    JNIEnv *env, jobject /* this */, jstring code, jstring language) {

  if (libprismaInstance == nullptr) {
    return env->NewStringUTF("[]");
  }

  const char *codeStr = env->GetStringUTFChars(code, nullptr);
  const char *langStr = env->GetStringUTFChars(language, nullptr);

  std::string result = libprismaInstance->tokenizeToJson(std::string(codeStr),
                                                         std::string(langStr));

  env->ReleaseStringUTFChars(code, codeStr);
  env->ReleaseStringUTFChars(language, langStr);

  return env->NewStringUTF(result.c_str());
}

JNIEXPORT void JNICALL
Java_com_athex_libprisma_LibprismaModule_nativeLoadGrammars(JNIEnv *env,
                                                            jobject /* this */,
                                                            jstring grammars) {

  if (libprismaInstance == nullptr) {
    return;
  }

  const char *grammarsStr = env->GetStringUTFChars(grammars, nullptr);
  libprismaInstance->loadGrammars(std::string(grammarsStr));
  env->ReleaseStringUTFChars(grammars, grammarsStr);
}

} // extern "C"
