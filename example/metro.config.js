// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const root = path.resolve(__dirname, '..');
const packagesDir = path.join(root, 'packages');

/** @type {import('expo/metro-config').MetroConfig} */
const options = {
    watchFolders: [root],

    resolver: {
        nodeModulesPaths: [
            path.join(__dirname, 'node_modules'),
            path.join(root, 'node_modules'),
        ],
        extraNodeModules: {
            stream: require.resolve('readable-stream'),
        },
    },

    transformer: {
        getTransformOptions: async () => ({
            transform: {
                experimentalImportSupport: false,
                inlineRequires: true,
            },
        }),
    },
};

const config = getDefaultConfig(__dirname, options);

module.exports = config;
