export default defineNuxtConfig({
  compatibilityDate: "2026-08-01",
  css: ["~/assets/app.css"],
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag.startsWith("updog-"),
    },
  },
  hooks: {
    "build:manifest": (manifest) => {
      for (const entry of Object.values(manifest)) {
        if (entry.isDynamicEntry) {
          entry.prefetch = false;
          entry.preload = false;
        }
      }
    },
  },
});
