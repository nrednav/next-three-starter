module.exports = {
  webpack: (config, options) => {
    // Setup raw-loader to load shader files as strings
    config.module.rules.push({
      test: /\.(frag|vert|glsl)$/,
      use: "raw-loader",
    });

    return config;
  },
};
