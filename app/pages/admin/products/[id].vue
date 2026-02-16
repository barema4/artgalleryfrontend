<script setup lang="ts">
import type { Product, ProductType, ProductVariant, ProductImage, CreateProductData, UpdateProductData } from '~/types/product'
import { PRODUCT_TYPE_LABELS } from '~/types/product'
import { useProductService } from '~/services/product.service'

definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'dashboard',
})

const route = useRoute()
const router = useRouter()
const productService = useProductService()

const isNew = computed(() => route.params.id === 'new')
const productId = computed(() => route.params.id as string)

interface ProductFormData {
  name: string
  slug: string
  type: ProductType
  description: string
  sku: string
  price: number
  compareAtPrice: number | null
  currency: string
  stock: number
  lowStockThreshold: number
  isLimitedEdition: boolean
  editionSize: number | null
  weight: number | null
  isDigital: boolean
  digitalFileUrl: string
  active: boolean
}

const form = ref<ProductFormData>({
  name: '',
  slug: '',
  type: 'PRINT',
  description: '',
  sku: '',
  price: 0,
  compareAtPrice: null,
  currency: 'USD',
  stock: 0,
  lowStockThreshold: 5,
  isLimitedEdition: false,
  editionSize: null,
  weight: null,
  isDigital: false,
  digitalFileUrl: '',
  active: true,
})

const variants = ref<ProductVariant[]>([])
const images = ref<ProductImage[]>([])

const loading = ref(false)
const error = ref('')
const success = ref(false)

// Variant modal
const showVariantModal = ref(false)
const editingVariant = ref<ProductVariant | null>(null)
const variantForm = ref({
  name: '',
  sku: '',
  price: 0,
  stock: 0,
})

// Image modal
const showImageModal = ref(false)
const imageForm = ref({
  url: '',
  altText: '',
  isPrimary: false,
})

// Delete confirmation
const showDeleteModal = ref(false)
const isDeleting = ref(false)

const productTypes: { value: ProductType; label: string }[] = [
  { value: 'ORIGINAL', label: 'Original Artwork' },
  { value: 'PRINT', label: 'Print' },
  { value: 'MERCHANDISE', label: 'Merchandise' },
  { value: 'DIGITAL', label: 'Digital Download' },
]

async function loadProduct() {
  if (isNew.value) return

  loading.value = true
  error.value = ''

  try {
    const product = await productService.getProductById(productId.value)

    form.value = {
      name: product.name,
      slug: product.slug,
      type: product.type,
      description: product.description || '',
      sku: product.sku,
      price: product.price,
      compareAtPrice: product.compareAtPrice || null,
      currency: product.currency,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold,
      isLimitedEdition: product.isLimitedEdition,
      editionSize: product.editionSize || null,
      weight: product.weight || null,
      isDigital: product.isDigital,
      digitalFileUrl: product.digitalFileUrl || '',
      active: product.active,
    }
    variants.value = product.variants || []
    images.value = product.images || []
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to load product'
  } finally {
    loading.value = false
  }
}

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function handleNameChange() {
  if (isNew.value && form.value.name) {
    form.value.slug = generateSlug(form.value.name)
  }
}

async function handleSubmit() {
  loading.value = true
  error.value = ''
  success.value = false

  try {
    if (isNew.value) {
      const createData: CreateProductData = {
        name: form.value.name,
        slug: form.value.slug,
        type: form.value.type,
        description: form.value.description || undefined,
        sku: form.value.sku,
        price: form.value.price,
        compareAtPrice: form.value.compareAtPrice || undefined,
        currency: form.value.currency,
        stock: form.value.stock,
        lowStockThreshold: form.value.lowStockThreshold,
        isLimitedEdition: form.value.isLimitedEdition,
        editionSize: form.value.editionSize || undefined,
        weight: form.value.weight || undefined,
        isDigital: form.value.isDigital,
        digitalFileUrl: form.value.digitalFileUrl || undefined,
        active: form.value.active,
      }
      await productService.createProduct(createData)
      success.value = true
      setTimeout(() => {
        router.push('/admin/products')
      }, 1500)
    } else {
      const updateData: UpdateProductData = {
        name: form.value.name,
        type: form.value.type,
        description: form.value.description || undefined,
        sku: form.value.sku,
        price: form.value.price,
        compareAtPrice: form.value.compareAtPrice,
        currency: form.value.currency,
        stock: form.value.stock,
        lowStockThreshold: form.value.lowStockThreshold,
        isLimitedEdition: form.value.isLimitedEdition,
        editionSize: form.value.editionSize,
        weight: form.value.weight,
        isDigital: form.value.isDigital,
        digitalFileUrl: form.value.digitalFileUrl || null,
        active: form.value.active,
      }
      await productService.updateProduct(productId.value, updateData)
      success.value = true
      setTimeout(() => {
        router.push('/admin/products')
      }, 1500)
    }
  } catch (e: any) {
    error.value = e?.data?.message || `Failed to ${isNew.value ? 'create' : 'update'} product`
  } finally {
    loading.value = false
  }
}

// Variant management
function openVariantModal(variant?: ProductVariant) {
  if (variant) {
    editingVariant.value = variant
    variantForm.value = {
      name: variant.name,
      sku: variant.sku,
      price: variant.price,
      stock: variant.stock,
    }
  } else {
    editingVariant.value = null
    variantForm.value = {
      name: '',
      sku: '',
      price: 0,
      stock: 0,
    }
  }
  showVariantModal.value = true
}

async function saveVariant() {
  if (isNew.value) {
    error.value = 'Please save the product first before adding variants'
    showVariantModal.value = false
    return
  }

  loading.value = true
  try {
    if (editingVariant.value) {
      const updated = await productService.updateVariant(productId.value, editingVariant.value.id, variantForm.value)
      const index = variants.value.findIndex(v => v.id === editingVariant.value!.id)
      if (index !== -1) variants.value[index] = updated
    } else {
      const created = await productService.createVariant(productId.value, variantForm.value)
      variants.value.push(created)
    }
    showVariantModal.value = false
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to save variant'
  } finally {
    loading.value = false
  }
}

async function deleteVariant(variantId: string) {
  if (!confirm('Are you sure you want to delete this variant?')) return

  loading.value = true
  try {
    await productService.deleteVariant(productId.value, variantId)
    variants.value = variants.value.filter(v => v.id !== variantId)
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to delete variant'
  } finally {
    loading.value = false
  }
}

// Image management
function openImageModal() {
  imageForm.value = {
    url: '',
    altText: '',
    isPrimary: images.value.length === 0,
  }
  showImageModal.value = true
}

async function addImage() {
  if (isNew.value) {
    error.value = 'Please save the product first before adding images'
    showImageModal.value = false
    return
  }

  loading.value = true
  try {
    const created = await productService.addImage(productId.value, {
      url: imageForm.value.url,
      altText: imageForm.value.altText || undefined,
      isPrimary: imageForm.value.isPrimary,
    })
    images.value.push(created)
    showImageModal.value = false
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to add image'
  } finally {
    loading.value = false
  }
}

async function removeImage(imageId: string) {
  if (!confirm('Are you sure you want to remove this image?')) return

  loading.value = true
  try {
    await productService.removeImage(productId.value, imageId)
    images.value = images.value.filter(i => i.id !== imageId)
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to remove image'
  } finally {
    loading.value = false
  }
}

async function setPrimaryImage(imageId: string) {
  loading.value = true
  try {
    await productService.setPrimaryImage(productId.value, imageId)
    images.value = images.value.map(i => ({
      ...i,
      isPrimary: i.id === imageId,
    }))
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to set primary image'
  } finally {
    loading.value = false
  }
}

// Delete product
async function deleteProduct() {
  isDeleting.value = true
  try {
    await productService.deleteProduct(productId.value)
    router.push('/admin/products')
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to delete product'
    showDeleteModal.value = false
  } finally {
    isDeleting.value = false
  }
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: form.value.currency || 'USD',
    minimumFractionDigits: 0,
  }).format(price)
}

onMounted(() => {
  if (!isNew.value) {
    loadProduct()
  }
})

useHead({
  title: isNew.value ? 'Create Product | Admin' : 'Edit Product | Admin',
})
</script>

<template>
  <div class="max-w-4xl mx-auto p-6">
    <!-- Header -->
    <div class="mb-6">
      <NuxtLink
        to="/admin/products"
        class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Products
      </NuxtLink>
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">
          {{ isNew ? 'Create New Product' : 'Edit Product' }}
        </h1>
        <button
          v-if="!isNew"
          class="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          @click="showDeleteModal = true"
        >
          Delete Product
        </button>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="success" class="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
      <p class="text-green-800">
        Product {{ isNew ? 'created' : 'updated' }} successfully! Redirecting...
      </p>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{{ error }}</p>
    </div>

    <!-- Loading -->
    <div v-if="loading && !form.name" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>

    <!-- Form -->
    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Basic Info -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Product Name <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="Enter product name"
              @input="handleNameChange"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Slug <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.slug"
              type="text"
              required
              :disabled="!isNew"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-100"
              placeholder="product-slug"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              SKU <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.sku"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="PRD-001"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Product Type <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.type"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option v-for="opt in productTypes" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              v-model="form.active"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option :value="true">Active</option>
              <option :value="false">Inactive</option>
            </select>
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              v-model="form.description"
              rows="4"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="Product description..."
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Pricing -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Price <span class="text-red-500">*</span>
            </label>
            <input
              v-model.number="form.price"
              type="number"
              min="0"
              step="0.01"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Compare at Price</label>
            <input
              v-model.number="form.compareAtPrice"
              type="number"
              min="0"
              step="0.01"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="Original price"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            <select
              v-model="form.currency"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Inventory -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Inventory</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
            <input
              v-model.number="form.stock"
              type="number"
              min="0"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Low Stock Threshold</label>
            <input
              v-model.number="form.lowStockThreshold"
              type="number"
              min="0"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
            <input
              v-model.number="form.weight"
              type="number"
              min="0"
              step="0.01"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="Optional"
            />
          </div>
        </div>

        <div class="mt-4 flex items-center gap-6">
          <label class="flex items-center gap-2">
            <input
              v-model="form.isLimitedEdition"
              type="checkbox"
              class="w-4 h-4 text-primary-600 rounded"
            />
            <span class="text-sm text-gray-700">Limited Edition</span>
          </label>

          <div v-if="form.isLimitedEdition" class="flex items-center gap-2">
            <label class="text-sm text-gray-700">Edition Size:</label>
            <input
              v-model.number="form.editionSize"
              type="number"
              min="1"
              class="w-24 px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        </div>
      </div>

      <!-- Digital Product -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Digital Product</h2>
        <label class="flex items-center gap-2 mb-4">
          <input
            v-model="form.isDigital"
            type="checkbox"
            class="w-4 h-4 text-primary-600 rounded"
          />
          <span class="text-sm text-gray-700">This is a digital product</span>
        </label>

        <div v-if="form.isDigital">
          <UiImageUpload
            v-model="form.digitalFileUrl"
            label="Digital File"
            folder="products"
            :alt="form.name"
            accept="*/*"
          />
        </div>
      </div>

      <!-- Images (only for existing products) -->
      <div v-if="!isNew" class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">Images</h2>
          <button
            type="button"
            class="px-3 py-1 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            @click="openImageModal"
          >
            Add Image
          </button>
        </div>

        <div v-if="images.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            v-for="image in images"
            :key="image.id"
            class="relative group"
          >
            <img
              :src="image.url"
              :alt="image.altText || form.name"
              class="w-full h-32 object-cover rounded-lg border"
              :class="image.isPrimary ? 'border-primary-500 border-2' : 'border-gray-200'"
            />
            <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
              <button
                v-if="!image.isPrimary"
                type="button"
                class="p-1 bg-white rounded text-xs"
                @click="setPrimaryImage(image.id)"
              >
                Set Primary
              </button>
              <button
                type="button"
                class="p-1 bg-red-500 text-white rounded text-xs"
                @click="removeImage(image.id)"
              >
                Remove
              </button>
            </div>
            <span
              v-if="image.isPrimary"
              class="absolute top-2 left-2 px-2 py-0.5 bg-primary-500 text-white text-xs rounded"
            >
              Primary
            </span>
          </div>
        </div>
        <p v-else class="text-gray-500 text-center py-8">No images added yet</p>
      </div>

      <!-- Variants (only for existing products) -->
      <div v-if="!isNew" class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">Variants</h2>
          <button
            type="button"
            class="px-3 py-1 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            @click="openVariantModal()"
          >
            Add Variant
          </button>
        </div>

        <div v-if="variants.length > 0" class="space-y-2">
          <div
            v-for="variant in variants"
            :key="variant.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div>
              <p class="font-medium text-gray-900">{{ variant.name }}</p>
              <p class="text-sm text-gray-500">SKU: {{ variant.sku }} | Stock: {{ variant.stock }}</p>
            </div>
            <div class="flex items-center gap-4">
              <span class="font-medium">{{ formatPrice(variant.price) }}</span>
              <button
                type="button"
                class="text-primary-600 hover:text-primary-700 text-sm"
                @click="openVariantModal(variant)"
              >
                Edit
              </button>
              <button
                type="button"
                class="text-red-600 hover:text-red-800 text-sm"
                @click="deleteVariant(variant.id)"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
        <p v-else class="text-gray-500 text-center py-8">No variants added yet</p>
      </div>

      <!-- Form Actions -->
      <div class="flex items-center gap-4 pt-4">
        <button
          type="submit"
          :disabled="loading"
          class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Saving...' : (isNew ? 'Create Product' : 'Update Product') }}
        </button>
        <NuxtLink
          to="/admin/products"
          class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          Cancel
        </NuxtLink>
      </div>
    </form>

    <!-- Variant Modal -->
    <div
      v-if="showVariantModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showVariantModal = false"
    >
      <div class="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          {{ editingVariant ? 'Edit Variant' : 'Add Variant' }}
        </h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              v-model="variantForm.name"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g., Small, Red"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">SKU</label>
            <input
              v-model="variantForm.sku"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input
                v-model.number="variantForm.price"
                type="number"
                min="0"
                step="0.01"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input
                v-model.number="variantForm.stock"
                type="number"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button
            class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            @click="showVariantModal = false"
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            @click="saveVariant"
          >
            {{ editingVariant ? 'Update' : 'Add' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Image Modal -->
    <div
      v-if="showImageModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showImageModal = false"
    >
      <div class="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Add Image</h3>
        <div class="space-y-4">
          <UiImageUpload
            v-model="imageForm.url"
            label="Image"
            folder="products"
            :alt="imageForm.altText || form.name"
            preview-aspect="square"
          />
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
            <input
              v-model="imageForm.altText"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Image description"
            />
          </div>
          <label class="flex items-center gap-2">
            <input
              v-model="imageForm.isPrimary"
              type="checkbox"
              class="w-4 h-4 text-primary-600 rounded"
            />
            <span class="text-sm text-gray-700">Set as primary image</span>
          </label>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button
            class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            @click="showImageModal = false"
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            @click="addImage"
          >
            Add Image
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showDeleteModal = false"
    >
      <div class="bg-white rounded-xl p-6 w-full max-w-md">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Delete Product</h3>
            <p class="text-sm text-gray-600">This action cannot be undone.</p>
          </div>
        </div>
        <p class="text-gray-600 mb-6">
          Are you sure you want to delete <span class="font-medium">"{{ form.name }}"</span>?
        </p>
        <div class="flex justify-end gap-3">
          <button
            class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            :disabled="isDeleting"
            @click="showDeleteModal = false"
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            :disabled="isDeleting"
            @click="deleteProduct"
          >
            {{ isDeleting ? 'Deleting...' : 'Delete Product' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
