// import { dirname } from "path";
// import { fileURLToPath } from "url";
// import { FlatCompat } from "@eslint/eslintrc";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const compat = new FlatCompat({
//   baseDirectory: __dirname,
// });

// const eslintConfig = [
//   ...compat.extends("next/core-web-vitals", "next/typescript"),
// ];

// export default eslintConfig;

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Extend Next.js recommended configs
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    rules: {
      // Your custom rules
      "@typescript-eslint/no-explicit-any": "off",           // ignore 'any' errors
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "prefer-const": "warn",
      "react-hooks/exhaustive-deps": "off",
      "@next/next/no-img-element": "warn",

      // Keep your existing rules
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];

export default eslintConfig;
