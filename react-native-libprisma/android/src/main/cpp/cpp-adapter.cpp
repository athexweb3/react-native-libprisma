#include <jni.h>
#include "libprismaOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return margelo::nitro::libprisma::initialize(vm);
}
