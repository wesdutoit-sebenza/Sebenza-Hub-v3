declare module 'scribe.js-ocr' {
  interface ExtractResult {
    text: string;
    confidence?: number;
  }
  
  interface Scribe {
    extractText(files: string[]): Promise<ExtractResult[]>;
  }
  
  const scribe: Scribe;
  export default scribe;
}
