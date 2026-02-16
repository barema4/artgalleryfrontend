<script setup lang="ts">
import { useCartStore, type CartItem } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'

const cartStore = useCartStore()
const authStore = useAuthStore()
const router = useRouter()

watchEffect(() => {
  if (cartStore.isEmpty) {
    router.push('/cart')
  }
})

const currentStep = ref(1)
const isProcessing = ref(false)
const error = ref('')

const shippingForm = reactive({
  firstName: authStore.user?.profile?.firstName || '',
  lastName: authStore.user?.profile?.lastName || '',
  email: authStore.user?.email || '',
  phone: '',
  address: '',
  apartment: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'United States',
})

const billingForm = reactive({
  sameAsShipping: true,
  firstName: '',
  lastName: '',
  address: '',
  apartment: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'United States',
})

const paymentForm = reactive({
  cardNumber: '',
  cardName: '',
  expiry: '',
  cvc: '',
})

const shippingErrors = reactive<Record<string, string>>({})
const paymentErrors = reactive<Record<string, string>>({})

function validateShipping(): boolean {
  Object.keys(shippingErrors).forEach(key => delete shippingErrors[key])

  if (!shippingForm.firstName.trim()) shippingErrors.firstName = 'First name is required'
  if (!shippingForm.lastName.trim()) shippingErrors.lastName = 'Last name is required'
  if (!shippingForm.email.trim()) shippingErrors.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingForm.email)) shippingErrors.email = 'Invalid email address'
  if (!shippingForm.address.trim()) shippingErrors.address = 'Address is required'
  if (!shippingForm.city.trim()) shippingErrors.city = 'City is required'
  if (!shippingForm.state.trim()) shippingErrors.state = 'State is required'
  if (!shippingForm.postalCode.trim()) shippingErrors.postalCode = 'Postal code is required'

  return Object.keys(shippingErrors).length === 0
}

function validatePayment(): boolean {
  Object.keys(paymentErrors).forEach(key => delete paymentErrors[key])

  if (!paymentForm.cardNumber.trim()) paymentErrors.cardNumber = 'Card number is required'
  else if (paymentForm.cardNumber.replace(/\s/g, '').length < 16) paymentErrors.cardNumber = 'Invalid card number'
  if (!paymentForm.cardName.trim()) paymentErrors.cardName = 'Name on card is required'
  if (!paymentForm.expiry.trim()) paymentErrors.expiry = 'Expiry date is required'
  else if (!/^\d{2}\/\d{2}$/.test(paymentForm.expiry)) paymentErrors.expiry = 'Use MM/YY format'
  if (!paymentForm.cvc.trim()) paymentErrors.cvc = 'CVC is required'
  else if (paymentForm.cvc.length < 3) paymentErrors.cvc = 'Invalid CVC'

  return Object.keys(paymentErrors).length === 0
}

function goToStep(step: number) {
  if (step === 2 && !validateShipping()) return
  currentStep.value = step
}

function formatCardNumber(e: Event) {
  const input = e.target as HTMLInputElement
  let value = input.value.replace(/\D/g, '')
  value = value.substring(0, 16)
  value = value.replace(/(\d{4})(?=\d)/g, '$1 ')
  paymentForm.cardNumber = value
}

function formatExpiry(e: Event) {
  const input = e.target as HTMLInputElement
  let value = input.value.replace(/\D/g, '')
  value = value.substring(0, 4)
  if (value.length >= 2) {
    value = value.substring(0, 2) + '/' + value.substring(2)
  }
  paymentForm.expiry = value
}

function formatCvc(e: Event) {
  const input = e.target as HTMLInputElement
  paymentForm.cvc = input.value.replace(/\D/g, '').substring(0, 4)
}

async function handleSubmit() {
  if (!validatePayment()) return

  isProcessing.value = true
  error.value = ''

  try {
    await new Promise(resolve => setTimeout(resolve, 2000))

    cartStore.clearCart()
    router.push('/checkout/success')
  } catch (e) {
    error.value = 'Payment failed. Please try again.'
  } finally {
    isProcessing.value = false
  }
}

function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price)
}

function getItemPrice(item: CartItem): number {
  return item.variant?.price || item.product.price
}

function getPrimaryImage(item: CartItem): string | null {
  const images = item.product.images
  if (!images || images.length === 0) return null
  const primary = images.find((img) => img.isPrimary)
  return primary?.url || images[0]?.url || null
}

const estimatedShipping = computed(() => {
  if (cartStore.isEmpty) return 0
  if (cartStore.subtotal >= 100) return 0
  return 9.99
})

const tax = computed(() => {
  return cartStore.subtotal * 0.08
})

const orderTotal = computed(() => {
  return cartStore.subtotal + estimatedShipping.value + tax.value
})

const countries = [
  'United States',
  'Canada',
  'United Kingdom',
  'Nigeria',
  'Ghana',
  'Kenya',
  'South Africa',
  'Other',
]
</script>

<template>
  <div class="min-h-screen bg-mudcloth-cream py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <div class="mb-8">
        <NuxtLink to="/cart" class="inline-flex items-center gap-2 text-bark-500 hover:text-primary-600 mb-4 transition-colors">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Cart
        </NuxtLink>
        <h1 class="text-3xl font-display font-bold text-bark-800">Checkout</h1>
      </div>

      <div class="mb-8">
        <div class="flex items-center justify-center">
          <div class="flex items-center">
            <div class="flex items-center">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors"
                :class="currentStep >= 1 ? 'bg-primary-500 text-white' : 'bg-earth-200 text-bark-500'"
              >
                <svg v-if="currentStep > 1" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span v-else>1</span>
              </div>
              <span class="ml-2 font-medium text-bark-700 hidden sm:inline">Shipping</span>
            </div>

            <div class="w-16 sm:w-24 h-1 mx-2" :class="currentStep > 1 ? 'bg-primary-500' : 'bg-earth-200'"></div>

            <div class="flex items-center">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors"
                :class="currentStep >= 2 ? 'bg-primary-500 text-white' : 'bg-earth-200 text-bark-500'"
              >
                <svg v-if="currentStep > 2" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span v-else>2</span>
              </div>
              <span class="ml-2 font-medium text-bark-700 hidden sm:inline">Payment</span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col lg:flex-row gap-8">
        <div class="flex-1">
          <div v-if="currentStep === 1" class="bg-white rounded-2xl border border-earth-100 p-6">
            <h2 class="text-xl font-semibold text-bark-800 mb-6">Shipping Information</h2>

            <form @submit.prevent="goToStep(2)">
              <div class="mb-6">
                <h3 class="text-sm font-medium text-bark-600 mb-4">Contact Information</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-bark-700 mb-1">First Name *</label>
                    <input
                      v-model="shippingForm.firstName"
                      type="text"
                      class="w-full px-4 py-3 border rounded-xl bg-white text-bark-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                      :class="shippingErrors.firstName ? 'border-kente-red' : 'border-earth-200'"
                    />
                    <p v-if="shippingErrors.firstName" class="mt-1 text-sm text-kente-red">{{ shippingErrors.firstName }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-bark-700 mb-1">Last Name *</label>
                    <input
                      v-model="shippingForm.lastName"
                      type="text"
                      class="w-full px-4 py-3 border rounded-xl bg-white text-bark-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                      :class="shippingErrors.lastName ? 'border-kente-red' : 'border-earth-200'"
                    />
                    <p v-if="shippingErrors.lastName" class="mt-1 text-sm text-kente-red">{{ shippingErrors.lastName }}</p>
                  </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label class="block text-sm font-medium text-bark-700 mb-1">Email *</label>
                    <input
                      v-model="shippingForm.email"
                      type="email"
                      class="w-full px-4 py-3 border rounded-xl bg-white text-bark-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                      :class="shippingErrors.email ? 'border-kente-red' : 'border-earth-200'"
                    />
                    <p v-if="shippingErrors.email" class="mt-1 text-sm text-kente-red">{{ shippingErrors.email }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-bark-700 mb-1">Phone</label>
                    <input
                      v-model="shippingForm.phone"
                      type="tel"
                      class="w-full px-4 py-3 border border-earth-200 rounded-xl bg-white text-bark-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div class="mb-6">
                <h3 class="text-sm font-medium text-bark-600 mb-4">Shipping Address</h3>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-bark-700 mb-1">Address *</label>
                    <input
                      v-model="shippingForm.address"
                      type="text"
                      placeholder="Street address"
                      class="w-full px-4 py-3 border rounded-xl bg-white text-bark-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                      :class="shippingErrors.address ? 'border-kente-red' : 'border-earth-200'"
                    />
                    <p v-if="shippingErrors.address" class="mt-1 text-sm text-kente-red">{{ shippingErrors.address }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-bark-700 mb-1">Apartment, suite, etc.</label>
                    <input
                      v-model="shippingForm.apartment"
                      type="text"
                      class="w-full px-4 py-3 border border-earth-200 rounded-xl bg-white text-bark-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    />
                  </div>
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div class="col-span-2 sm:col-span-1">
                      <label class="block text-sm font-medium text-bark-700 mb-1">City *</label>
                      <input
                        v-model="shippingForm.city"
                        type="text"
                        class="w-full px-4 py-3 border rounded-xl bg-white text-bark-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                        :class="shippingErrors.city ? 'border-kente-red' : 'border-earth-200'"
                      />
                      <p v-if="shippingErrors.city" class="mt-1 text-sm text-kente-red">{{ shippingErrors.city }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-bark-700 mb-1">State *</label>
                      <input
                        v-model="shippingForm.state"
                        type="text"
                        class="w-full px-4 py-3 border rounded-xl bg-white text-bark-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                        :class="shippingErrors.state ? 'border-kente-red' : 'border-earth-200'"
                      />
                      <p v-if="shippingErrors.state" class="mt-1 text-sm text-kente-red">{{ shippingErrors.state }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-bark-700 mb-1">Postal Code *</label>
                      <input
                        v-model="shippingForm.postalCode"
                        type="text"
                        class="w-full px-4 py-3 border rounded-xl bg-white text-bark-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                        :class="shippingErrors.postalCode ? 'border-kente-red' : 'border-earth-200'"
                      />
                      <p v-if="shippingErrors.postalCode" class="mt-1 text-sm text-kente-red">{{ shippingErrors.postalCode }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-bark-700 mb-1">Country</label>
                      <select
                        v-model="shippingForm.country"
                        class="w-full px-4 py-3 border border-earth-200 rounded-xl bg-white text-bark-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                      >
                        <option v-for="country in countries" :key="country" :value="country">
                          {{ country }}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                class="w-full py-3.5 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
              >
                Continue to Payment
              </button>
            </form>
          </div>

          <div v-if="currentStep === 2" class="bg-white rounded-2xl border border-earth-100 p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-bark-800">Payment</h2>
              <button
                class="text-sm text-primary-600 hover:text-primary-700 font-medium"
                @click="currentStep = 1"
              >
                Edit Shipping
              </button>
            </div>

            <div class="bg-earth-50 rounded-xl p-4 mb-6">
              <p class="text-sm text-bark-600">
                <span class="font-medium">Ship to:</span>
                {{ shippingForm.firstName }} {{ shippingForm.lastName }},
                {{ shippingForm.address }}{{ shippingForm.apartment ? `, ${shippingForm.apartment}` : '' }},
                {{ shippingForm.city }}, {{ shippingForm.state }} {{ shippingForm.postalCode }}
              </p>
            </div>

            <UiAlert v-if="error" type="error" class="mb-6" dismissible @dismiss="error = ''">
              {{ error }}
            </UiAlert>

            <form @submit.prevent="handleSubmit">
              <div class="mb-6">
                <h3 class="text-sm font-medium text-bark-600 mb-4">Card Information</h3>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-bark-700 mb-1">Card Number *</label>
                    <div class="relative">
                      <input
                        :value="paymentForm.cardNumber"
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        class="w-full px-4 py-3 pr-12 border rounded-xl bg-white text-bark-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                        :class="paymentErrors.cardNumber ? 'border-kente-red' : 'border-earth-200'"
                        @input="formatCardNumber"
                      />
                      <div class="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                        <svg class="h-6 text-bark-300" viewBox="0 0 36 24" fill="currentColor">
                          <rect width="36" height="24" rx="4" fill="currentColor"/>
                        </svg>
                      </div>
                    </div>
                    <p v-if="paymentErrors.cardNumber" class="mt-1 text-sm text-kente-red">{{ paymentErrors.cardNumber }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-bark-700 mb-1">Name on Card *</label>
                    <input
                      v-model="paymentForm.cardName"
                      type="text"
                      placeholder="John Doe"
                      class="w-full px-4 py-3 border rounded-xl bg-white text-bark-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                      :class="paymentErrors.cardName ? 'border-kente-red' : 'border-earth-200'"
                    />
                    <p v-if="paymentErrors.cardName" class="mt-1 text-sm text-kente-red">{{ paymentErrors.cardName }}</p>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-bark-700 mb-1">Expiry Date *</label>
                      <input
                        :value="paymentForm.expiry"
                        type="text"
                        placeholder="MM/YY"
                        class="w-full px-4 py-3 border rounded-xl bg-white text-bark-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                        :class="paymentErrors.expiry ? 'border-kente-red' : 'border-earth-200'"
                        @input="formatExpiry"
                      />
                      <p v-if="paymentErrors.expiry" class="mt-1 text-sm text-kente-red">{{ paymentErrors.expiry }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-bark-700 mb-1">CVC *</label>
                      <input
                        :value="paymentForm.cvc"
                        type="text"
                        placeholder="123"
                        class="w-full px-4 py-3 border rounded-xl bg-white text-bark-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                        :class="paymentErrors.cvc ? 'border-kente-red' : 'border-earth-200'"
                        @input="formatCvc"
                      />
                      <p v-if="paymentErrors.cvc" class="mt-1 text-sm text-kente-red">{{ paymentErrors.cvc }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mb-6">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    v-model="billingForm.sameAsShipping"
                    type="checkbox"
                    class="w-5 h-5 text-primary-500 border-earth-300 rounded focus:ring-primary-500/20"
                  />
                  <span class="text-bark-700">Billing address same as shipping</span>
                </label>
              </div>

              <button
                type="submit"
                :disabled="isProcessing"
                class="w-full py-3.5 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <svg v-if="isProcessing" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>{{ isProcessing ? 'Processing...' : `Pay ${formatPrice(orderTotal)}` }}</span>
              </button>

              <div class="flex items-center justify-center gap-2 mt-4 text-xs text-bark-500">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Your payment is secured with 256-bit SSL encryption</span>
              </div>
            </form>
          </div>
        </div>

        <div class="lg:w-96">
          <div class="bg-white rounded-2xl border border-earth-100 p-6 sticky top-24">
            <h2 class="text-lg font-semibold text-bark-800 mb-4">Order Summary</h2>

            <div class="space-y-4 mb-6 max-h-64 overflow-y-auto">
              <div
                v-for="item in cartStore.items"
                :key="item.id"
                class="flex gap-3"
              >
                <div class="relative w-16 h-16 flex-shrink-0 bg-earth-50 rounded-lg overflow-hidden">
                  <img
                    v-if="getPrimaryImage(item)"
                    :src="getPrimaryImage(item)!"
                    :alt="item.product.name"
                    class="w-full h-full object-cover"
                  />
                  <span class="absolute -top-1 -right-1 w-5 h-5 bg-bark-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {{ item.quantity }}
                  </span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-bark-800 line-clamp-1">{{ item.product.name }}</p>
                  <p v-if="item.variant" class="text-xs text-bark-500">{{ item.variant.name }}</p>
                  <p class="text-sm font-medium text-bark-700 mt-1">
                    {{ formatPrice(getItemPrice(item) * item.quantity, item.product.currency) }}
                  </p>
                </div>
              </div>
            </div>

            <div class="border-t border-earth-200 pt-4 space-y-3">
              <div class="flex justify-between text-bark-600">
                <span>Subtotal</span>
                <span>{{ cartStore.formattedSubtotal }}</span>
              </div>
              <div class="flex justify-between text-bark-600">
                <span>Shipping</span>
                <span :class="estimatedShipping === 0 ? 'text-green-600' : ''">
                  {{ estimatedShipping === 0 ? 'FREE' : formatPrice(estimatedShipping) }}
                </span>
              </div>
              <div class="flex justify-between text-bark-600">
                <span>Tax (8%)</span>
                <span>{{ formatPrice(tax) }}</span>
              </div>
            </div>

            <div class="border-t border-earth-200 mt-4 pt-4">
              <div class="flex justify-between">
                <span class="text-lg font-semibold text-bark-800">Total</span>
                <span class="text-xl font-bold text-bark-800">{{ formatPrice(orderTotal) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
