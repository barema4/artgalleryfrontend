<script setup lang="ts">
const orderNumber = computed(() => {
  return 'ORD-' + Math.random().toString(36).substring(2, 10).toUpperCase()
})

const estimatedDelivery = computed(() => {
  const date = new Date()
  date.setDate(date.getDate() + 7)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
})
</script>

<template>
  <div class="min-h-screen bg-mudcloth-cream py-16 px-4">
    <div class="max-w-lg mx-auto text-center">
      <!-- Success Icon -->
      <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg class="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <!-- Title -->
      <h1 class="text-3xl font-display font-bold text-bark-800 mb-2">Thank You!</h1>
      <p class="text-lg text-bark-600 mb-8">Your order has been placed successfully.</p>

      <!-- Order Details Card -->
      <div class="bg-white rounded-2xl border border-earth-100 p-6 mb-8 text-left">
        <div class="space-y-4">
          <div class="flex justify-between items-center pb-4 border-b border-earth-100">
            <span class="text-bark-600">Order Number</span>
            <span class="font-mono font-semibold text-bark-800">{{ orderNumber }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-bark-600">Estimated Delivery</span>
            <span class="font-medium text-bark-800">{{ estimatedDelivery }}</span>
          </div>
        </div>
      </div>

      <!-- Info -->
      <div class="bg-primary-50 rounded-xl p-4 mb-8">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p class="text-sm text-primary-700 text-left">
            A confirmation email with your order details and tracking information will be sent to your email address.
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <NuxtLink
          to="/shop"
          class="px-8 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
        >
          Continue Shopping
        </NuxtLink>
        <NuxtLink
          to="/dashboard"
          class="px-8 py-3 border border-earth-200 text-bark-700 font-semibold rounded-xl hover:bg-earth-50 transition-colors"
        >
          View Orders
        </NuxtLink>
      </div>

      <!-- Support -->
      <p class="mt-8 text-sm text-bark-500">
        Need help? <a href="mailto:support@afrikacrafts.com" class="text-primary-600 hover:underline">Contact Support</a>
      </p>
    </div>
  </div>
</template>
