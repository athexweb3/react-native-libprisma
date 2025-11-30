require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "Libprisma"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://github.com/athexweb3/react-native-libprisma.git", :tag => "#{s.version}" }

   s.source_files = [
    # Implementation (Swift)
    "ios/**/*.{swift}",
    # Autolinking/Registration (Objective-C++)
    "ios/**/*.{m,mm}",
    # Implementation (C++ objects)
    "cpp/**/*.{hpp,cpp}",
  ]

  s.pod_target_xcconfig = {
    'HEADER_SEARCH_PATHS' => '"$(PODS_TARGET_SRCROOT)/cpp" "$(PODS_TARGET_SRCROOT)/cpp/libprisma" "$(PODS_TARGET_SRCROOT)/nitrogen/generated/shared/c++"'
  }

  s.dependency 'React-jsi'
  s.dependency 'React-callinvoker'
  s.library = 'z'

  load 'nitrogen/generated/ios/Libprisma+autolinking.rb'
  add_nitrogen_files(s)

  install_modules_dependencies(s)
end
