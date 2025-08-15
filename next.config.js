/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable font optimization to avoid lightningcss issues
  optimizeFonts: false,
  // Ensure proper output for Vercel
  output: 'standalone',
  // Disable image optimization if not needed
  images: {
    unoptimized: true,
  },
  // Ensure proper transpilation
  transpilePackages: ['@supabase/supabase-js'],
  // Add experimental features for better compatibility
  experimental: {
    // Disable app directory features that might cause issues
    appDir: true,
  },
  // Ensure proper webpack configuration
  webpack: (config, { isServer }) => {
    // Ensure proper module resolution
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    return config;
  },
}

module.exports = nextConfig
