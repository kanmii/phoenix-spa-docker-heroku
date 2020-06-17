const { paths: rewiredPaths } = require("react-app-rewired");
const rewireReactHotLoader = require("react-app-rewire-hot-loader");

module.exports = function override(config, env) {
  config = rewireReactHotLoader(config, env);

  return config;
};
