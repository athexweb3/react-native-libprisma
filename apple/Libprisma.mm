#import "Libprisma.h"
#import "Libprisma.hpp"
#import <Foundation/Foundation.h>
#import <memory>
#import <string>

@implementation Libprisma {
  std::shared_ptr<athex::libprisma::Libprisma> _libprisma;
}

RCT_EXPORT_MODULE(NativeLibprisma)

- (instancetype)init {
  if (self = [super init]) {
    _libprisma = std::make_shared<athex::libprisma::Libprisma>();
  }
  return self;
}

- (NSString *)tokenizeToJson:(NSString *)code language:(NSString *)language {
  // Safely convert NSString to std::string with null checks
  const char *codePtr = [code UTF8String];
  const char *langPtr = [language UTF8String];

  if (!codePtr || !langPtr) {
    NSLog(@"[Libprisma] Error: NULL string passed to tokenizeToJson");
    return @"[]";
  }

  std::string codeStr = std::string(codePtr);
  std::string langStr = std::string(langPtr);

  std::string result = _libprisma->tokenizeToJson(codeStr, langStr);

  return [NSString stringWithUTF8String:result.c_str()];
}

- (void)loadGrammars:(NSString *)grammars {
  const char *grammarsPtr = [grammars UTF8String];

  if (!grammarsPtr) {
    NSLog(@"[Libprisma] Error: NULL string passed to loadGrammars");
    return;
  }

  std::string grammarsStr = std::string(grammarsPtr);
  _libprisma->loadGrammars(grammarsStr);
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeLibprismaSpecJSI>(params);
}

@end
