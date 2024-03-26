/** @type {import('next').NextConfig} */

// Added from github discussion: https://github.com/Automattic/node-canvas/issues/867
// Fixed a module parse issue
const nextConfig = {
    webpack: (
        config,
        { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
    ) => {
        config.externals.push({ canvas: 'commonjs canvas' })
        return config
    },
};

export default nextConfig;