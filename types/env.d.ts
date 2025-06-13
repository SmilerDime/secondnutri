declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_GOOGLE_VISION_API_KEY: string;
      EXPO_PUBLIC_GEMINI_API_KEY: string;
    }
  }
}

export {};