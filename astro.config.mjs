// @ts-check
import { defineConfig, envField } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import remarkBreaks from 'remark-breaks';

// https://astro.build/config
export default defineConfig({
  markdown: {
    remarkPlugins: [remarkBreaks],
  },
  vite: {
    plugins: [tailwindcss()],
  },
  env: {
    schema: {
      DROPBOX_ACCESS_TOKEN: envField.string({ context: "server", access: "secret" }),
      DROPBOX_FOLDER_PATH: envField.string({ context: "server", access: "secret" }),
      LOCALE: envField.string({ context: "client", access: "public", default: "en" }),
    }
  }
});
