// craco.config.js
module.exports = {
  devServer: (devServerConfig) => {
    devServerConfig.client = devServerConfig.client || {};
    devServerConfig.client.overlay = devServerConfig.client.overlay || {};
    devServerConfig.client.overlay.runtimeErrors = (error) =>
      !error.message.includes(
        'ResizeObserver loop completed with undelivered notifications.',
      );

    return devServerConfig;
  },
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.module.rules = webpackConfig.module.rules.map((rule) => {
        if (rule.loader?.includes("source-map-loader")) {
          return {
            ...rule,
            exclude: /node_modules/,
          };
        }

        return rule;
      });

      return webpackConfig;
    },
  },
};