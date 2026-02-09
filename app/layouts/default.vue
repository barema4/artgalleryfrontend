<template>
  <div class="min-h-screen bg-bark-100">
    <!-- Subtle African Pattern Background -->
    <div
      class="fixed inset-0 opacity-[0.02] pointer-events-none"
      style="background-image: url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23000000&quot;%3E%3Cpath d=&quot;M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"
    ></div>

    <!-- Centered App Container -->
    <div class="max-w-[1400px] mx-auto min-h-screen flex flex-col relative">
      <!-- App Card with Shadow -->
      <div class="flex-1 flex flex-col bg-white lg:mx-4 xl:mx-0 lg:shadow-2xl">
        <!-- Header - Inside Container -->
        <LayoutHeader />

        <!-- Main Content -->
        <main class="flex-1">
          <slot />
        </main>

        <!-- Footer - Inside Container -->
        <LayoutFooter />
      </div>
    </div>
  </div>
</template>