import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.ploo.app',
  appName: 'Ploo',
  // Nuxt generate menghasilkan static files di .output/public/
  webDir: '.output/public',
  server: {
    androidScheme: 'https',
    // Untuk dev: uncomment baris di bawah agar app mobile connect ke dev server
    // url: 'http://192.168.x.x:3000',
    // cleartext: true,
  },
}

export default config
