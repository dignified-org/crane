/* eslint-disable */
const webpack = require('webpack');
const nextSourceMaps = require('@zeit/next-source-maps');

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config();
}

module.exports = nextSourceMaps({
  env: {
    SENTRY_DSN: process.env.SENTRY_DSN,
    SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY,
    SHOPIFY_APP_HANDLE: process.env.SHOPIFY_APP_HANDLE,
    PUSHER_API_KEY: process.env.PUSHER_API_KEY,
    PUSHER_CLUSTER: process.env.PUSHER_CLUSTER,
    VERCEL_API_KEY: process.env.VERCEL_API_KEY,
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
