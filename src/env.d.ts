/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  Quill: new (selector: string, options: unknown) => {
    root: HTMLElement;
    getText(): string;
    setText(value: string): void;
  };
}
