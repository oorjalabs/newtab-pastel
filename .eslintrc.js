// eslint-disable-next-line no-undef
module.exports = {
    env: {
        browser: true,
        webextensions: true,
        jquery: true,
        es2021: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:import/typescript",
        "google",
        "plugin:@typescript-eslint/recommended",
    ],
    parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: __dirname,
        ecmaVersion: 12,
        ecmaFeatures: {
            jsx: false,
        },
        sourceType: "module",
    },
    plugins: [
        "@typescript-eslint",
        "import",
    ],
    rules: {
        quotes: ["error", "double"],
        indent: ["error", 4, {
            SwitchCase: 1
        }],
        "max-len": ["warn", 120],
        "arrow-parens": ["error", "as-needed"],
        "comma-dangle": ["error", {
            arrays: "always-multiline",
            objects: "always-multiline",
            imports: "always-multiline",
            exports: "always-multiline",
            functions: "never",
        }],
        "no-trailing-spaces": ["warn"],
    },
    overrides: [{
        // We don't want to document types for typescript files which have types defined
        files: ["*.ts", "*.tsx"],
        rules: {
            "valid-jsdoc": ["error", {
                requireReturnType: false,
                requireParamType: false,
                requireReturn: false,
                requireReturnDescription: false,
                requireParamDescription: false
            }]
        }
    }],
    ignorePatterns: [
        "**/*.txt",
        "**/*.md",
        "**/*.js",
        "src/js/ext/**",
    ],
};
