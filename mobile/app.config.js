const appUrl = process.env.EXPO_PUBLIC_CIPHERFORGE_URL || 'https://nebularc18.github.io/CipherBox/';
const buildProfile = process.env.EAS_BUILD_PROFILE;
const allowCleartext = appUrl.startsWith('http://') && buildProfile !== 'production';

export default {
  expo: {
    name: 'CipherForge',
    slug: 'cipherforge-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'dark',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#09090b',
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      package: 'com.cipherbox.app',
      ...(allowCleartext ? { usesCleartextTraffic: true } : {}),
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#09090b',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: './assets/favicon.png',
    },
  },
};
