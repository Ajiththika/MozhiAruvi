import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default [
    js.configs.recommended,
    prettier,
    {
        files: ["**/*.js"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                ...globals.node,
                ...globals.mocha,
            },
        },
        rules: {
            "no-unused-vars": "warn",
            "no-console": "off",
            "no-process-exit": "off",
        },
    },
];
