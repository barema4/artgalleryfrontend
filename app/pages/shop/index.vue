<script setup lang="ts">
import type { ProductType } from '~/types/product'
import { PRODUCT_TYPE_LABELS } from '~/types/product'
import { useProductsStore } from '~/stores/products'
import { useCartStore } from '~/stores/cart'

const productsStore = useProductsStore()
const cartStore = useCartStore()

const showMobileFilters = ref(false)
const priceRange = reactive({
  min: null as number | null,
  max: null as number | null,
})

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name A-Z' },
]

const productTypeOptions = Object.entries(PRODUCT_TYPE_LABELS).map(([value, label]) => ({
  value: value as ProductType,
  label,
}))

async function handleSearch() {
  productsStore.setFilters({
    minPrice: priceRange.min,
    maxPrice: priceRange.max,
  })
  await productsStore.fetchProducts({ page: 1 })
}

async function handleFilterChange() {
  await productsStore.fetchProducts({ page: 1 })
}

async function handleSortChange(sortBy: typeof productsStore.filters.sortBy) {
  productsStore.setFilters({ sortBy })
  await productsStore.fetchProducts()
}

async function handleTypeChange(type: ProductType | null) {
  productsStore.setFilters({ type })
  await productsStore.fetchProducts()
}

async function handlePageChange(page: number) {
  await productsStore.fetchProducts({ page })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function handleLoadMore() {
  await productsStore.loadMore()
}

function clearFilters() {
  productsStore.clearFilters()
  priceRange.min = null
  priceRange.max = null
  productsStore.fetchProducts()
}

function toggleMobileFilters() {
  showMobileFilters.value = !showMobileFilters.value
}

function handleAddToCart(product: typeof productsStore.products[0]) {
  cartStore.addItem(product)
  cartStore.openCart()
}

onMounted(() => {
  productsStore.fetchProducts()
})
</script>

<template>
  <div class="min-h-screen bg-mudcloth-cream py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-display font-bold text-bark-800">Shop</h1>
        <p class="text-bark-500 mt-2">Purchase original artworks, prints, and merchandise</p>
      </div>

      <!-- Mobile Filter Toggle -->
      <button
        class="lg:hidden w-full mb-4 px-4 py-3 bg-white border border-earth-200 rounded-xl flex items-center justify-between text-bark-700"
        @click="toggleMobileFilters"
      >
        <span class="flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
        </span>
        <svg
          class="w-5 h-5 transition-transform"
          :class="{ 'rotate-180': showMobileFilters }"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Sidebar Filters -->
        <aside
          class="lg:w-72 flex-shrink-0 space-y-6"
          :class="{ 'hidden lg:block': !showMobileFilters }"
        >
          <!-- Product Type Filter -->
          <div class="bg-white border border-earth-100 rounded-2xl p-5">
            <h3 class="font-semibold text-bark-800 mb-4">Product Type</h3>
            <div class="space-y-2">
              <button
                class="w-full text-left px-3 py-2 rounded-xl transition-colors"
                :class="[
                  !productsStore.filters.type
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'text-bark-600 hover:bg-earth-50'
                ]"
                @click="handleTypeChange(null)"
              >
                All Products
              </button>
              <button
                v-for="option in productTypeOptions"
                :key="option.value"
                class="w-full text-left px-3 py-2 rounded-xl transition-colors"
                :class="[
                  productsStore.filters.type === option.value
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'text-bark-600 hover:bg-earth-50'
                ]"
                @click="handleTypeChange(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <!-- Price Range -->
          <div class="bg-white border border-earth-100 rounded-2xl p-5">
            <h3 class="font-semibold text-bark-800 mb-4">Price Range</h3>
            <div class="flex items-center gap-3">
              <div class="flex-1">
                <label class="block text-xs text-bark-500 mb-1">Min</label>
                <input
                  v-model.number="priceRange.min"
                  type="number"
                  placeholder="$0"
                  class="w-full px-3 py-2 border border-earth-200 rounded-xl text-sm bg-white text-bark-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <span class="text-bark-400 mt-5">-</span>
              <div class="flex-1">
                <label class="block text-xs text-bark-500 mb-1">Max</label>
                <input
                  v-model.number="priceRange.max"
                  type="number"
                  placeholder="Any"
                  class="w-full px-3 py-2 border border-earth-200 rounded-xl text-sm bg-white text-bark-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            </div>
            <button
              class="w-full mt-3 px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-xl hover:bg-primary-600 transition-colors"
              @click="handleSearch"
            >
              Apply Price Filter
            </button>
          </div>

          <!-- Stock Filter -->
          <div class="bg-white border border-earth-100 rounded-2xl p-5">
            <h3 class="font-semibold text-bark-800 mb-4">Availability</h3>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                :checked="productsStore.filters.inStock === true"
                class="w-4 h-4 text-primary-500 border-earth-300 rounded focus:ring-primary-500/20"
                @change="productsStore.setFilters({ inStock: ($event.target as HTMLInputElement).checked || null }); handleFilterChange()"
              />
              <span class="text-bark-700">In Stock Only</span>
            </label>
          </div>

          <!-- Clear Filters -->
          <button
            class="w-full px-4 py-2 text-bark-500 hover:text-bark-700 transition-colors text-sm"
            @click="clearFilters"
          >
            Clear All Filters
          </button>
        </aside>

        <!-- Main Content -->
        <div class="flex-1 min-w-0">
          <!-- Sort & Results Count -->
          <div class="bg-white border border-earth-100 rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
            <p class="text-bark-600">
              <span class="font-semibold text-bark-800">{{ productsStore.pagination.total }}</span>
              {{ productsStore.pagination.total === 1 ? 'product' : 'products' }} found
            </p>

            <div class="flex items-center gap-3">
              <!-- Search -->
              <div class="relative">
                <input
                  v-model="productsStore.filters.search"
                  type="text"
                  placeholder="Search products..."
                  class="pl-9 pr-4 py-2 border border-earth-200 rounded-xl text-sm bg-white text-bark-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 w-48"
                  @keyup.enter="handleFilterChange"
                />
                <svg
                  class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bark-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <!-- Sort -->
              <select
                :value="productsStore.filters.sortBy"
                class="px-4 py-2 border border-earth-200 rounded-xl text-sm bg-white text-bark-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                @change="handleSortChange(($event.target as HTMLSelectElement).value as any)"
              >
                <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Active Filters -->
          <div
            v-if="productsStore.filters.type || productsStore.filters.search || productsStore.filters.minPrice || productsStore.filters.maxPrice || productsStore.filters.inStock"
            class="flex flex-wrap items-center gap-2 mb-6"
          >
            <span class="text-sm text-bark-500">Active filters:</span>
            <span
              v-if="productsStore.filters.type"
              class="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
            >
              {{ PRODUCT_TYPE_LABELS[productsStore.filters.type] }}
              <button class="hover:text-primary-900" @click="handleTypeChange(null)">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
            <span
              v-if="productsStore.filters.search"
              class="inline-flex items-center gap-1 px-3 py-1 bg-earth-100 text-bark-700 rounded-full text-sm"
            >
              "{{ productsStore.filters.search }}"
              <button class="hover:text-bark-900" @click="productsStore.setFilters({ search: '' }); handleFilterChange()">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
            <span
              v-if="productsStore.filters.inStock"
              class="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
            >
              In Stock
              <button class="hover:text-green-900" @click="productsStore.setFilters({ inStock: null }); handleFilterChange()">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          </div>

          <!-- Error -->
          <UiAlert v-if="productsStore.error" type="error" class="mb-6" dismissible @dismiss="productsStore.clearError()">
            {{ productsStore.error }}
          </UiAlert>

          <!-- Loading -->
          <div v-if="productsStore.loading && productsStore.products.length === 0" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            <div v-for="i in 6" :key="i" class="bg-white border border-earth-100 rounded-2xl overflow-hidden">
              <div class="aspect-square bg-earth-100 animate-pulse" />
              <div class="p-4 space-y-3">
                <div class="h-4 bg-earth-100 rounded animate-pulse w-1/4" />
                <div class="h-5 bg-earth-100 rounded animate-pulse w-3/4" />
                <div class="h-4 bg-earth-100 rounded animate-pulse w-1/2" />
                <div class="h-6 bg-earth-100 rounded animate-pulse w-1/3" />
              </div>
            </div>
          </div>

          <!-- Products Grid -->
          <div v-else-if="productsStore.products.length > 0" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            <UiProductCard
              v-for="product in productsStore.products"
              :key="product.id"
              :product="product"
              show-artist
              @add-to-cart="handleAddToCart"
            />
          </div>

          <!-- Empty State -->
          <div v-else class="bg-white rounded-2xl border border-earth-100 py-16 text-center">
            <svg class="w-16 h-16 text-earth-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 class="text-lg font-medium text-bark-700">No products found</h3>
            <p class="text-bark-500 mt-1">Try adjusting your search or filters</p>
          </div>

          <!-- Load More / Pagination -->
          <div v-if="productsStore.hasMorePages" class="mt-8 text-center">
            <button
              class="px-8 py-3 border border-earth-200 text-bark-700 font-medium rounded-xl hover:bg-earth-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50 transition-all"
              :disabled="productsStore.loading"
              @click="handleLoadMore"
            >
              <span v-if="productsStore.loading" class="inline-flex items-center gap-2">
                <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading...
              </span>
              <span v-else>Load More Products</span>
            </button>
          </div>

          <!-- Page Info -->
          <p v-if="productsStore.pagination.total > 0" class="text-center text-sm text-bark-500 mt-4">
            Showing {{ productsStore.products.length }} of {{ productsStore.pagination.total }} products
          </p>
        </div>
      </div>
    </div>

    <!-- Cart Drawer -->
    <UiCartDrawer />
  </div>
</template>
