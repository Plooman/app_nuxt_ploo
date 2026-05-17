<template>
  <div>
    <!-- Konfirmasi -->
    <template v-if="state === 'confirm'">
      <h2 class="text-2xl font-bold text-gray-900 mb-1">Bukan kamu yang mendaftar?</h2>
      <p class="text-gray-500 text-sm mb-5">
        Seseorang mendaftarkan alamat email
        <strong class="text-gray-800">{{ email }}</strong>
        ke Ploo. Jika bukan kamu, batalkan pendaftaran di bawah.
      </p>
      <button
        class="w-full bg-red-600 text-white py-2.5 rounded-xl font-medium hover:bg-red-700 active:bg-red-800 transition-all"
        @click="confirmReject"
      >
        Ya, bukan saya — batalkan pendaftaran
      </button>
      <p class="text-xs text-gray-400 text-center mt-4 leading-relaxed">
        Jika kamu yang mendaftar, abaikan halaman ini dan masukkan kode OTP dari email.
      </p>
    </template>

    <!-- Loading -->
    <template v-else-if="state === 'loading'">
      <div class="text-center py-4">
        <div class="text-gray-400 text-sm">Memproses...</div>
      </div>
    </template>

    <!-- Berhasil ditolak -->
    <template v-else-if="state === 'done'">
      <div class="text-center">
        <div class="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">✓</div>
        <h2 class="text-xl font-bold text-gray-900 mb-2">Pendaftaran dibatalkan</h2>
        <p class="text-gray-500 text-sm leading-relaxed">
          Email <strong class="text-gray-800">{{ email }}</strong> telah diblokir
          dan tidak bisa digunakan untuk mendaftar lagi.
        </p>
        <NuxtLink
          to="/"
          class="mt-6 inline-block px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-all"
        >
          Kembali ke beranda
        </NuxtLink>
      </div>
    </template>

    <!-- Error -->
    <template v-else>
      <div class="text-center">
        <div class="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">⚠</div>
        <h2 class="text-xl font-bold text-gray-900 mb-2">{{ errorTitle }}</h2>
        <p class="text-gray-500 text-sm leading-relaxed">{{ errorMessage }}</p>
        <NuxtLink
          to="/"
          class="mt-6 inline-block px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-all"
        >
          Kembali ke beranda
        </NuxtLink>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const route = useRoute()
const email = (route.query.email as string) ?? ''
const token = (route.query.t as string) ?? ''

type State = 'confirm' | 'loading' | 'done' | 'error'
const state = ref<State>(!email || !token ? 'error' : 'confirm')
const errorTitle = ref('Link tidak valid')
const errorMessage = ref('Link penolakan ini tidak valid atau sudah kedaluarsa.')

async function confirmReject() {
  state.value = 'loading'
  try {
    await $fetch('/api/auth/reject-email', {
      method: 'POST',
      body: { email, token },
    })
    state.value = 'done'
  } catch (e: unknown) {
    const err = e as { statusCode?: number; statusMessage?: string }
    state.value = 'error'
    if (err.statusCode === 409) {
      errorTitle.value = 'Akun sudah aktif'
      errorMessage.value = 'Akun dengan email ini sudah dikonfirmasi. Jika ada aktivitas mencurigakan, hubungi kami.'
    } else if (err.statusCode === 429) {
      errorTitle.value = 'Terlalu banyak percobaan'
      errorMessage.value = 'Coba lagi beberapa saat lagi.'
    } else {
      errorTitle.value = 'Gagal memproses'
      errorMessage.value = err.statusMessage ?? 'Terjadi kesalahan. Coba lagi nanti.'
    }
  }
}
</script>
