<script setup lang="ts">
const currentYear = new Date().getFullYear()

const footerLinks = {
  explore: [
    { name: 'Artworks', href: '/artworks' },
    { name: 'Artists', href: '/artists' },
    { name: 'Exhibitions', href: '/exhibitions' },
    { name: 'Collections', href: '/collections' },
  ],
  crafts: [
    { name: 'Paintings', href: '/artworks?category=paintings' },
    { name: 'Sculptures', href: '/artworks?category=sculptures' },
    { name: 'Textiles', href: '/artworks?category=textiles' },
    { name: 'Beadwork', href: '/artworks?category=beadwork' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Our Story', href: '/story' },
    { name: 'Press', href: '/press' },
    { name: 'Contact', href: '/contact' },
  ],
  support: [
    { name: 'Help Center', href: '/help' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Cookie Policy', href: '/cookies' },
  ],
}

const socialLinks = [
  { name: 'Instagram', href: 'https://instagram.com', icon: 'instagram' },
  { name: 'Twitter', href: 'https://twitter.com', icon: 'twitter' },
  { name: 'Facebook', href: 'https://facebook.com', icon: 'facebook' },
  { name: 'YouTube', href: 'https://youtube.com', icon: 'youtube' },
]
</script>

<template>
  <footer class="bg-gradient-to-b from-bark-900 to-bark-950 text-earth-300">
    <!-- Decorative top border -->
    <div class="h-1 bg-gradient-sunset"></div>

    <!-- Main Footer -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
        <!-- Brand -->
        <div class="lg:col-span-2">
          <NuxtLink to="/" class="flex items-center gap-3 mb-5">
            <div class="w-12 h-12 bg-gradient-sunset rounded-xl flex items-center justify-center shadow-warm">
              <svg class="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <span class="text-xl font-display font-bold text-white">Afrika</span>
              <span class="text-xl font-display text-primary-400">Crafts</span>
              <span class="block text-xs text-earth-500 -mt-0.5">Gallery</span>
            </div>
          </NuxtLink>
          <p class="text-earth-400 text-sm leading-relaxed max-w-sm mb-6">
            Celebrating the rich heritage and contemporary vision of African artistry. Discover unique handcrafted pieces from talented artists across the continent.
          </p>
          <!-- Social Links -->
          <div class="flex items-center gap-3">
            <a
              v-for="social in socialLinks"
              :key="social.name"
              :href="social.href"
              target="_blank"
              rel="noopener noreferrer"
              class="w-10 h-10 bg-earth-800/50 rounded-xl flex items-center justify-center text-earth-400 hover:bg-primary-500/20 hover:text-primary-400 transition-all duration-300"
              :aria-label="social.name"
            >
              <!-- Instagram -->
              <svg v-if="social.icon === 'instagram'" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <!-- Twitter -->
              <svg v-if="social.icon === 'twitter'" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <!-- Facebook -->
              <svg v-if="social.icon === 'facebook'" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <!-- YouTube -->
              <svg v-if="social.icon === 'youtube'" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
        </div>

        <!-- Explore Links -->
        <div>
          <h3 class="text-white font-display font-semibold mb-4 text-lg">Explore</h3>
          <ul class="space-y-3">
            <li v-for="link in footerLinks.explore" :key="link.name">
              <NuxtLink
                :to="link.href"
                class="text-sm text-earth-400 hover:text-primary-400 transition-colors inline-flex items-center gap-1 group"
              >
                {{ link.name }}
                <svg class="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Crafts Links -->
        <div>
          <h3 class="text-white font-display font-semibold mb-4 text-lg">Crafts</h3>
          <ul class="space-y-3">
            <li v-for="link in footerLinks.crafts" :key="link.name">
              <NuxtLink
                :to="link.href"
                class="text-sm text-earth-400 hover:text-primary-400 transition-colors inline-flex items-center gap-1 group"
              >
                {{ link.name }}
                <svg class="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Company Links -->
        <div>
          <h3 class="text-white font-display font-semibold mb-4 text-lg">Company</h3>
          <ul class="space-y-3">
            <li v-for="link in footerLinks.company" :key="link.name">
              <NuxtLink
                :to="link.href"
                class="text-sm text-earth-400 hover:text-primary-400 transition-colors inline-flex items-center gap-1 group"
              >
                {{ link.name }}
                <svg class="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Support Links -->
        <div>
          <h3 class="text-white font-display font-semibold mb-4 text-lg">Support</h3>
          <ul class="space-y-3">
            <li v-for="link in footerLinks.support" :key="link.name">
              <NuxtLink
                :to="link.href"
                class="text-sm text-earth-400 hover:text-primary-400 transition-colors inline-flex items-center gap-1 group"
              >
                {{ link.name }}
                <svg class="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- Decorative African Pattern Divider -->
      <div class="my-10 flex items-center gap-4">
        <div class="flex-1 h-px bg-gradient-to-r from-transparent via-earth-700 to-transparent"></div>
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 bg-primary-500 rounded-full"></span>
          <span class="w-3 h-3 bg-secondary-500 rotate-45"></span>
          <span class="w-2 h-2 bg-primary-500 rounded-full"></span>
        </div>
        <div class="flex-1 h-px bg-gradient-to-r from-transparent via-earth-700 to-transparent"></div>
      </div>

      <!-- Trust Badges -->
      <div class="flex flex-wrap items-center justify-center gap-8 mb-10">
        <div class="flex items-center gap-2 text-earth-500">
          <svg class="w-5 h-5 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg>
          <span class="text-sm">Secure Payments</span>
        </div>
        <div class="flex items-center gap-2 text-earth-500">
          <svg class="w-5 h-5 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span class="text-sm">Worldwide Shipping</span>
        </div>
        <div class="flex items-center gap-2 text-earth-500">
          <svg class="w-5 h-5 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span class="text-sm">24/7 Support</span>
        </div>
        <div class="flex items-center gap-2 text-earth-500">
          <svg class="w-5 h-5 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
          </svg>
          <span class="text-sm">Authenticity Guaranteed</span>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="border-t border-earth-800/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p class="text-sm text-earth-500">
            &copy; {{ currentYear }} AfrikaCrafts Gallery. Celebrating African artistry.
          </p>
          <div class="flex items-center gap-6">
            <NuxtLink to="/terms" class="text-sm text-earth-500 hover:text-primary-400 transition-colors">
              Terms
            </NuxtLink>
            <NuxtLink to="/privacy" class="text-sm text-earth-500 hover:text-primary-400 transition-colors">
              Privacy
            </NuxtLink>
            <NuxtLink to="/cookies" class="text-sm text-earth-500 hover:text-primary-400 transition-colors">
              Cookies
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>