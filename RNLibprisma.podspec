require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "RNLibprisma"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported, :osx => '12.0' }
  s.source       = { :git => "https://github.com/athexweb3/react-native-libprisma.git", :tag => "#{s.version}" }

  fabric_enabled = true

  s.source_files = "apple/**/*.{h,mm}"
  s.header_mappings_dir = "apple"
  
  # Platform-specific exclusions
  s.ios.exclude_files = '**/*.macos.{h,m,mm}'
  s.osx.exclude_files = '**/*.ios.{h,m,mm}'



  s.pod_target_xcconfig = {
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
    'HEADER_SEARCH_PATHS' => '"$(PODS_TARGET_SRCROOT)/common/cpp"'
  }

  s.dependency 'React-Core'
  s.library = 'z'

  if fabric_enabled
    install_modules_dependencies(s)

    s.subspec "common" do |ss|
      ss.source_files         = "common/cpp/**/*.{hpp,cpp,h}"
      ss.header_dir           = "libprisma"
      ss.pod_target_xcconfig  = { "HEADER_SEARCH_PATHS" => "\"$(PODS_TARGET_SRCROOT)/common/cpp\"" }
    end
  end
end
