/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.pokemontcg.io' },
      { protocol: 'https', hostname: 'assets.tcgdex.net' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
    ],
  },
}

module.exports = nextConfig
