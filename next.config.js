/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable font optimization to avoid lightningcss issues
  optimizeFonts: false,
  // Disable image optimization if not needed
  images: {
    unoptimized: true,
  },
  // Ensure proper transpilation
  transpilePackages: ['@supabase/supabase-js'],
}

module.exports = nextConfig
