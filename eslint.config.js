import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(
  { ignores: ["*.d.ts", "**/coverage", "**/dist"] },
  {
    rules: {
      // Add custom rules here
    },
  }
);