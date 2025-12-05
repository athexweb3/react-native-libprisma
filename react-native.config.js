/**
 * @type {import('@react-native-community/cli-types').UserDependencyConfig}
 */
module.exports = {
  dependency: {
    platforms: {
      android: {
        cmakeListsPath: 'android/CMakeLists.txt',
        packageImportPath: 'import com.athex.libprisma;',
        packageInstance: 'new LibprismaPackage()',
      },
    },
  },
};
