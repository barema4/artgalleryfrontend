export interface Artwork {
  id: string
  title: string
  artist: string
  description: string
  imageUrl: string
  price: number
  category: string
  year: number
  sold: boolean
}

const sampleArtworks: Artwork[] = [
  {
    id: '1',
    title: 'Sunset Over Mountains',
    artist: 'Elena Rodriguez',
    description: 'A vibrant oil painting capturing the golden hour over mountain peaks.',
    imageUrl: 'https://picsum.photos/seed/art1/800/600',
    price: 2500,
    category: 'Painting',
    year: 2023,
    sold: false,
  },
  {
    id: '2',
    title: 'Urban Reflections',
    artist: 'Marcus Chen',
    description: 'Abstract cityscape reflecting modern urban life.',
    imageUrl: 'https://picsum.photos/seed/art2/800/600',
    price: 3200,
    category: 'Painting',
    year: 2024,
    sold: false,
  },
  {
    id: '3',
    title: 'Serenity in Blue',
    artist: 'Sofia Andersson',
    description: 'Minimalist sculpture exploring tranquility through form.',
    imageUrl: 'https://picsum.photos/seed/art3/800/600',
    price: 4800,
    category: 'Sculpture',
    year: 2023,
    sold: true,
  },
  {
    id: '4',
    title: 'Digital Dreams',
    artist: 'James Wright',
    description: 'A striking digital artwork blending reality and imagination.',
    imageUrl: 'https://picsum.photos/seed/art4/800/600',
    price: 1800,
    category: 'Digital',
    year: 2024,
    sold: false,
  },
  {
    id: '5',
    title: 'Garden at Dusk',
    artist: 'Elena Rodriguez',
    description: 'Impressionist view of a peaceful garden in evening light.',
    imageUrl: 'https://picsum.photos/seed/art5/800/600',
    price: 2800,
    category: 'Painting',
    year: 2022,
    sold: false,
  },
  {
    id: '6',
    title: 'Bronze Harmony',
    artist: 'David Okonkwo',
    description: 'Contemporary bronze sculpture representing balance.',
    imageUrl: 'https://picsum.photos/seed/art6/800/600',
    price: 6500,
    category: 'Sculpture',
    year: 2023,
    sold: false,
  },
  {
    id: '7',
    title: 'Neon Nights',
    artist: 'James Wright',
    description: 'Vibrant digital composition inspired by city nightlife.',
    imageUrl: 'https://picsum.photos/seed/art7/800/600',
    price: 1500,
    category: 'Digital',
    year: 2024,
    sold: true,
  },
  {
    id: '8',
    title: 'Ocean Whispers',
    artist: 'Sofia Andersson',
    description: 'Watercolor seascape evoking calm and wonder.',
    imageUrl: 'https://picsum.photos/seed/art8/800/600',
    price: 2200,
    category: 'Painting',
    year: 2023,
    sold: false,
  },
  {
    id: '9',
    title: 'Fragments of Time',
    artist: 'Marcus Chen',
    description: 'Mixed media piece exploring memory and impermanence.',
    imageUrl: 'https://picsum.photos/seed/art9/800/600',
    price: 3800,
    category: 'Mixed Media',
    year: 2024,
    sold: false,
  },
  {
    id: '10',
    title: 'Portrait of Silence',
    artist: 'Amara Johnson',
    description: 'Charcoal portrait capturing introspective emotion.',
    imageUrl: 'https://picsum.photos/seed/art10/800/600',
    price: 1900,
    category: 'Drawing',
    year: 2023,
    sold: false,
  },
  {
    id: '11',
    title: 'Geometric Flow',
    artist: 'David Okonkwo',
    description: 'Steel sculpture with flowing geometric patterns.',
    imageUrl: 'https://picsum.photos/seed/art11/800/600',
    price: 7200,
    category: 'Sculpture',
    year: 2024,
    sold: false,
  },
  {
    id: '12',
    title: 'Autumn Memories',
    artist: 'Amara Johnson',
    description: 'Warm-toned landscape celebrating the fall season.',
    imageUrl: 'https://picsum.photos/seed/art12/800/600',
    price: 2100,
    category: 'Painting',
    year: 2022,
    sold: true,
  },
]

export const useArtworksStore = defineStore('artworks', {
  state: () => ({
    artworks: [] as Artwork[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    availableArtworks: (state) => state.artworks.filter((a) => !a.sold),
    soldArtworks: (state) => state.artworks.filter((a) => a.sold),
    getById: (state) => (id: string) => state.artworks.find((a) => a.id === id),
    byCategory: (state) => (category: string) =>
      state.artworks.filter((a) => a.category === category),
    byArtist: (state) => (artist: string) =>
      state.artworks.filter((a) => a.artist === artist),
  },

  actions: {
    async fetchArtworks() {
      this.loading = true
      this.error = null
      try {
        // TODO: Replace with your API endpoint
        // const data = await $fetch<Artwork[]>('/api/artworks')
        // this.artworks = data

        // Using sample data for testing
        await new Promise((resolve) => setTimeout(resolve, 500))
        this.artworks = sampleArtworks
      } catch (e) {
        this.error = 'Failed to fetch artworks'
      } finally {
        this.loading = false
      }
    },

    addArtwork(artwork: Artwork) {
      this.artworks.push(artwork)
    },

    removeArtwork(id: string) {
      const index = this.artworks.findIndex((a) => a.id === id)
      if (index > -1) {
        this.artworks.splice(index, 1)
      }
    },

    updateArtwork(id: string, updates: Partial<Artwork>) {
      const artwork = this.artworks.find((a) => a.id === id)
      if (artwork) {
        Object.assign(artwork, updates)
      }
    },

    markAsSold(id: string) {
      const artwork = this.artworks.find((a) => a.id === id)
      if (artwork) {
        artwork.sold = true
      }
    },
  },
})
