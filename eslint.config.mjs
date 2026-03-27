// ioBroker eslint template configuration file for js and ts files

import config from "@iobroker/eslint-config";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default [
    ...config,
    eslintPluginPrettierRecommended,
    {
        ignores: [
            ".dev-server/",
            ".vscode/",
            "*.test.js",
            "test/**/*.js",
            "*.config.mjs",
            "build",
            "dist",
            "admin/build",
            "admin/words.js",
            "admin/admin.d.ts",
            "admin/blockly.js",
            "**/adapter-config.d.ts",
        ],
    },
    {
        rules: {
            "jsdoc/require-jsdoc": "warn",
            "jsdoc/require-param": "warn",
            "jsdoc/require-param-description": "warn",
            "jsdoc/require-returns-description": "warn",
            "jsdoc/require-returns-check": "warn",
            "jsdoc/no-types": "off",
        },
    },
    {
        files: ["**/*.js", "**/*.mjs", "**/*.ts", "**/*.tsx"],
        rules: {
            "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }]
        }
    },
];