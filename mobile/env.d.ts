export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_CIPHERFORGE_URL?: string;
    }
  }
}
