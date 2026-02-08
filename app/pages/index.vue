<script setup lang="ts">
// Sample data - will be replaced with API calls
const featuredArtwork = {
  id: '1',
  title: 'The Starry Night',
  artist: 'Vincent van Gogh',
  year: 1889,
  imageUrl: 'https://picsum.photos/seed/featured/1920/1080',
  description: 'One of the most recognized pieces in Western art history'
}

const featuredArtworks = [
  { id: '1', title: 'Sunset Over Mountains', artist: 'Elena Rodriguez', imageUrl: 'https://picsum.photos/seed/art1/800/1000', year: 2023 },
  { id: '2', title: 'Urban Reflections', artist: 'Marcus Chen', imageUrl: 'https://picsum.photos/seed/art2/800/1000', year: 2024 },
  { id: '3', title: 'Serenity in Blue', artist: 'Sofia Andersson', imageUrl: 'https://picsum.photos/seed/art3/800/1000', year: 2023 },
  { id: '4', title: 'Digital Dreams', artist: 'James Wright', imageUrl: 'https://picsum.photos/seed/art4/800/1000', year: 2024 },
  { id: '5', title: 'Garden at Dusk', artist: 'Elena Rodriguez', imageUrl: 'https://picsum.photos/seed/art5/800/1000', year: 2022 },
  { id: '6', title: 'Bronze Harmony', artist: 'David Okonkwo', imageUrl: 'https://picsum.photos/seed/art6/800/1000', year: 2023 },
  { id: '7', title: 'Neon Nights', artist: 'James Wright', imageUrl: 'https://picsum.photos/seed/art7/800/1000', year: 2024 },
  { id: '8', title: 'Ocean Whispers', artist: 'Sofia Andersson', imageUrl: 'https://picsum.photos/seed/art8/800/1000', year: 2023 },
]

const collections = [
  { id: '1', title: 'Modern Masterpieces', imageUrl: 'https://picsum.photos/seed/col1/800/600', itemCount: 42 },
  { id: '2', title: 'Abstract Expressions', imageUrl: 'https://picsum.photos/seed/col2/800/600', itemCount: 38 },
  { id: '3', title: 'Contemporary Sculptures', imageUrl: 'https://picsum.photos/seed/col3/800/600', itemCount: 24 },
  { id: '4', title: 'Digital Art Revolution', imageUrl: 'https://picsum.photos/seed/col4/800/600', itemCount: 56 },
  { id: '5', title: 'Nature Inspired', imageUrl: 'https://picsum.photos/seed/col5/800/600', itemCount: 31 },
]

const artists = [
  { id: '1', name: 'Elena Rodriguez', imageUrl: 'https://picsum.photos/seed/artist1/400/400', artworksCount: 24 },
  { id: '2', name: 'Marcus Chen', imageUrl: 'https://picsum.photos/seed/artist2/400/400', artworksCount: 18 },
  { id: '3', name: 'Sofia Andersson', imageUrl: 'https://picsum.photos/seed/artist3/400/400', artworksCount: 32 },
  { id: '4', name: 'James Wright', imageUrl: 'https://picsum.photos/seed/artist4/400/400', artworksCount: 15 },
  { id: '5', name: 'David Okonkwo', imageUrl: 'https://picsum.photos/seed/artist5/400/400', artworksCount: 21 },
  { id: '6', name: 'Amara Johnson', imageUrl: 'https://picsum.photos/seed/artist6/400/400', artworksCount: 27 },
  { id: '7', name: 'Liam Foster', imageUrl: 'https://picsum.photos/seed/artist7/400/400', artworksCount: 19 },
]

const categories = [
  { name: 'Paintings', slug: 'paintings', imageUrl: 'https://picsum.photos/seed/cat1/600/800', count: 1240 },
  { name: 'Sculptures', slug: 'sculptures', imageUrl: 'https://picsum.photos/seed/cat2/600/800', count: 342 },
  { name: 'Photography', slug: 'photography', imageUrl: 'https://picsum.photos/seed/cat3/600/800', count: 856 },
  { name: 'Digital Art', slug: 'digital', imageUrl: 'https://picsum.photos/seed/cat4/600/800', count: 623 },
  { name: 'Drawings', slug: 'drawings', imageUrl: 'https://picsum.photos/seed/cat5/600/800', count: 478 },
  { name: 'Mixed Media', slug: 'mixed-media', imageUrl: 'https://picsum.photos/seed/cat6/600/800', count: 291 },
]

const stories = [
  { id: '1', title: 'The Evolution of Digital Art in the 21st Century', imageUrl: 'https://picsum.photos/seed/story1/800/500', category: 'Art History', readTime: '5 min read' },
  { id: '2', title: 'How AI is Transforming the Art World', imageUrl: 'https://picsum.photos/seed/story2/800/500', category: 'Technology', readTime: '8 min read' },
  { id: '3', title: 'Interview: Rising Stars of Contemporary Art', imageUrl: 'https://picsum.photos/seed/story3/800/500', category: 'Interviews', readTime: '12 min read' },
  { id: '4', title: 'Behind the Scenes: Art Restoration Process', imageUrl: 'https://picsum.photos/seed/story4/800/500', category: 'Process', readTime: '6 min read' },
  { id: '5', title: 'The Influence of Nature on Modern Sculpture', imageUrl: 'https://picsum.photos/seed/story5/800/500', category: 'Analysis', readTime: '7 min read' },
]

const trendingArtworks = [
  { id: '9', title: 'Fragments of Time', artist: 'Marcus Chen', imageUrl: 'https://picsum.photos/seed/trend1/800/1000', year: 2024 },
  { id: '10', title: 'Portrait of Silence', artist: 'Amara Johnson', imageUrl: 'https://picsum.photos/seed/trend2/800/1000', year: 2023 },
  { id: '11', title: 'Geometric Flow', artist: 'David Okonkwo', imageUrl: 'https://picsum.photos/seed/trend3/800/1000', year: 2024 },
  { id: '12', title: 'Autumn Memories', artist: 'Amara Johnson', imageUrl: 'https://picsum.photos/seed/trend4/800/1000', year: 2022 },
  { id: '13', title: 'Electric Dreams', artist: 'Liam Foster', imageUrl: 'https://picsum.photos/seed/trend5/800/1000', year: 2024 },
  { id: '14', title: 'Whispers of Wind', artist: 'Sofia Andersson', imageUrl: 'https://picsum.photos/seed/trend6/800/1000', year: 2023 },
]
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="relative h-[70vh] sm:h-[80vh] overflow-hidden">
      <img
        :src="featuredArtwork.imageUrl"
        :alt="featuredArtwork.title"
        class="absolute inset-0 w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
      <div class="absolute inset-0 flex items-end">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 lg:pb-20 w-full">
          <div class="max-w-2xl">
            <span class="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm mb-4">
              Featured
            </span>
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
              {{ featuredArtwork.title }}
            </h1>
            <p class="text-white/80 text-lg mb-2">
              {{ featuredArtwork.artist }}, {{ featuredArtwork.year }}
            </p>
            <p class="text-white/60 mb-6">
              {{ featuredArtwork.description }}
            </p>
            <NuxtLink
              :to="`/artworks/${featuredArtwork.id}`"
              class="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-medium rounded-full hover:bg-gray-100 transition-colors"
            >
              Explore
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Artworks -->
    <UiHorizontalScroll title="Featured Artworks" subtitle="Handpicked masterpieces for you" view-all-link="/artworks">
      <UiArtworkCard
        v-for="artwork in featuredArtworks"
        :key="artwork.id"
        :artwork="artwork"
        size="medium"
      />
    </UiHorizontalScroll>

    <!-- Collections -->
    <section class="py-8 lg:py-12 bg-gray-50">
      <UiHorizontalScroll title="Explore Collections" view-all-link="/collections">
        <UiCollectionCard
          v-for="collection in collections"
          :key="collection.id"
          :collection="collection"
          size="medium"
        />
      </UiHorizontalScroll>
    </section>

    <!-- Categories Grid -->
    <section class="py-12 lg:py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-10">
          <h2 class="text-2xl lg:text-3xl font-bold text-gray-900">Browse by Category</h2>
          <p class="text-gray-600 mt-2">Discover art across different mediums</p>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <NuxtLink
            v-for="category in categories"
            :key="category.slug"
            :to="`/artworks?category=${category.slug}`"
            class="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100"
          >
            <img
              :src="category.imageUrl"
              :alt="category.name"
              class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            <div class="absolute inset-0 flex flex-col items-center justify-end p-4 text-center">
              <span class="text-white font-semibold text-lg">{{ category.name }}</span>
              <span class="text-white/60 text-sm">{{ category.count.toLocaleString() }}</span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Featured Artists -->
    <section class="py-8 lg:py-12 bg-gray-900">
      <div class="max-w-[1800px] mx-auto">
        <div class="flex items-end justify-between mb-8 px-4 sm:px-6 lg:px-8">
          <div>
            <h2 class="text-2xl lg:text-3xl font-bold text-white">Featured Artists</h2>
            <p class="text-gray-400 mt-1">Meet the creators behind the masterpieces</p>
          </div>
          <NuxtLink to="/artists" class="text-sm font-medium text-white hover:underline">
            View all
          </NuxtLink>
        </div>
        <div class="flex gap-6 overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8 pb-4">
          <UiArtistCard
            v-for="artist in artists"
            :key="artist.id"
            :artist="artist"
          />
        </div>
      </div>
    </section>

    <!-- Trending Now -->
    <UiHorizontalScroll title="Trending Now" subtitle="What everyone is looking at" view-all-link="/artworks?sort=trending">
      <UiArtworkCard
        v-for="artwork in trendingArtworks"
        :key="artwork.id"
        :artwork="artwork"
        size="medium"
      />
    </UiHorizontalScroll>

    <!-- Stories & Articles -->
    <section class="py-8 lg:py-12 bg-gray-50">
      <UiHorizontalScroll title="Stories & Insights" subtitle="Explore the world of art" view-all-link="/stories">
        <UiStoryCard
          v-for="story in stories"
          :key="story.id"
          :story="story"
        />
      </UiHorizontalScroll>
    </section>

    <!-- CTA Section -->
    <section class="py-16 lg:py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="relative rounded-3xl overflow-hidden">
          <img
            src="https://picsum.photos/seed/cta/1920/600"
            alt="Join our community"
            class="absolute inset-0 w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-gray-900/70"></div>
          <div class="relative py-16 lg:py-24 px-8 lg:px-16 text-center">
            <h2 class="text-3xl lg:text-4xl font-bold text-white mb-4">Start Your Art Journey</h2>
            <p class="text-gray-300 mb-8 max-w-xl mx-auto">
              Join thousands of art enthusiasts. Discover, collect, and connect with artists from around the world.
            </p>
            <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
              <NuxtLink
                to="/auth/register"
                class="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-colors"
              >
                Create Free Account
              </NuxtLink>
              <NuxtLink
                to="/about"
                class="w-full sm:w-auto px-8 py-4 bg-transparent text-white font-semibold rounded-full border-2 border-white/30 hover:border-white/60 transition-colors"
              >
                Learn More
              </NuxtLink>
            </div>
          </div>
        </div>
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
