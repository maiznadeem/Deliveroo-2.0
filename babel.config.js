// babel-preset-expo adds the react-native-worklets (Reanimated 4) plugin by itself; don't add it here.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
  };
};
