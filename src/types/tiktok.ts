// TikTok Pixel type definitions with Advanced Matching support
declare global {
  interface Window {
    ttq?: {
      track: (event: string, data?: any, advancedMatching?: any) => void;
    };
  }
}

export {};
