import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.ploo.app',
  appName: 'Ploo',
  webDir: '.output/public',
  server: {
    androidScheme: 'https',
  },
}

export default config
