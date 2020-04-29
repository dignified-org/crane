/* eslint-disable */
const webpack = require('webpack');
const nextSourceMaps = require('@zeit/next-source-maps');

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config();
}

module.exports = nextSourceMaps({
  env: {
    SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY,
    SHOPIFY_APP_HANDLE: process.env.SHOPIFY_APP_HANDLE,
    SENTRY_DSN: process.env.SENTRY_DSN,
  },
  webpack: (config, { isServer, buildId }) => {
    // Sentry
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.SENTRY_RELEASE': JSON.stringify(buildId),
      }),
    );

    if (!isServer) {
      config.resolve.alias['@sentry/node'] = '@sentry/browser';
    }

    // *.graphql loader
    config.module.rules.push({
      test: /\.(graphql|gql)$/,
      exclude: /node_modules/,
      loader: 'graphql-tag/loader',
    });

    return config;
  },
});
