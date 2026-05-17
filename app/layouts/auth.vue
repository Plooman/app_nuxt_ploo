<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-block">
          <span class="text-4xl font-black text-white tracking-tight">Ploo</span>
        </NuxtLink>
        <p class="text-slate-400 mt-2 text-sm">Platform belanja terpercaya</p>
      </div>
      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <slot />
      </div>
    </div>
  </div>
</template>
