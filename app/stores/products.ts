import { defineStore } from 'pinia'
import type {
  Product,
  ProductListParams,
  CreateProductData,
  UpdateProductData,
  UpdateStockData,
  CreateProductVariantData,
  UpdateProductVariantData,
  CreateProductImageData,
  ProductType,
} from '~/types/product'
import { useProductService } from '~/services/product.service'

interface ProductsState {
  products: Product[]
  currentProduct: Product | null
  loading: boolean
  error: string | null
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  filters: {
    type: ProductType | null
    search: string
    minPrice: number | null
    maxPrice: number | null
    inStock: boolean | null
    sortBy: ProductListParams['sortBy']
  }
}

export const useProductsStore = defineStore('products', {
  state: (): ProductsState => ({
    products: [],
    currentProduct: null,
    loading: false,
    error: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 0,
    },
    filters: {
      type: null,
      search: '',
      minPrice: null,
      maxPrice: null,
      inStock: null,
      sortBy: 'newest',
    },
  }),

  getters: {
    hasProducts: (state) => state.products.length > 0,

    activeProducts: (state) => state.products.filter((p) => p.active),

    inStockProducts: (state) => state.products.filter((p) => p.stock > 0),

    productsByType: (state) => (type: ProductType) =>
      state.products.filter((p) => p.type === type),

    hasMorePages: (state) => state.pagination.page < state.pagination.totalPages,

    primaryImage: (state) => (product: Product) => {
      if (!product.images || product.images.length === 0) return null
      return product.images.find((img) => img.isPrimary) || product.images[0]
    },

    isOnSale: () => (product: Product) => {
      return product.compareAtPrice && product.compareAtPrice > product.price
    },

    discountPercentage: () => (product: Product) => {
      if (!product.compareAtPrice || product.compareAtPrice <= product.price) return 0
      return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    },

    formattedPrice: () => (product: Product) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: product.currency || 'USD',
      }).format(product.price)
    },
  },

  actions: {
    async fetchProducts(params?: ProductListParams) {
      this.loading = true
      this.error = null

      try {
        const productService = useProductService()
        const mergedParams: ProductListParams = {
          page: params?.page || this.pagination.page,
          limit: params?.limit || this.pagination.limit,
          type: params?.type || this.filters.type || undefined,
          search: params?.search || this.filters.search || undefined,
          minPrice: params?.minPrice ?? this.filters.minPrice ?? undefined,
          maxPrice: params?.maxPrice ?? this.filters.maxPrice ?? undefined,
          inStock: params?.inStock ?? this.filters.inStock ?? undefined,
          sortBy: params?.sortBy || this.filters.sortBy,
          active: true,
        }

        const response = await productService.getProducts(mergedParams)
        this.products = response.data
        this.pagination = {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch products'
        throw err
      } finally {
        this.loading = false
      }
    },

    async loadMore() {
      if (!this.hasMorePages || this.loading) return

      this.loading = true
      this.error = null

      try {
        const productService = useProductService()
        const response = await productService.getProducts({
          page: this.pagination.page + 1,
          limit: this.pagination.limit,
          type: this.filters.type || undefined,
          search: this.filters.search || undefined,
          minPrice: this.filters.minPrice ?? undefined,
          maxPrice: this.filters.maxPrice ?? undefined,
          inStock: this.filters.inStock ?? undefined,
          sortBy: this.filters.sortBy,
          active: true,
        })

        this.products = [...this.products, ...response.data]
        this.pagination = {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to load more products'
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchProductBySlug(slug: string) {
      this.loading = true
      this.error = null

      try {
        const productService = useProductService()
        this.currentProduct = await productService.getProductBySlug(slug)
        return this.currentProduct
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch product'
        this.currentProduct = null
        throw err
      } finally {
        this.loading = false
      }
    },

    async createProduct(data: CreateProductData) {
      this.loading = true
      this.error = null

      try {
        const productService = useProductService()
        const product = await productService.createProduct(data)
        this.products.unshift(product)
        return product
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to create product'
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateProduct(id: string, data: UpdateProductData) {
      this.loading = true
      this.error = null

      try {
        const productService = useProductService()
        const updated = await productService.updateProduct(id, data)

        const index = this.products.findIndex((p) => p.id === id)
        if (index !== -1) {
          this.products[index] = updated
        }

        if (this.currentProduct?.id === id) {
          this.currentProduct = updated
        }

        return updated
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to update product'
        throw err
      } finally {
        this.loading = false
      }
    },

    async deleteProduct(id: string) {
      this.loading = true
      this.error = null

      try {
        const productService = useProductService()
        await productService.deleteProduct(id)

        this.products = this.products.filter((p) => p.id !== id)

        if (this.currentProduct?.id === id) {
          this.currentProduct = null
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to delete product'
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateStock(id: string, data: UpdateStockData) {
      this.error = null

      try {
        const productService = useProductService()
        const updated = await productService.updateStock(id, data)

        const index = this.products.findIndex((p) => p.id === id)
        if (index !== -1) {
          this.products[index] = updated
        }

        if (this.currentProduct?.id === id) {
          this.currentProduct = updated
        }

        return updated
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to update stock'
        throw err
      }
    },

    setFilters(filters: Partial<ProductsState['filters']>) {
      this.filters = { ...this.filters, ...filters }
      this.pagination.page = 1
    },

    clearFilters() {
      this.filters = {
        type: null,
        search: '',
        minPrice: null,
        maxPrice: null,
        inStock: null,
        sortBy: 'newest',
      }
      this.pagination.page = 1
    },

    clearCurrentProduct() {
      this.currentProduct = null
    },

    clearError() {
      this.error = null
    },

    // Variant Management Actions
    async createVariant(productId: string, data: CreateProductVariantData) {
      this.loading = true
      this.error = null

      try {
        const productService = useProductService()
        const variant = await productService.createVariant(productId, data)

        // Update product in list if present
        const index = this.products.findIndex((p) => p.id === productId)
        if (index !== -1 && this.products[index].variants) {
          this.products[index].variants.push(variant)
        }

        // Update current product if it matches
        if (this.currentProduct?.id === productId && this.currentProduct.variants) {
          this.currentProduct.variants.push(variant)
        }

        return { success: true, data: variant }
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to create variant'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async updateVariant(productId: string, variantId: string, data: UpdateProductVariantData) {
      this.loading = true
      this.error = null

      try {
        const productService = useProductService()
        const variant = await productService.updateVariant(productId, variantId, data)

        // Update product in list if present
        const productIndex = this.products.findIndex((p) => p.id === productId)
        if (productIndex !== -1 && this.products[productIndex].variants) {
          const variantIndex = this.products[productIndex].variants.findIndex((v) => v.id === variantId)
          if (variantIndex !== -1) {
            this.products[productIndex].variants[variantIndex] = variant
          }
        }

        // Update current product if it matches
        if (this.currentProduct?.id === productId && this.currentProduct.variants) {
          const variantIndex = this.currentProduct.variants.findIndex((v) => v.id === variantId)
          if (variantIndex !== -1) {
            this.currentProduct.variants[variantIndex] = variant
          }
        }

        return { success: true, data: variant }
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to update variant'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async deleteVariant(productId: string, variantId: string) {
      this.loading = true
      this.error = null

      try {
        const productService = useProductService()
        await productService.deleteVariant(productId, variantId)

        // Update product in list if present
        const productIndex = this.products.findIndex((p) => p.id === productId)
        if (productIndex !== -1 && this.products[productIndex].variants) {
          this.products[productIndex].variants = this.products[productIndex].variants.filter(
            (v) => v.id !== variantId
          )
        }

        // Update current product if it matches
        if (this.currentProduct?.id === productId && this.currentProduct.variants) {
          this.currentProduct.variants = this.currentProduct.variants.filter((v) => v.id !== variantId)
        }

        return { success: true }
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to delete variant'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Image Management Actions
    async addImage(productId: string, data: CreateProductImageData) {
      this.loading = true
      this.error = null

      try {
        const productService = useProductService()
        const image = await productService.addImage(productId, data)

        // Update product in list if present
        const index = this.products.findIndex((p) => p.id === productId)
        if (index !== -1 && this.products[index].images) {
          this.products[index].images.push(image)
        }

        // Update current product if it matches
        if (this.currentProduct?.id === productId && this.currentProduct.images) {
          this.currentProduct.images.push(image)
        }

        return { success: true, data: image }
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to add image'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async removeImage(productId: string, imageId: string) {
      this.loading = true
      this.error = null

      try {
        const productService = useProductService()
        await productService.removeImage(productId, imageId)

        // Update product in list if present
        const productIndex = this.products.findIndex((p) => p.id === productId)
        if (productIndex !== -1 && this.products[productIndex].images) {
          this.products[productIndex].images = this.products[productIndex].images.filter(
            (img) => img.id !== imageId
          )
        }

        // Update current product if it matches
        if (this.currentProduct?.id === productId && this.currentProduct.images) {
          this.currentProduct.images = this.currentProduct.images.filter((img) => img.id !== imageId)
        }

        return { success: true }
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to remove image'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async setPrimaryImage(productId: string, imageId: string) {
      this.loading = true
      this.error = null

      try {
        const productService = useProductService()
        await productService.setPrimaryImage(productId, imageId)

        // Helper to update images array
        const updateImages = (images: typeof this.currentProduct.images) => {
          if (!images) return
          images.forEach((img) => {
            img.isPrimary = img.id === imageId
          })
        }

        // Update product in list if present
        const productIndex = this.products.findIndex((p) => p.id === productId)
        if (productIndex !== -1) {
          updateImages(this.products[productIndex].images)
        }

        // Update current product if it matches
        if (this.currentProduct?.id === productId) {
          updateImages(this.currentProduct.images)
        }

        return { success: true }
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to set primary image'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },
  },
})
