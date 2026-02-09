<script setup lang="ts">
import { useArtworksStore } from '~/stores/artworks'
import { useArtistsStore } from '~/stores/artists'

const artworksStore = useArtworksStore()
const artistsStore = useArtistsStore()

// Fetch data on mount
onMounted(async () => {
  await Promise.all([
    artworksStore.fetchArtworks({ limit: 12, featured: true }),
    artistsStore.fetchArtists({ limit: 8, featured: true }),
  ])
})

// Computed properties for template
const featuredArtwork = computed(() => artworksStore.artworks[0] || null)
const featuredArtworks = computed(() => artworksStore.artworks.slice(0, 8))
const artists = computed(() => artistsStore.artists)
const isLoading = computed(() => artworksStore.loading || artistsStore.loading)

// Get primary image URL for an artwork
function getArtworkImage(artwork: any) {
  if (!artwork) return 'https://images.unsplash.com/photo-1582582621959-48d27397dc69?w=800&q=80'
  const primaryImage = artwork.images?.find((img: any) => img.isPrimary)
  return primaryImage?.url || artwork.images?.[0]?.url || 'https://images.unsplash.com/photo-1582582621959-48d27397dc69?w=800&q=80'
}

// Static data - to be replaced with API calls later
const collections = [
  { id: '1', title: 'West African Textiles', imageUrl: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=800&q=80', itemCount: 42 },
  { id: '2', title: 'East African Beadwork', imageUrl: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800&q=80', itemCount: 38 },
  { id: '3', title: 'Bronze & Metal Art', imageUrl: 'https://images.unsplash.com/photo-1578926288207-a90a5366759d?w=800&q=80', itemCount: 24 },
  { id: '4', title: 'Contemporary African', imageUrl: 'https://images.unsplash.com/photo-1582582621959-48d27397dc69?w=800&q=80', itemCount: 56 },
  { id: '5', title: 'Tribal Masks', imageUrl: 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=800&q=80', itemCount: 31 },
]

const stories = [
  { id: '1', title: 'The Renaissance of African Art on the Global Stage', imageUrl: 'https://images.unsplash.com/photo-1582582621959-48d27397dc69?w=800&q=80', category: 'Art History', readTime: '5 min read' },
  { id: '2', title: 'Preserving Traditional Craftsmanship in Modern Times', imageUrl: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=800&q=80', category: 'Culture', readTime: '8 min read' },
  { id: '3', title: 'Interview: Rising Stars of Contemporary African Art', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80', category: 'Interviews', readTime: '12 min read' },
  { id: '4', title: 'The Symbolism Behind Kente Cloth Patterns', imageUrl: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800&q=80', category: 'Traditions', readTime: '6 min read' },
  { id: '5', title: 'Bronze Casting: The Benin Kingdom Legacy', imageUrl: 'https://images.unsplash.com/photo-1578926288207-a90a5366759d?w=800&q=80', category: 'History', readTime: '7 min read' },
]

const trendingArtworks = [
  { id: '1', title: 'Ancestral Voices', artist: 'Tendai Moyo', imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80', year: 2024 },
  { id: '2', title: 'Motherland', artist: 'Zainab Mensah', imageUrl: 'https://images.unsplash.com/photo-1504173010664-32509aeebb62?w=800&q=80', year: 2023 },
  { id: '3', title: 'Desert Winds', artist: 'Yusuf Diallo', imageUrl: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&q=80', year: 2024 },
  { id: '4', title: 'Village Stories', artist: 'Amara Okafor', imageUrl: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800&q=80', year: 2022 },
  { id: '5', title: 'Golden Threads', artist: 'Ama Serwaa', imageUrl: 'https://images.unsplash.com/photo-1590845947698-8924d7409b56?w=800&q=80', year: 2024 },
  { id: '6', title: 'River of Life', artist: 'Fatou Ndiaye', imageUrl: 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=800&q=80', year: 2023 },
]

const categories = [
  { name: 'Paintings', slug: 'paintings', imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&q=80', count: 0 },
  { name: 'Sculptures', slug: 'sculptures', imageUrl: 'https://images.unsplash.com/photo-1578926288207-a90a5366759d?w=600&q=80', count: 0 },
  { name: 'Textiles', slug: 'textiles', imageUrl: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=600&q=80', count: 0 },
  { name: 'Beadwork', slug: 'beadwork', imageUrl: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=600&q=80', count: 0 },
  { name: 'Masks', slug: 'masks', imageUrl: 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=600&q=80', count: 0 },
  { name: 'Pottery', slug: 'pottery', imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80', count: 0 },
]
</script>

<template>
  <div>
    <!-- Loading State -->
    <div v-if="isLoading && !featuredArtwork" class="min-h-[75vh] flex items-center justify-center bg-earth-100">
      <div class="text-center">
        <div class="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-bark-600">Loading artworks...</p>
      </div>
    </div>

    <!-- Hero Section -->
    <section v-else class="relative h-[75vh] sm:h-[85vh] overflow-hidden">
      <img
        :src="featuredArtwork ? getArtworkImage(featuredArtwork) : 'https://images.unsplash.com/photo-1582582621959-48d27397dc69?w=1920&q=80'"
        :alt="featuredArtwork?.title || 'African Art'"
        class="absolute inset-0 w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-bark-950/90 via-bark-900/40 to-transparent"></div>

      <!-- Decorative Pattern Overlay -->
      <div class="absolute inset-0 opacity-10 bg-repeat" style="background-image: url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23d99f13&quot; fill-opacity=&quot;0.4&quot;%3E%3Cpath d=&quot;M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"></div>

      <div class="absolute inset-0 flex items-end">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 lg:pb-24 w-full">
          <div class="max-w-2xl">
            <span class="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-500/90 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-5">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              Featured Masterpiece
            </span>
            <h1 class="text-3xl sm:text-4xl lg:text-6xl font-display font-bold text-white mb-4 leading-tight">
              {{ featuredArtwork?.title || 'Discover African Art' }}
            </h1>
            <p v-if="featuredArtwork?.artist" class="text-secondary-300 text-lg sm:text-xl mb-2 font-medium">
              {{ featuredArtwork.artist.displayName }}<span v-if="featuredArtwork.year">, {{ featuredArtwork.year }}</span>
            </p>
            <p class="text-white/70 text-base sm:text-lg mb-8 max-w-lg">
              {{ featuredArtwork?.description || 'A powerful celebration of African heritage and ancestral wisdom' }}
            </p>
            <div class="flex flex-wrap gap-4">
              <NuxtLink
                :to="featuredArtwork ? `/artworks/${featuredArtwork.slug}` : '/artworks'"
                class="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-sunset text-white font-semibold rounded-full hover:opacity-90 shadow-warm-lg transition-all"
              >
                View Artwork
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </NuxtLink>
              <NuxtLink
                to="/artworks"
                class="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-full border border-white/30 hover:bg-white/20 transition-all"
              >
                Explore Gallery
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Introduction Section -->
    <section class="py-16 lg:py-20 bg-gradient-warm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto">
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-secondary-100 text-secondary-700 rounded-full text-sm font-medium mb-6">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
            </svg>
            Celebrating African Heritage
          </div>
          <h2 class="text-3xl lg:text-4xl font-display font-bold text-bark-900 mb-6">
            Discover the Rich Tapestry of African Artistry
          </h2>
          <p class="text-lg text-bark-600 leading-relaxed">
            From the intricate beadwork of the Maasai to the bold bronze sculptures of Benin, explore centuries of artistic tradition meeting contemporary vision. Each piece tells a story of heritage, creativity, and the enduring spirit of African craft.
          </p>
        </div>
      </div>
    </section>

    <!-- Featured Artworks -->
    <section v-if="featuredArtworks.length > 0" class="py-8 lg:py-12 bg-white">
      <UiHorizontalScroll title="Featured Artworks" subtitle="Handpicked masterpieces celebrating African heritage" view-all-link="/artworks">
        <UiArtworkCard
          v-for="artwork in featuredArtworks"
          :key="artwork.id"
          :artwork="{
            id: artwork.id,
            title: artwork.title,
            artist: artwork.artist?.displayName || 'Unknown Artist',
            imageUrl: getArtworkImage(artwork),
            year: artwork.year,
            slug: artwork.slug,
          }"
          size="medium"
        />
      </UiHorizontalScroll>
    </section>

    <!-- Collections -->
    <section class="py-8 lg:py-12 bg-earth-100">
      <UiHorizontalScroll title="Explore Collections" subtitle="Curated selections of African artistry" view-all-link="/collections">
        <UiCollectionCard
          v-for="collection in collections"
          :key="collection.id"
          :collection="collection"
          size="medium"
        />
      </UiHorizontalScroll>
    </section>

    <!-- Categories Grid -->
    <section class="py-12 lg:py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-2xl lg:text-4xl font-display font-bold text-bark-900">Browse by Craft</h2>
          <p class="text-bark-600 mt-3 text-lg">Discover art across traditional and contemporary mediums</p>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
          <NuxtLink
            v-for="category in categories"
            :key="category.slug"
            :to="`/artworks?category=${category.slug}`"
            class="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-earth-200 shadow-warm hover:shadow-warm-lg transition-all duration-300"
          >
            <img
              :src="category.imageUrl"
              :alt="category.name"
              class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-bark-900/80 via-bark-900/30 to-transparent"></div>
            <div class="absolute inset-0 flex flex-col items-center justify-end p-4 text-center">
              <span class="text-white font-display font-semibold text-lg">{{ category.name }}</span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Featured Artists -->
    <section v-if="artists.length > 0" class="py-12 lg:py-20 bg-gradient-to-br from-bark-900 via-earth-900 to-bark-950">
      <div class="max-w-[1400px] mx-auto">
        <div class="flex items-end justify-between mb-10 px-4 sm:px-6 lg:px-8">
          <div>
            <span class="inline-block px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-sm font-medium mb-3">Meet the Creators</span>
            <h2 class="text-2xl lg:text-4xl font-display font-bold text-white">Featured Artists</h2>
            <p class="text-earth-400 mt-2 text-lg">The talented hands behind these masterpieces</p>
          </div>
          <NuxtLink to="/artists" class="hidden sm:flex items-center gap-2 text-sm font-medium text-secondary-400 hover:text-secondary-300 transition-colors">
            View all artists
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </NuxtLink>
        </div>
        <div class="flex gap-6 overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8 pb-4">
          <UiArtistCard
            v-for="artist in artists"
            :key="artist.id"
            :artist="{
              id: artist.id,
              name: artist.displayName,
              imageUrl: artist.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
              artworksCount: artist.artworkCount,
              slug: artist.slug,
            }"
          />
        </div>
      </div>
    </section>

    <!-- Trending Now -->
    <section class="py-8 lg:py-12 bg-white">
      <UiHorizontalScroll title="Trending Now" subtitle="Popular pieces capturing hearts worldwide" view-all-link="/artworks?sort=trending">
        <UiArtworkCard
          v-for="artwork in trendingArtworks"
          :key="artwork.id"
          :artwork="artwork"
          size="medium"
        />
      </UiHorizontalScroll>
    </section>

    <!-- Stories & Articles -->
    <section class="py-8 lg:py-12 bg-earth-100">
      <UiHorizontalScroll title="Stories & Insights" subtitle="Explore the world of African art" view-all-link="/stories">
        <UiStoryCard
          v-for="story in stories"
          :key="story.id"
          :story="story"
        />
      </UiHorizontalScroll>
    </section>

    <!-- CTA Section -->
    <section class="py-16 lg:py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="relative rounded-3xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=1920&q=80"
            alt="Join our community"
            class="absolute inset-0 w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-r from-bark-900/95 via-bark-900/80 to-bark-900/60"></div>

          <!-- Decorative elements -->
          <div class="absolute top-0 right-0 w-1/2 h-full opacity-20">
            <svg class="w-full h-full" viewBox="0 0 400 400" fill="none">
              <circle cx="200" cy="200" r="150" stroke="#d99f13" stroke-width="2" stroke-dasharray="10 10"/>
              <circle cx="200" cy="200" r="100" stroke="#ec6c24" stroke-width="2"/>
              <circle cx="200" cy="200" r="50" stroke="#d99f13" stroke-width="2" stroke-dasharray="5 5"/>
            </svg>
          </div>

          <div class="relative py-16 lg:py-24 px-8 lg:px-16">
            <div class="max-w-xl">
              <span class="inline-block px-4 py-1.5 bg-secondary-500/20 text-secondary-300 rounded-full text-sm font-medium mb-6">
                Join Our Community
              </span>
              <h2 class="text-3xl lg:text-5xl font-display font-bold text-white mb-6 leading-tight">
                Begin Your African Art Journey
              </h2>
              <p class="text-earth-300 text-lg mb-8 leading-relaxed">
                Connect with talented African artists, discover unique handcrafted pieces, and become part of a community celebrating the richness of African heritage and creativity.
              </p>
              <div class="flex flex-col sm:flex-row gap-4">
                <NuxtLink
                  to="/auth/register"
                  class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-sunset text-white font-semibold rounded-full hover:opacity-90 shadow-warm-lg transition-all"
                >
                  Create Free Account
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                  </svg>
                </NuxtLink>
                <NuxtLink
                  to="/about"
                  class="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white font-semibold rounded-full border-2 border-earth-500/50 hover:border-earth-400 hover:bg-white/5 transition-all"
                >
                  Learn More
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Newsletter Section -->
    <section class="py-16 lg:py-20 bg-gradient-warm border-t border-earth-200">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-6">
          <svg class="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
        </div>
        <h2 class="text-2xl lg:text-3xl font-display font-bold text-bark-900 mb-4">
          Stay Connected to African Art
        </h2>
        <p class="text-bark-600 mb-8 text-lg max-w-2xl mx-auto">
          Get weekly updates on new artworks, featured artists, and exclusive insights into African craftsmanship.
        </p>
        <form class="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" @submit.prevent>
          <input
            type="email"
            placeholder="Enter your email"
            class="flex-1 px-5 py-3.5 bg-white border border-earth-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-bark-900 placeholder-bark-400"
          />
          <button
            type="submit"
            class="px-8 py-3.5 bg-gradient-sunset text-white font-semibold rounded-full hover:opacity-90 shadow-warm transition-all"
          >
            Subscribe
          </button>
        </form>
        <p class="text-bark-500 text-sm mt-4">
          Join our community. No spam, unsubscribe anytime.
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>