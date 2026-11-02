// craco.config.js
module.exports = {
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