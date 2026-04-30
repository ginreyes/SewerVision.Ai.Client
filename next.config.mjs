/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        unoptimized: true,
    },
    compiler: {
        removeConsole:
            process.env.NODE_ENV === 'production'
                ? { exclude: ['error', 'warn'] }
                : false,
    },
    experimental: {
        optimizePackageImports: ['lucide-react', 'date-fns', 'framer-motion'],
    },
};

export default nextConfig;
