<script setup lang="ts">
import type { Product, ProductType, ProductListParams } from '~/types/product'
import { PRODUCT_TYPE_LABELS } from '~/types/product'
import { useProductService } from '~/services/product.service'

definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'dashboard',
})

const productService = useProductService()

const products = ref<Product[]>([])
const loading = ref(false)
const error = ref('')

const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
})

const filters = ref<ProductListParams>({
  search: '',
  type: undefined,
  active: undefined,
  inStock: undefined,
  sortBy: 'newest',
})

const productTypes: { value: ProductType | undefined; label: string }[] = [
  { value: undefined, label: 'All Types' },
  { value: 'ORIGINAL', label: 'Original' },
  { value: 'PRINT', label: 'Print' },
  { value: 'MERCHANDISE', label: 'Merchandise' },
  { value: 'DIGITAL', label: 'Digital' },
]

const activeOptions = [
  { value: undefined, label: 'All Status' },
  { value: true, label: 'Active' },
  { value: false, label: 'Inactive' },
]

async function fetchProducts() {
  loading.value = true
  error.value = ''

  try {
    const response = await productService.getProducts({
      page: pagination.value.page,
      limit: pagination.value.limit,
      ...filters.value,
    })
    products.value = response.data
    pagination.value = {
      page: response.page,
      limit: response.limit,
      total: response.total,
      totalPages: response.totalPages,
    }
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to load products'
  } finally {
    loading.value = false
  }
}

function handleFilterChange() {
  pagination.value.page = 1
  fetchProducts()
}

function goToPage(page: number) {
  pagination.value.page = page
  fetchProducts()
}

function formatPrice(price: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(price)
}

function getStockBadgeClass(stock: number, lowThreshold: number) {
  if (stock === 0) return 'bg-red-100 text-red-800'
  if (stock <= lowThreshold) return 'bg-yellow-100 text-yellow-800'
  return 'bg-green-100 text-green-800'
}

function getStockLabel(stock: number, lowThreshold: number) {
  if (stock === 0) return 'Out of Stock'
  if (stock <= lowThreshold) return `Low Stock (${stock})`
  return `In Stock (${stock})`
}

function getPrimaryImage(product: Product) {
  const primary = product.images?.find(img => img.isPrimary)
  return primary?.url || product.images?.[0]?.url
}

onMounted(() => {
  fetchProducts()
})

useHead({
  title: 'Manage Products | Admin',
})
</script>

<template>
  <div class="p-6">
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Products</h1>
          <p class="text-gray-600 mt-1">Manage your shop products and inventory</p>
        </div>
        <NuxtLink
          to="/admin/products/new"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium inline-flex items-center gap-1"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Product
        </NuxtLink>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search products..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              @input="handleFilterChange"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              v-model="filters.type"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              @change="handleFilterChange"
            >
              <option v-for="opt in productTypes" :key="String(opt.value)" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              v-model="filters.active"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              @change="handleFilterChange"
            >
              <option v-for="opt in activeOptions" :key="String(opt.value)" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              v-model="filters.sortBy"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              @change="handleFilterChange"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
      <p class="text-red-800">{{ error }}</p>
    </div>

    <!-- Table -->
    <div v-else-if="products.length > 0" class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="product in products" :key="product.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <img
                      v-if="getPrimaryImage(product)"
                      :src="getPrimaryImage(product)"
                      :alt="product.name"
                      class="h-10 w-10 rounded-lg object-cover"
                    />
                    <div v-else class="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                      <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
                    <div class="text-sm text-gray-500">{{ product.slug }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                  {{ PRODUCT_TYPE_LABELS[product.type] }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ product.sku }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ formatPrice(product.price, product.currency) }}</div>
                <div v-if="product.compareAtPrice" class="text-sm text-gray-400 line-through">
                  {{ formatPrice(product.compareAtPrice, product.currency) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="getStockBadgeClass(product.stock, product.lowStockThreshold)"
                >
                  {{ getStockLabel(product.stock, product.lowStockThreshold) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="product.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'"
                >
                  {{ product.active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <NuxtLink
                  :to="`/products/${product.slug}`"
                  class="text-primary-600 hover:text-primary-700 mr-3"
                >
                  View
                </NuxtLink>
                <NuxtLink
                  :to="`/admin/products/${product.id}`"
                  class="text-gray-600 hover:text-gray-900"
                >
                  Edit
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div class="text-sm text-gray-700">
          Showing {{ (pagination.page - 1) * pagination.limit + 1 }}
          to {{ Math.min(pagination.page * pagination.limit, pagination.total) }}
          of {{ pagination.total }} results
        </div>
        <div class="flex gap-2">
          <button
            :disabled="pagination.page === 1"
            class="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            @click="goToPage(pagination.page - 1)"
          >
            Previous
          </button>
          <button
            :disabled="pagination.page === pagination.totalPages"
            class="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            @click="goToPage(pagination.page + 1)"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white rounded-lg border border-gray-200 p-12 text-center">
      <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
      <p class="text-gray-600 mb-4">Get started by creating your first product</p>
      <NuxtLink
        to="/admin/products/new"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        Create Product
      </NuxtLink>
    </div>
  </div>
</template>
