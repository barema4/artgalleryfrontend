import { defineStore } from 'pinia'
import type {
  Product,
  ProductListParams,
  CreateProductData,
  UpdateProductData,
  UpdateStockData,
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
  },
})
