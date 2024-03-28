/** @type {import('next').NextConfig} */

// Added from github discussion: https://github.com/Automattic/node-canvas/issues/867
// Needed for react-pdf to work (otherwise it will give errors)
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